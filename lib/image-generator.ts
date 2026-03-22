import { getSupabaseAdmin } from "./supabase";

const DEFAULT_IMAGE_MODEL = "google/gemini-3-pro-image-preview";

// Blocked keywords in image URLs — these are not article images
const BLOCKED_KEYWORDS = [
  "logo", "favicon", "brand", "icon",
  "ad-", "ads/", "banner", "sponsor",
  "pixel", "tracker", "analytics",
  "placeholder", "default", "avatar",
];

/**
 * Try to extract og:image from the article's source page
 * Returns the image URL if found and valid, null otherwise
 */
export async function extractSourceImage(
  sourceUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "AI-Pulse-News-Bot/1.0" },
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Extract og:image (try both attribute orders)
    const ogImage =
      html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/
      )?.[1] ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/
      )?.[1];

    if (!ogImage) return null;

    // Validate: must be a full URL
    if (!ogImage.startsWith("http")) return null;

    // Check against blocked keywords
    const urlLower = ogImage.toLowerCase();
    for (const keyword of BLOCKED_KEYWORDS) {
      if (urlLower.includes(keyword)) {
        console.log(`Skipping og:image (blocked keyword "${keyword}"): ${ogImage.slice(0, 60)}`);
        return null;
      }
    }

    // Check: image must be from same domain or known CDN (not third-party ads)
    const sourceHost = new URL(sourceUrl).hostname.replace("www.", "");
    const imageHost = new URL(ogImage).hostname.replace("www.", "");
    const isKnownCDN = [
      "wp.com", "squarespace.com", "googleapis.com", "cloudfront.net",
      "amazonaws.com", "akamaized.net", "imgix.net", "cloudinary.com",
      "huggingface.co", "regmedia.co.uk",
    ].some((cdn) => imageHost.includes(cdn));

    if (!imageHost.includes(sourceHost.split(".").slice(-2).join(".")) && !isKnownCDN) {
      console.log(`Skipping og:image (different domain): ${imageHost} vs ${sourceHost}`);
      return null;
    }

    console.log(`Extracted og:image from source: ${ogImage.slice(0, 80)}`);
    return ogImage;
  } catch {
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
  // Step 1: Try extracting from source page (free)
  const sourceImage = await extractSourceImage(sourceUrl);
  if (sourceImage) {
    return sourceImage;
  }

  // Step 2: Fall back to AI generation (paid)
  return generateArticleImage(title, category, articleId, model, imagePrompt, imageStyle, imageColors);
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
  if (!apiKey) return null;

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
          model: model || DEFAULT_IMAGE_MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.text();

    const match = data.match(/data:image\/[^;]+;base64,([^"]+)/);
    if (!match) {
      console.error("No image data found in response");
      return null;
    }

    const base64Data = match[1];
    const buffer = Buffer.from(base64Data, "base64");

    const supabase = getSupabaseAdmin();
    const fileName = `${articleId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}
