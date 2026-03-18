import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchTestFeeds } from "@/lib/rss-fetcher";
import { RawFeedItem } from "@/lib/types";

// Simple in-memory cache
let cachedArticles: RawFeedItem[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Fallback articles if all RSS feeds fail
const HARDCODED_FALLBACK: RawFeedItem[] = [
  { title: "OpenAI releases GPT-5 with improved reasoning", description: "New LLM model with enhanced capabilities", url: "", published: null, image: null, source: "Sample" },
  { title: "Best recipes for summer cooking", description: "Top 10 summer dishes you should try", url: "", published: null, image: null, source: "Sample" },
  { title: "Google announces Gemini 3 Pro update", description: "Major update to Gemini model family", url: "", published: null, image: null, source: "Sample" },
  { title: "Stock market reaches new highs", description: "Financial markets continue bull run", url: "", published: null, image: null, source: "Sample" },
  { title: "New AI agent framework released by Microsoft", description: "AutoGen v2 brings multi-agent orchestration", url: "", published: null, image: null, source: "Sample" },
  { title: "Apple launches new iPhone", description: "Latest iPhone with improved camera", url: "", published: null, image: null, source: "Sample" },
  { title: "Claude 4 benchmarks show state-of-the-art results", description: "Anthropic model tops reasoning benchmarks", url: "", published: null, image: null, source: "Sample" },
];

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  return jsonMatch ? jsonMatch[1] : text;
}

async function getTestArticles(): Promise<{ articles: RawFeedItem[]; isReal: boolean }> {
  const now = Date.now();
  if (cachedArticles.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return { articles: cachedArticles, isReal: true };
  }

  try {
    const fetched = await fetchTestFeeds();
    if (fetched.length >= 5) {
      cachedArticles = fetched;
      cacheTimestamp = now;
      return { articles: fetched, isReal: true };
    }
  } catch (error) {
    console.error("Failed to fetch test feeds:", error);
  }

  return { articles: HARDCODED_FALLBACK, isReal: false };
}

export async function POST(request: NextRequest) {
  try {
    const { model, instructions_include, instructions_exclude, keywords } =
      await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const { articles: allArticles, isReal: isRealArticles } = await getTestArticles();

    // Take up to 15 most recent
    const testArticles = allArticles.slice(0, 15).map((item, idx) => ({
      idx,
      title: item.title,
      description: item.description?.slice(0, 200) || "",
      source: item.source,
    }));

    let prompt = `You are an AI news editor. From the following articles, select ONLY the relevant ones based on these rules:\n\n`;

    if (instructions_include) {
      prompt += `INCLUDE articles about: ${instructions_include}\n`;
    }
    if (instructions_exclude) {
      prompt += `EXCLUDE articles about: ${instructions_exclude}\n`;
    }
    if (keywords && keywords.length > 0) {
      prompt += `KEYWORDS to look for: ${keywords.join(", ")}\n`;
    }
    if (!instructions_include && (!keywords || keywords.length === 0)) {
      prompt += `INCLUDE: AI models, AI tools, AI agents, benchmarks, AI deals, AI research\nEXCLUDE: Non-AI topics\n`;
    }

    prompt += `\nArticles:\n${JSON.stringify(testArticles, null, 2)}\n\nReturn a JSON object with:\n- "accepted": array of objects [{idx, reason}] for accepted articles\n- "rejected": array of objects [{idx, reason}] for rejected articles\nKeep reasons brief (1 sentence each).`;

    const response = await client.chat.completions.create({
      model: model || "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || "";

    // Try to parse structured response
    try {
      const jsonStr = extractJSON(content);
      const parsed = JSON.parse(jsonStr);

      return NextResponse.json({
        success: true,
        model,
        isRealArticles,
        articles: testArticles,
        accepted: parsed.accepted || [],
        rejected: parsed.rejected || [],
        structured: true,
      });
    } catch {
      // If parsing fails, return raw text
      return NextResponse.json({
        success: true,
        model,
        isRealArticles,
        articles: testArticles,
        result: content,
        structured: false,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}
