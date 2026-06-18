import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildPrompt, SYSTEM_INSTRUCTION } from "@/lib/prompts";

export const runtime = "nodejs";

function sanitizeAiOutput(text: string) {
  const sectionMarkers = [
    { marker: "整体反馈:", keepMarker: true },
    { marker: "整体反馈：", keepMarker: true },
    { marker: "整体评价:", keepMarker: true },
    { marker: "整体评价：", keepMarker: true },
    { marker: "中文反馈:", keepMarker: true },
    { marker: "中文反馈：", keepMarker: true },
    { marker: "中文老师反馈:", keepMarker: true },
    { marker: "中文老师反馈：", keepMarker: true },
    { marker: "中文版本:", keepMarker: false },
    { marker: "中文版本：", keepMarker: false },
    { marker: "Chinese version:", keepMarker: false },
    { marker: "Chinese version：", keepMarker: false },
    { marker: "Chinese feedback:", keepMarker: false },
    { marker: "Chinese feedback：", keepMarker: false },
    { marker: "Chinese teacher feedback:", keepMarker: false },
    { marker: "Chinese teacher feedback：", keepMarker: false },
  ];
  const lowerText = text.toLowerCase();
  const markerMatch = sectionMarkers
    .map(({ marker, keepMarker }) => {
      const index = lowerText.indexOf(marker.toLowerCase());
      return index >= 0 ? { index, length: keepMarker ? 0 : marker.length } : null;
    })
    .filter((match): match is { index: number; length: number } => Boolean(match))
    .sort((a, b) => a.index - b.index)[0];
  const textToClean = markerMatch ? text.slice(markerMatch.index + markerMatch.length) : text;

  const cleanedText = textToClean
    .replace(/[*#`]/g, "")
    .replace(/^[ \t]*[-•]\s+/gm, "")
    .replace(/^\s*(English feedback|English teacher feedback|Chinese version|Chinese feedback|Chinese teacher feedback|中文反馈|中文老师反馈|中文版本)\s*[:：]?\s*$/gim, "")
    .replace(/\bOption\s+[A-Z]\s*[:：]/gi, "")
    .replace(/\bchoose one\b/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleanedText
    .split(/\r?\n/)
    .filter((line) => {
      const trimmedLine = line.trim();
      const englishWords = trimmedLine.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
      const chineseChars = trimmedLine.match(/[\u4e00-\u9fff]/g) ?? [];
      const endsLikeSentence = /[.!?]["'”’)]?$/.test(trimmedLine);
      const isMostlyEnglish = englishWords.join("").length > chineseChars.length * 3;
      return !(englishWords.length >= 9 && isMostlyEnglish && endsLikeSentence);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
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
      max_output_tokens: 1200,
    });

    return NextResponse.json({ output: sanitizeAiOutput(response.output_text) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate AI support.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
