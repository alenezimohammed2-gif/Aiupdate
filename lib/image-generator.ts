import { getSupabaseAdmin } from "./supabase";

const DEFAULT_IMAGE_MODEL = "google/gemini-3-pro-image-preview";
const FALLBACK_IMAGE_MODEL = "google/gemini-2.5-flash-image";

// Blocked keywords in image URLs — these are not article images
const BLOCKED_KEYWORDS = [
  "logo", "favicon", "brand", "icon",
  "ad-", "ads/", "banner", "sponsor",
  "pixel", "tracker", "analytics",
  "placeholder", "default", "avatar",
];

// Known CDN domains used by news sites for hosting article images
const KNOWN_CDNS = [
  // General CDNs
  "wp.com", "squarespace.com", "googleapis.com", "cloudfront.net",
  "amazonaws.com", "akamaized.net", "imgix.net", "cloudinary.com",
  "fastly.net", "cdn.shortpixel.ai",
  // News-specific CDNs
  "huggingface.co", "regmedia.co.uk",
  "cbsistatic.com", "cbsnewsstatic.com",     // ZDNet, CNET (CBS/Paramount)
  "techcrunch.com", "engadget.com",
  "vox-cdn.com", "voxmedia.com",             // The Verge, Vox
  "arsTechnica.com",
  "wired.com", "condenast.io", "condenastdigital.com", // Wired, Condé Nast
  "venturebeat.com",
  "siliconangle.com",
  "techrepublic.com",
  "media.wired.com",
  "duet-cdn.vox-cdn.com",
  "cdn.vox-cdn.com",
  "platform.theverge.com",
  // Image hosting services
  "imgur.com", "i.imgur.com",
  "medium.com", "miro.medium.com",
  "substack.com", "substackcdn.com",
  "ghost.io", "ghost.org",
  "gravatar.com",
  // Cloud providers
  "storage.googleapis.com", "lh3.googleusercontent.com",
  "blob.core.windows.net",                   // Azure
  "digitaloceanspaces.com",
  "r2.cloudflarestorage.com",
  "imagekit.io",
  // News wire / media
  "reuters.com", "reutersconnect.com",
  "apnews.com",
  "gettyimages.com", "gstatic.com",
];

/**
 * Try to extract og:image from the article's source page
 * Returns the image URL if found and valid, null otherwise
 */
