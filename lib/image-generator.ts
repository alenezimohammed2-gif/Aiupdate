import { getSupabaseAdmin } from "./supabase";
import { ArticleCategory } from "./types";

const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

const categoryStyles: Record<ArticleCategory, string> = {
  new_models:
    "Futuristic 3D render style. Glowing neural network brain with light particles. Dark background with neon blue and purple accents. Cinematic lighting, depth of field.",
  model_updates:
    "Clean isometric illustration style. Software update concept with gears, arrows, and data flow. Soft gradient colors (blue to teal). Modern and minimal.",
  ai_tools:
    "Flat digital art style. Vibrant colors, geometric shapes representing tools and workflows. Orange and blue palette. Modern startup aesthetic.",
  ai_agents:
    "Cyberpunk neon style. Autonomous robot or digital agent in action. Dark background with glowing neon lines (green and cyan). Futuristic atmosphere.",
  benchmarks:
    "Data visualization style. Abstract 3D bar charts, performance graphs, and metrics floating in space. Blue and white color scheme. Professional and analytical.",
  deals:
    "Photorealistic corporate style. Handshake concept with digital overlay, connected nodes, partnership imagery. Gold and dark blue tones. Business professional.",
  research:
    "Scientific illustration style. DNA helix, molecular structures, or abstract mathematical patterns. Deep indigo and white palette. Academic and elegant.",
};

export async function generateArticleImage(
  title: string,
  category: string,
  articleId: string
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const style =
      categoryStyles[category as ArticleCategory] ||
      "Modern tech style. Clean, minimal. Blue and dark tones.";

    const prompt = `Generate a professional thumbnail image for this AI news article. NO TEXT OR WORDS on the image.

Title: "${title}"

Visual style: ${style}

Important: Do NOT include any text, letters, words, or watermarks in the image. Pure visual only.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
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
