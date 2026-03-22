import { getSupabaseAdmin } from "./supabase";

const DEFAULT_IMAGE_MODEL = "google/gemini-3-pro-image-preview";

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
      // New: AI-determined style per article
      prompt = `Generate a professional thumbnail image for this AI news article. NO TEXT OR WORDS on the image.

Title: "${title}"

Visual element: ${imagePrompt}
Artistic style: ${imageStyle}
Color palette: ${imageColors}

Important: Do NOT include any text, letters, words, or watermarks in the image. Pure visual only. Make the image visually striking and professional.`;
    } else {
      // Fallback: generic style based on title
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

    // Extract base64 image from response
    const match = data.match(/data:image\/[^;]+;base64,([^"]+)/);
    if (!match) {
      console.error("No image data found in response");
      return null;
    }

    const base64Data = match[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Supabase Storage
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}