export async function extractSourceImage(
  sourceUrl: string
): Promise<string | null> {
  try {
    console.log(`[Image Extract] Fetching source page: ${sourceUrl}`);

    const res = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "AI-Pulse-News-Bot/1.0" },
    });

    if (!res.ok) {
      console.log(`[Image Extract] FAILED - HTTP ${res.status} for ${sourceUrl}`);
      return null;
    }

    const html = await res.text();

    // Extract og:image (try both attribute orders)
    const ogImage =
      html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/
      )?.[1] ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/
      )?.[1];

    if (!ogImage) {
      console.log(`[Image Extract] NO og:image found in HTML for ${sourceUrl}`);
      return null;
    }

    console.log(`[Image Extract] Found og:image: ${ogImage.slice(0, 100)}`);

    // Validate: must be a full URL
    if (!ogImage.startsWith("http")) {
      console.log(`[Image Extract] REJECTED - not a full URL: ${ogImage.slice(0, 60)}`);
      return null;
    }

    // Check against blocked keywords
    const urlLower = ogImage.toLowerCase();
    for (const keyword of BLOCKED_KEYWORDS) {
      if (urlLower.includes(keyword)) {
        console.log(`[Image Extract] REJECTED - blocked keyword "${keyword}" in: ${ogImage.slice(0, 80)}`);
        return null;
      }
    }

    // Check: image must be from same domain or known CDN (not third-party ads)
    const sourceHost = new URL(sourceUrl).hostname.replace("www.", "");
    const imageHost = new URL(ogImage).hostname.replace("www.", "");
    const isKnownCDN = KNOWN_CDNS.some((cdn) => imageHost.includes(cdn));

    if (!imageHost.includes(sourceHost.split(".").slice(-2).join(".")) && !isKnownCDN) {
      console.log(`[Image Extract] REJECTED - unknown domain: "${imageHost}" (source: "${sourceHost}"). Consider adding to KNOWN_CDNS.`);
      return null;
    }

    console.log(`[Image Extract] SUCCESS - extracted from ${imageHost}: ${ogImage.slice(0, 80)}`);
    return ogImage;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[Image Extract] ERROR for ${sourceUrl}: ${message}`);
    return null;
  }
}

/**
 * Get an image for an article:
 * 1. Try extracting from source page (free)
 * 2. Fall back to AI generation (paid)
 */
export async function getArticleImage(
  title: string,
  category: string,
  articleId: string,
  sourceUrl: string,
  model?: string,
  imagePrompt?: string | null,
  imageStyle?: string | null,
  imageColors?: string | null
): Promise<string | null> {
  console.log(`[Image] Processing image for: "${title.slice(0, 60)}"`);

  // Step 1: Try extracting from source page (free)
  const sourceImage = await extractSourceImage(sourceUrl);
  if (sourceImage) {
    console.log(`[Image] Using source image (free)`);
    return sourceImage;
  }

  // Step 2: Fall back to AI generation (paid)
  console.log(`[Image] Source extraction failed, falling back to AI generation`);
  const aiImage = await generateArticleImage(title, category, articleId, model, imagePrompt, imageStyle, imageColors);
  if (aiImage) return aiImage;

  // Step 3: Retry with fallback model if primary failed
  const primaryModel = model || DEFAULT_IMAGE_MODEL;
  if (primaryModel !== FALLBACK_IMAGE_MODEL) {
    console.log(`[Image] Primary model failed, retrying with fallback: ${FALLBACK_IMAGE_MODEL}`);
    return generateArticleImage(title, category, articleId, FALLBACK_IMAGE_MODEL, imagePrompt, imageStyle, imageColors);
  }

  return null;
}

/**
 * Generate an image using AI (Nano Banana Pro/2)
 */
export async function generateArticleImage(
  title: string,
  category: string,
  articleId: string,
  model?: string,
  imagePrompt?: string | null,
  imageStyle?: string | null,
  imageColors?: string | null
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[Image AI] FAILED - OPENROUTER_API_KEY is not set");
    return null;
  }

  const selectedModel = model || DEFAULT_IMAGE_MODEL;
  console.log(`[Image AI] Generating with model: ${selectedModel} for article: ${articleId}`);

  try {
    let prompt: string;

    if (imagePrompt && imageStyle && imageColors) {
      prompt = `Generate a professional thumbnail image for this AI news article. NO TEXT OR WORDS on the image.

Title: "${title}"

Visual element: ${imagePrompt}
Artistic style: ${imageStyle}
Color palette: ${imageColors}

Important: Do NOT include any text, letters, words, or watermarks in the image. Pure visual only. Make the image visually striking and professional.`;
    } else {
      console.log(`[Image AI] No custom prompt/style/colors provided, using generic prompt`);
      prompt = `Generate a professional thumbnail image for this AI news article. NO TEXT OR WORDS on the image.

Title: "${title}"

Create a visually striking image that represents the core topic of this article. Choose an appropriate artistic style and color palette that matches the subject matter. Make it professional and eye-catching.

Important: Do NOT include any text, letters, words, or watermarks in the image. Pure visual only.`;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unable to read body");
      if (response.status === 402) {
        console.error(`[Image AI] CREDITS LOW - OpenRouter credits insufficient. Add credits at https://openrouter.ai/settings/credits. Response: ${errorBody.slice(0, 200)}`);
      } else if (response.status === 429) {
        console.error(`[Image AI] RATE LIMITED - Too many requests. Response: ${errorBody.slice(0, 200)}`);
      } else {
        console.error(`[Image AI] FAILED - API returned HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
      }
      return null;
    }

    const data = await response.text();

    const match = data.match(/data:image\/[^;]+;base64,([^"]+)/);
    if (!match) {
      console.error(`[Image AI] FAILED - No base64 image data in response. Response preview: ${data.slice(0, 300)}`);
      return null;
    }

    const base64Data = match[1];
    const buffer = Buffer.from(base64Data, "base64");
    console.log(`[Image AI] Got image data: ${(buffer.length / 1024).toFixed(1)}KB`);

    const supabase = getSupabaseAdmin();
    const fileName = `${articleId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error(`[Image AI] FAILED - Supabase upload error: ${JSON.stringify(uploadError)}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    console.log(`[Image AI] SUCCESS - uploaded to: ${urlData.publicUrl.slice(0, 80)}`);
    return urlData.publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Image AI] ERROR - ${message}`);
    return null;
  }
}
