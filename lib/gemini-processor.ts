import OpenAI from "openai";
import { RawFeedItem, ProcessedArticle, ArticleCategory } from "./types";
import crypto from "crypto";

const PRIMARY_MODEL = "google/gemini-3-flash-preview";
const FALLBACK_MODEL = "google/gemini-2.5-flash";

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

function generateId(title: string, source: string): string {
  return crypto
    .createHash("sha256")
    .update(`${title}|${source}`)
    .digest("hex")
    .slice(0, 16);
}

async function callGemini(prompt: string, model?: string): Promise<string> {
  const client = getClient();
  const modelName = model || PRIMARY_MODEL;

  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    if (modelName === PRIMARY_MODEL) {
      console.warn(
        `Primary model ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}`
      );
      return callGemini(prompt, FALLBACK_MODEL);
    }
    throw error;
  }
}

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) return jsonMatch[1].trim();
  return text.trim();
}

// Step 1: Filter articles relevant to AI models, tools, and agents
export async function filterArticles(
  items: RawFeedItem[]
): Promise<RawFeedItem[]> {
  if (items.length === 0) return [];

  const batchSize = 30;
  const filtered: RawFeedItem[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const articlesForPrompt = batch.map((item, idx) => ({
      idx,
      title: item.title,
      description: item.description.slice(0, 200),
    }));

    const prompt = `You are an AI news editor. From the following articles, select ONLY articles that are about:
1. New AI model releases or updates (LLMs, image models, video models, etc.)
2. Successful new AI tools with significant impact
3. AI agents and new agent frameworks
4. Benchmark results and model comparisons
5. Major AI deals, partnerships, or acquisitions
6. Important AI research papers or discoveries

EXCLUDE: Pure opinion pieces, marketing announcements, general tutorials, non-AI topics.

Articles:
${JSON.stringify(articlesForPrompt, null, 2)}

Return ONLY a JSON array of the idx numbers of accepted articles. Example: [0, 2, 5]`;

    try {
      const result = await callGemini(prompt);
      const indices: number[] = JSON.parse(extractJSON(result));
      for (const idx of indices) {
        if (idx >= 0 && idx < batch.length) {
          filtered.push(batch[idx]);
        }
      }
    } catch (error) {
      console.error("Filter batch failed, including all articles:", error);
      filtered.push(...batch);
    }
  }

  return filtered;
}

// Steps 2-4: Classify, summarize, and translate each article
export async function processArticle(
  item: RawFeedItem
): Promise<ProcessedArticle | null> {
  const prompt = `You are an AI news processor. Process this article and return a JSON object.

Article:
- Title: ${item.title}
- Description: ${item.description.slice(0, 1000)}
- Source: ${item.source}

Return a JSON object with these exact fields:
{
  "category": one of ["new_models", "model_updates", "ai_tools", "ai_agents", "benchmarks", "deals", "research"],
  "summary_en": "2-3 sentence English summary focusing on what's new, key features, and why it matters",
  "title_ar": "Arabic translation of the title. Keep technical terms in English (API, LLM, GPU, etc.). Do NOT translate company or product names.",
  "summary_ar": "Arabic translation of the summary. Keep technical terms in English. Make it natural and fluent.",
  "relevance_score": number from 1-10 (10 = most important),
  "tags": ["tag1", "tag2", "tag3"] (3-5 English keyword tags),
  "mentioned_models": ["model names mentioned, e.g. GPT-5, Claude 4"],
  "mentioned_companies": ["company names mentioned, e.g. OpenAI, Google"]
}

Return ONLY the JSON object, no other text.`;

  try {
    const result = await callGemini(prompt);
    const parsed = JSON.parse(extractJSON(result));

    const validCategories: ArticleCategory[] = [
      "new_models",
      "model_updates",
      "ai_tools",
      "ai_agents",
      "benchmarks",
      "deals",
      "research",
    ];

    const category = validCategories.includes(parsed.category)
      ? parsed.category
      : "ai_tools";

    return {
      id: generateId(item.title, item.source),
      title_en: item.title,
      title_ar: parsed.title_ar || item.title,
      summary_en: parsed.summary_en || item.description.slice(0, 300),
      summary_ar: parsed.summary_ar || parsed.summary_en || "",
      category,
      source: item.source,
      source_url: item.url,
      image_url: item.image,
      published_at: item.published || new Date().toISOString(),
      processed_at: new Date().toISOString(),
      relevance_score: Math.min(10, Math.max(1, parsed.relevance_score || 5)),
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      mentioned_models: Array.isArray(parsed.mentioned_models)
        ? parsed.mentioned_models
        : [],
      mentioned_companies: Array.isArray(parsed.mentioned_companies)
        ? parsed.mentioned_companies
        : [],
    };
  } catch (error) {
    console.error(`Failed to process article: ${item.title}`, error);
    return null;
  }
}

// Process all articles: filter → classify + summarize + translate
export async function processAllArticles(
  items: RawFeedItem[]
): Promise<ProcessedArticle[]> {
  console.log(`Starting processing of ${items.length} raw articles...`);

  const filtered = await filterArticles(items);
  console.log(`Filtered to ${filtered.length} relevant articles`);

  const concurrency = 5;
  const processed: ProcessedArticle[] = [];

  for (let i = 0; i < filtered.length; i += concurrency) {
    const batch = filtered.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map((item) => processArticle(item))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        processed.push(result.value);
      }
    }
  }

  console.log(`Successfully processed ${processed.length} articles`);
  return processed;
}
