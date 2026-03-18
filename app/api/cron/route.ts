import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss-fetcher";
import { processAllArticles, setProcessorSettings } from "@/lib/gemini-processor";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateArticleImage } from "@/lib/image-generator";

export const maxDuration = 300; // 5 minutes max for Vercel

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const supabase = getSupabaseAdmin();

    // Step 0: Load settings
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

    // Step 1: Fetch all RSS feeds
    console.log("Fetching RSS feeds...");
    const rawItems = await fetchAllFeeds();
    console.log(`Fetched ${rawItems.length} raw items`);

    // Step 2: Get existing article URLs to avoid reprocessing
    const { data: existingArticles } = await supabase
      .from("articles")
      .select("source_url");

    const existingUrls = new Set(
      (existingArticles || []).map((a) => a.source_url)
    );

    // Filter out already-processed articles and limit to newest 20
    const newItems = rawItems
      .filter((item) => item.url && !existingUrls.has(item.url))
      .slice(0, 20);
    console.log(`Found ${newItems.length} new items after deduplication (capped at 50)`);

    if (newItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new articles to process",
        stats: {
          fetched: rawItems.length,
          new: 0,
          processed: 0,
          duration_ms: Date.now() - startTime,
        },
      });
    }

    // Step 3: Process with Gemini (filter + classify + summarize + translate)
    const processed = await processAllArticles(newItems);

    // Step 4: Save to Supabase
    if (processed.length > 0) {
      const { error: insertError } = await supabase
        .from("articles")
        .upsert(processed, { onConflict: "source_url" });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }
    }

    // Step 5: Clean up old articles (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from("articles")
      .delete()
      .lt("published_at", thirtyDaysAgo.toISOString());

    const duration = Date.now() - startTime;
    console.log(
      `Cron job completed: ${processed.length} articles in ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      stats: {
        fetched: rawItems.length,
        new: newItems.length,
        processed: processed.length,
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
