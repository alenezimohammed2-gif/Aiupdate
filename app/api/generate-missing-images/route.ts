import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getArticleImage } from "@/lib/image-generator";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Get articles without images
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title_en, category, image_url, source_url, image_prompt, image_style, image_colors")
      .or("image_url.is.null,image_url.eq.");

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: "All articles have images", count: 0 });
    }

    let generated = 0;
    for (const article of articles) {
      const result = await getArticleImage(
        article.title_en,
        article.category,
        article.id,
        article.source_url,
        undefined,
        article.image_prompt,
        article.image_style,
        article.image_colors
      );
      if (result) {
        await supabase
          .from("articles")
          .update({ image_url: result.url, image_source: result.source })
          .eq("id", article.id);
        generated++;
        console.log(`Image ${generated}/${articles.length} [${result.source}]: ${article.title_en.slice(0, 50)}`);
      }
    }

    return NextResponse.json({ success: true, total: articles.length, generated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
