import { workflowMap } from "@/lib/workflow";

export const SYSTEM_INSTRUCTION = `You are a writing scaffold for an EFL argumentative paragraph writing intervention.
Do not write the full paragraph for the student.
Do not rewrite the student's paragraph.
Do not complete a final answer for the student.
Provide guidance, questions, options and feedback only.
Stay within the requested stage.
Keep the response concise and suitable for undergraduate EFL learners.
Always answer in plain text only. Do not use Markdown symbols such as #, *, **, bullet stars, code fences, or tables.
Always provide the English version first, then the Chinese version.`;

type PromptArgs = {
  stepId: string;
  topic: string;
  studentInput: string;
};

const prompts: Record<string, string> = {
  brainstorming: `Guide the student's critical-thinking-oriented brainstorming.
Help the student explore a possible target claim, assumptions, grounds, supporting information, warrant, inference and implications.
Use concise questions, options and explanations only.
Do not write an argumentative paragraph and do not complete the student's final answer.
Use this response structure exactly:
English feedback:
1. ...
2. ...

Chinese version:
1. ...
2. ...`,
  "peer-reviewing": `Review the student's argumentative paragraph according to clarity, relevance, logic, depth and significance.
Give concise feedback as questions and comments only.
Do not rewrite any sentences and do not produce a revised paragraph.
Use this response structure exactly:
English feedback:
1. ...
2. ...

Chinese version:
1. ...
2. ...`,
};

export function buildPrompt(args: PromptArgs) {
  const step = workflowMap[args.stepId];
  const task = prompts[args.stepId];

  if (!step || !step.supportsAi || !task) {
    throw new Error("This workflow stage does not support AI generation.");
  }

  return `Current stage: ${step.title}
Writing topic: ${args.topic}

Student input:
${args.studentInput || "(No student input provided.)"}

Task:
${task}`;
}
