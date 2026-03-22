import OpenAI from "openai";
import { RawFeedItem, ProcessedArticle, ArticleCategory } from "./types";
import crypto from "crypto";

let ACTIVE_MODEL = "google/gemini-3-flash-preview";
const FALLBACK_MODEL = "google/gemini-2.5-flash";
let CUSTOM_INSTRUCTIONS_INCLUDE = "";
let CUSTOM_INSTRUCTIONS_EXCLUDE = "";
let FILTER_KEYWORDS: string[] = [];

export function setProcessorSettings(settings: {
  model?: string;
  instructionsInclude?: string;
  instructionsExclude?: string;
  keywords?: string[];
}) {
  if (settings.model) ACTIVE_MODEL = settings.model;
  if (settings.instructionsInclude !== undefined)
    CUSTOM_INSTRUCTIONS_INCLUDE = settings.instructionsInclude;
  if (settings.instructionsExclude !== undefined)
    CUSTOM_INSTRUCTIONS_EXCLUDE = settings.instructionsExclude;
  if (settings.keywords) FILTER_KEYWORDS = settings.keywords;
}

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
  const modelName = model || ACTIVE_MODEL;

  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    if (modelName === ACTIVE_MODEL) {
      console.warn(
        `Primary model ${ACTIVE_MODEL} failed, falling back to ${FALLBACK_MODEL}`
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

// Step 0: AI-powered duplicate detection — check if articles cover same events as existing ones
export async function deduplicateByMeaning(
  items: RawFeedItem[],
  existingTitles: string[]
): Promise<RawFeedItem[]> {
  if (items.length === 0 || existingTitles.length === 0) return items;

  try {
    const newTitles = items.map((item, idx) => ({ idx, title: item.title }));
    const existingList = existingTitles.slice(0, 50).map((t, i) => `${i}. ${t}`).join("\n");

    const prompt = `You are a duplicate news detector. Compare these NEW articles against EXISTING articles in our database.

EXISTING ARTICLES (already published):
${existingList}

NEW ARTICLES (candidates):
${JSON.stringify(newTitles, null, 2)}

For each NEW article, check if it covers the SAME event, announcement, or story as any EXISTING article.
Two articles are duplicates if they report the same:
- Acquisition/deal (e.g. "OpenAI acquires X" = "OpenAI buys X maker")
- Product launch (e.g. "GPT-5 released" = "OpenAI launches GPT-5")
- Government decision (e.g. "UK bans AI" = "Britain blocks AI training")
- Research finding (same study from different outlets)
- Company incident (same event reported differently)

Return ONLY a JSON array of idx numbers of NEW articles that are NOT duplicates (unique articles only). Example: [0, 2, 5]`;

    const result = await callGemini(prompt);
    const uniqueIndices: number[] = JSON.parse(extractJSON(result));
    const unique = uniqueIndices
      .filter((idx) => idx >= 0 && idx < items.length)
      .map((idx) => items[idx]);

    console.log(`Deduplication: ${items.length} → ${unique.length} unique (${items.length - unique.length} duplicates removed)`);
    return unique;
  } catch (error) {
    console.error("Deduplication failed, keeping all articles:", error);
    return items;
  }
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

    let prompt = `You are an AI news editor for an AI-focused news site. Your job is to select articles that would interest AI professionals and enthusiasts.\n\n`;

    if (CUSTOM_INSTRUCTIONS_INCLUDE) {
      prompt += `INCLUDE articles about: ${CUSTOM_INSTRUCTIONS_INCLUDE}\n`;
    } else {
      prompt += `INCLUDE articles about:\n1. New AI model releases or updates (LLMs, image models, video models, etc.)\n2. Successful new AI tools with significant impact\n3. AI agents and new agent frameworks\n4. Benchmark results and model comparisons\n5. Major AI deals, partnerships, or acquisitions\n6. Important AI research papers or discoveries\n`;
    }

    if (CUSTOM_INSTRUCTIONS_EXCLUDE) {
      prompt += `\nEXCLUDE ONLY articles that are clearly: ${CUSTOM_INSTRUCTIONS_EXCLUDE}\n`;
    } else {
      prompt += `\nEXCLUDE ONLY articles that are clearly: Pure opinion pieces, marketing announcements, general tutorials, non-AI topics.\n`;
    }

    if (FILTER_KEYWORDS.length > 0) {
      prompt += `\nPRIORITY KEYWORDS (must match at least one): ${FILTER_KEYWORDS.join(", ")}\n`;
    }

    prompt += `\nIMPORTANT RULES:\n- When in doubt, INCLUDE the article. It is better to include a borderline article than to miss important news.\n- Articles about AI investments, funding rounds, and business deals ARE relevant even if they mention dollar amounts.\n- Articles about AI product launches and updates ARE relevant even if they seem promotional.\n- Articles about government decisions affecting AI companies ARE relevant.\n- Only exclude an article if it clearly has NO connection to AI developments.\n- EXCLUDE smartphone, tablet, and consumer hardware news UNLESS the article is specifically about a new AI model, AI chip, or AI technology breakthrough. Simply adding "AI features" to a phone does NOT make it AI news.\n`;

    prompt += `\nArticles:\n${JSON.stringify(articlesForPrompt, null, 2)}\n\nReturn ONLY a JSON array of the idx numbers of accepted articles. Example: [0, 2, 5]`;

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
  "detail_en": "Detailed English summary (5-8 sentences). Cover: what was announced, key features and capabilities, how it compares to previous versions or competitors, who it impacts, and why it matters for the AI community. Be informative and comprehensive.",
  "title_ar": "Arabic translation of the title. Keep technical terms in English (API, LLM, GPU, etc.). Do NOT translate company or product names.",
  "summary_ar": "Arabic translation of summary_en. Keep technical terms in English. Make it natural and fluent.",
  "detail_ar": "Arabic translation of detail_en. Keep technical terms in English (API, LLM, GPU, Token, Benchmark, Fine-tuning, etc.). Do NOT translate company or product names. Make it natural, fluent, and comprehensive.",
  "relevance_score": number from 1-10 (10 = most important),
  "tags": ["tag1", "tag2", "tag3"] (3-5 English keyword tags),
  "mentioned_models": ["model names mentioned, e.g. GPT-5, Claude 4"],
  "mentioned_companies": ["company names mentioned, e.g. OpenAI, Google"],
  "image_prompt": "Describe a vivid, specific visual scene for this article thumbnail. Be creative and unique. Describe what we should SEE: the main subject, the setting, the mood, and specific visual details. Example: 'A massive crystal brain floating above a cyberpunk Tokyo skyline at sunset with data streams flowing like waterfalls'",
  "image_style": "Choose the most fitting artistic style for THIS specific article. You MUST vary your choices. Options include but are not limited to: photorealistic, cinematic, oil painting, watercolor, concept art, anime, pixel art, 3D render, flat design, retro vintage, neon noir, paper cut, low poly, surrealist, editorial photography, architectural visualization, scientific diagram, infographic style. Pick what truly fits the article mood — NOT always futuristic.",
  "image_colors": "Choose a UNIQUE color palette for this article. NEVER use electric blue as default. Consider warm palettes (amber, coral, burgundy, gold), cool palettes (teal, mint, lavender, slate), bold palettes (crimson and gold, emerald and cream), moody palettes (deep purple, charcoal, midnight), fresh palettes (lime, sky blue, peach). Match the colors to the article MOOD, not just tech = blue."
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
      detail_en: parsed.detail_en || parsed.summary_en || "",
      detail_ar: parsed.detail_ar || parsed.summary_ar || "",
      category,
      source: item.source,
      source_url: item.url,
      image_url: item.image,
      image_prompt: parsed.image_prompt || null,
      image_style: parsed.image_style || null,
      image_colors: parsed.image_colors || null,
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

// Process all articles: deduplicate → filter → classify + summarize + translate
export async function processAllArticles(
  items: RawFeedItem[],
  existingTitles?: string[]
): Promise<ProcessedArticle[]> {
  console.log(`Starting processing of ${items.length} raw articles...`);

  // Step 0: AI duplicate detection
  const deduplicated = existingTitles
    ? await deduplicateByMeaning(items, existingTitles)
    : items;

  const filtered = await filterArticles(deduplicated);
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
