import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss-fetcher";
import { processAllArticles, setProcessorSettings } from "@/lib/gemini-processor";
import { generateArticleImage } from "@/lib/image-generator";
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

    // Get existing article URLs to avoid reprocessing
    const { data: existingArticles } = await supabase
      .from("articles")
      .select("source_url");

    const existingUrls = new Set(
      (existingArticles || []).map((a) => a.source_url)
    );

    // Filter out already-processed articles and limit to newest 20
    const newItems = rawItems
      .filter((item) => item.url && !existingUrls.has(item.url))
      .slice(0, 50);

    if (newItems.length === 0) {
      const duration = Date.now() - startTime;
      await supabase.from("cron_logs").insert({
        fetched: rawItems.length,
        new_items: 0,
        processed: 0,
        duration_ms: duration,
        status: "success",
      });
      return NextResponse.json({
        success: true,
        stats: { fetched: rawItems.length, new: 0, processed: 0, duration_ms: duration },
        message: "No new articles found",
      });
    }

    // Process with AI (filter + classify + summarize + translate)
    const processed = await processAllArticles(newItems);

    // Save to Supabase
    if (processed.length > 0) {
      const { error: insertError } = await supabase
        .from("articles")
        .upsert(processed, { onConflict: "source_url" });

      if (insertError) throw insertError;
    }

    // Generate images for articles without images
    let imagesGenerated = 0;
    const { data: noImageArticles } = await supabase
      .from("articles")
      .select("id, title_en, category, image_url")
      .or("image_url.is.null,image_url.eq.");

    const imageModel = settingsData?.selected_image_model || undefined;
    if (noImageArticles && noImageArticles.length > 0) {
      for (const article of noImageArticles) {
        const imageUrl = await generateArticleImage(
          article.title_en,
          article.category,
          article.id,
          imageModel
        );
        if (imageUrl) {
          await supabase
            .from("articles")
            .update({ image_url: imageUrl })
            .eq("id", article.id);
          imagesGenerated++;
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
      duration_ms: duration,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      stats: {
        fetched: rawItems.length,
        new: newItems.length,
        processed: processed.length,
        imagesGenerated,
        duration_ms: duration,
      },
    });
  } catch (error) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("cron_logs").insert({
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
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
