import { getSupabaseAdmin } from "./supabase";

const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

export async function generateArticleImage(
  title: string,
  category: string,
  articleId: string
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Generate a professional, modern thumbnail image for this AI news article.
Title: "${title}"
Category: ${category}
Style: Clean, minimal, tech-focused. Use blue and dark tones. No text on the image. Abstract tech visualization related to the topic.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
      }),
    });

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
