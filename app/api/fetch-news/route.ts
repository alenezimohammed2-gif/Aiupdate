import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss-fetcher";
import { processAllArticles, setProcessorSettings } from "@/lib/gemini-processor";
import { getArticleImage } from "@/lib/image-generator";
import { getSupabaseAdmin } from "@/lib/supabase";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // Verify admin password
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const supabase = getSupabaseAdmin();

    // Load settings
    const { data: settingsData } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (settingsData) {
      setProcessorSettings({
        model: settingsData.selected_model,
        instructionsInclude: settingsData.custom_instructions_include,
        instructionsExclude: settingsData.custom_instructions_exclude,
        keywords: settingsData.keywords,
      });
    }

    // Fetch all RSS feeds
    const rawItems = await fetchAllFeeds();

    // Get existing articles to avoid reprocessing and detect topic duplicates
    const { data: existingArticles } = await supabase
      .from("articles")
      .select("source_url, title_en");

    const existingUrls = new Set(
      (existingArticles || []).map((a) => a.source_url)
    );

    // Extract key words from existing titles for topic duplicate detection
    const existingTitleKeys = (existingArticles || []).map((a) =>
      a.title_en.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w: string) => w.length > 3)
    );

    function isSimilarToExisting(title: string): boolean {
      const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3);
      for (const existingWords of existingTitleKeys) {
        const common = words.filter(w => existingWords.includes(w));
        const similarity = common.length / Math.max(words.length, existingWords.length);
        if (similarity > 0.5) return true;
      }
      return false;
    }

    // Only accept articles published within the last 3 days
    const publishCutoff = new Date();
    publishCutoff.setDate(publishCutoff.getDate() - 3);

    // Filter out: existing URLs, topic duplicates, and old articles
    const newItems = rawItems
      .filter((item) => item.url && !existingUrls.has(item.url))
      .filter((item) => !isSimilarToExisting(item.title))
      .filter((item) => {
        if (!item.published) return false;
        return new Date(item.published) >= publishCutoff;
      })
      .slice(0, 50);

    if (newItems.length === 0) {
      const duration = Date.now() - startTime;
      await supabase.from("cron_logs").insert({
        fetched: rawItems.length,
        new_items: 0,
        processed: 0,
        images_generated: 0,
        duration_ms: duration,
        status: "success",
        triggered_by: "manual",
      });
      return NextResponse.json({
        success: true,
        stats: { fetched: rawItems.length, new: 0, processed: 0, duration_ms: duration },
        message: "No new articles found",
      });
    }

    // Process with AI (deduplicate + filter + classify + summarize + translate)
    const existingTitles = (existingArticles || []).map((a) => a.title_en);
    const processed = await processAllArticles(newItems, existingTitles);

    // Save to Supabase
    if (processed.length > 0) {
      const { error: insertError } = await supabase
        .from("articles")
        .upsert(processed, { onConflict: "source_url" });

      if (insertError) throw insertError;
    }

    // Generate images for articles without images
    let imagesFromSource = 0;
    let imagesFromAI = 0;
    const { data: noImageArticles } = await supabase
      .from("articles")
      .select("id, title_en, category, image_url, image_prompt, image_style, image_colors, source_url")
      .or("image_url.is.null,image_url.eq.");

    const imageModel = settingsData?.selected_image_model || undefined;
    if (noImageArticles && noImageArticles.length > 0) {
      for (const article of noImageArticles) {
        const imageUrl = await getArticleImage(
          article.title_en,
          article.category,
          article.id,
          article.source_url,
          imageModel,
          article.image_prompt,
          article.image_style,
          article.image_colors
        );
        if (imageUrl) {
          await supabase
            .from("articles")
            .update({ image_url: imageUrl })
            .eq("id", article.id);
          if (imageUrl.includes("article-images")) {
            imagesFromAI++;
          } else {
            imagesFromSource++;
          }
        }
      }
    }

    // Clean up old articles (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await supabase
      .from("articles")
      .delete()
      .lt("published_at", thirtyDaysAgo.toISOString());

    const duration = Date.now() - startTime;

    // Save log
    await supabase.from("cron_logs").insert({
      fetched: rawItems.length,
      new_items: newItems.length,
      processed: processed.length,
      images_generated: imagesFromAI + imagesFromSource,
      images_from_source: imagesFromSource,
      images_from_ai: imagesFromAI,
      duration_ms: duration,
      status: "success",
      triggered_by: "manual",
    });

    return NextResponse.json({
      success: true,
      stats: {
        fetched: rawItems.length,
        new: newItems.length,
        processed: processed.length,
        imagesFromSource,
        imagesFromAI,
        duration_ms: duration,
      },
    });
  } catch (error) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("cron_logs").insert({
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        triggered_by: "manual",
      });
    } catch {
      // ignore log save errors
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fetch failed" },
      { status: 500 }
    );
  }
}
