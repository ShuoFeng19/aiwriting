import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildPrompt, SYSTEM_INSTRUCTION } from "@/lib/prompts";

export const runtime = "nodejs";

function sanitizeAiOutput(text: string) {
  return text
    .replace(/[*#`]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      stepId?: string;
      topic?: string;
      studentInput?: string;
    };

    if (!body.stepId || !body.topic?.trim() || !body.studentInput?.trim()) {
      return NextResponse.json(
        { error: "Stage, topic and student input are required." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt({
      stepId: body.stepId,
      topic: body.topic.trim(),
      studentInput: body.studentInput.trim(),
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      instructions: SYSTEM_INSTRUCTION,
      input: prompt,
      max_output_tokens: 700,
    });

    return NextResponse.json({ output: sanitizeAiOutput(response.output_text) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate AI support.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
