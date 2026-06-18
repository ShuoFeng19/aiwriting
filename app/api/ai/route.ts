import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildPrompt, SYSTEM_INSTRUCTION } from "@/lib/prompts";

export const runtime = "nodejs";

const MIN_AI_OUTPUT_CHARS = 1000;
const MAX_AI_OUTPUT_CHARS = 1300;

function countFeedbackChars(text: string) {
  return text.replace(/\s/g, "").length;
}

function seemsIncomplete(text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) return true;
  if (!/[。！？!?）)]$/.test(trimmedText)) return true;
  if (/[，,、：:；;]$/.test(trimmedText)) return true;
  if (/(例如|比如|建议你|可以把|可以加入|这一点|因为|所以)$/.test(trimmedText)) {
    return true;
  }
  return false;
}

function needsLengthRevision(text: string) {
  const charCount = countFeedbackChars(text);
  return (
    charCount < MIN_AI_OUTPUT_CHARS ||
    charCount > MAX_AI_OUTPUT_CHARS ||
    seemsIncomplete(text)
  );
}

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

async function fitOutputToLength({
  client,
  model,
  originalPrompt,
  output,
}: {
  client: OpenAI;
  model: string;
  originalPrompt: string;
  output: string;
}) {
  let fittedOutput = output;

  for (let attempt = 0; attempt < 2 && needsLengthRevision(fittedOutput); attempt += 1) {
    const charCount = countFeedbackChars(fittedOutput);
    const response = await client.responses.create({
      model,
      instructions: SYSTEM_INSTRUCTION,
      input: `请把下面这份 AI 写作反馈改写成最终可展示给学生的版本。

硬性要求：
1. 必须完整结束，不能停在半句话、半个小点或半个标题处。
2. 总长度控制在 1000 到 1300 个汉字左右，更理想是 1100 到 1200 字。
3. 如果原反馈太长，请合并重复内容，只保留最重要的 3 个修改重点；如果原反馈太短，请补足解释理由，但不要空泛。
4. 只用中文，语气像专业雅思老师面对面指导学生，温和、具体、自然。
5. 不要给完整作文句子，不要给可直接复制的修改稿；只能给修改方向、短语级表达和内容补充方向。
6. 保留对学生原始内容的针对性，不要写成通用模板。

当前反馈字数约为：${charCount}

原始任务和学生输入：
${originalPrompt}

需要改写的反馈：
${fittedOutput}`,
      max_output_tokens: 2600,
    });

    fittedOutput = sanitizeAiOutput(response.output_text);
  }

  return fittedOutput;
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
    const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
    const response = await client.responses.create({
      model,
      instructions: SYSTEM_INSTRUCTION,
      input: prompt,
      max_output_tokens: 2600,
    });

    const output = await fitOutputToLength({
      client,
      model,
      originalPrompt: prompt,
      output: sanitizeAiOutput(response.output_text),
    });

    return NextResponse.json({ output });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate AI support.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
