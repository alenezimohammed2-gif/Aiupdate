import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss-fetcher";
import { processAllArticles, setProcessorSettings } from "@/lib/gemini-processor";
import { generateArticleImage } from "@/lib/image-generator";
import { getSupabaseAdmin } from "@/lib/supabase";

export const maxDuration = 300; // 5 minutes max for Vercel

function verifyAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Vercel Cron sends GET with CRON_SECRET as query param or header
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;
  // Vercel Cron also checks via x-vercel-cron header (internal)
  return false;
}

// GET handler for Vercel Cron (automatic scheduling)
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runCronJob();
}

// POST handler for external cron services and manual triggers
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runCronJob();
}

async function runCronJob() {

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
      .slice(0, 50);
    console.log(`Found ${newItems.length} new items after deduplication (capped at 50)`);

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
        message: "No new articles to process",
        stats: { fetched: rawItems.length, new: 0, processed: 0, duration_ms: duration },
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

    // Step 5: Generate images for articles without images
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
        }
      }
    }

    // Step 6: Clean up old articles (older than 30 days)
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
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error("Cron job failed:", error);

    // Save error log
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
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
