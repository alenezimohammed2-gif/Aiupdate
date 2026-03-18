import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

    // Sample test articles
    const testArticles = [
      { idx: 0, title: "OpenAI releases GPT-5 with improved reasoning", description: "New LLM model with enhanced capabilities" },
      { idx: 1, title: "Best recipes for summer cooking", description: "Top 10 summer dishes you should try" },
      { idx: 2, title: "Google announces Gemini 3 Pro update", description: "Major update to Gemini model family" },
      { idx: 3, title: "Stock market reaches new highs", description: "Financial markets continue bull run" },
      { idx: 4, title: "New AI agent framework released by Microsoft", description: "AutoGen v2 brings multi-agent orchestration" },
      { idx: 5, title: "Apple launches new iPhone", description: "Latest iPhone with improved camera" },
      { idx: 6, title: "Claude 4 benchmarks show state-of-the-art results", description: "Anthropic model tops reasoning benchmarks" },
    ];

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

    prompt += `\nArticles:\n${JSON.stringify(testArticles, null, 2)}\n\nReturn a JSON object with:\n- "accepted": array of idx numbers of accepted articles\n- "rejected": array of idx numbers of rejected articles\n- "reasoning": brief explanation for each decision`;

    const response = await client.chat.completions.create({
      model: model || "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      model,
      articles: testArticles,
      result: content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}
