import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "OPENROUTER_API_KEY is not configured",
      });
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const startTime = Date.now();

    const response = await client.chat.completions.create({
      model: model || "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: "Respond with: OK" }],
      max_tokens: 10,
    });

    const duration = Date.now() - startTime;
    const reply = response.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      model: model,
      response: reply,
      latency_ms: duration,
      message: `Connection successful (${duration}ms)`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    });
  }
}
