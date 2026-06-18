import type { StepDefinition } from "@/lib/types";

export const workflow: StepDefinition[] = [
  {
    id: "brainstorming",
    title: "Step 1: AI-assisted CT-oriented brainstorming",
    instruction:
      "In this box, write your initial ideas for all five items below. Then click Generate AI support and record the useful information.",
    detail:
      "Fill in these five parts in one box:\n\n1. My target claim / 我的中心观点\n2. My grounds / 支持这个观点的理由\n3. Supporting information / 可以使用的例子、解释或细节\n4. Warrant / 这些理由为什么能支持我的观点\n5. Inference or implication / 可以得出的结论或意义",
    supportsAi: true,
    inputLabel: "Brainstorming notes / 头脑风暴笔记",
    inputPlaceholder:
      "Fill in the five parts here before generating AI support.",
    inputDefault:
      "1. My target claim / 我的中心观点：\n\n\n\n2. My grounds / 支持这个观点的理由：\n\n\n\n3. Supporting information / 可以使用的例子、解释或细节：\n\n\n\n4. Warrant / 这些理由为什么能支持我的观点：\n\n\n\n5. Inference or implication / 可以得出的结论或意义：\n",
  },
  {
    id: "drafting",
    title: "Step 2: Drafting",
    instruction:
      "Write your argumentative paragraph independently based on the ideas you selected during brainstorming.",
    detail:
      "Do not ask AI to write or rewrite your paragraph. Use your own words. When your draft is ready, continue to peer-reviewing.",
    supportsAi: false,
  },
  {
    id: "peer-reviewing",
    title: "Step 3: AI-assisted CT-oriented peer-reviewing",
    instruction:
      "Paste the argumentative paragraph that you wrote independently. AI will review the reasoning quality and provide questions and comments only.",
    detail:
      "The feedback focuses on clarity, relevance, logic, depth and significance. AI will not rewrite your paragraph.",
    supportsAi: true,
    inputLabel: "Your argumentative paragraph",
    inputPlaceholder: "Paste the paragraph that you wrote independently.",
  },
  {
    id: "feedback-judgement",
    title: "Step 4: Feedback judgement",
    instruction:
      "Read the AI feedback carefully. Decide whether to accept, reject or partly accept each suggestion.",
    detail:
      "AI is a scaffold, not an authority. Discuss your decisions with a partner and keep only the feedback that improves your reasoning.",
    supportsAi: false,
  },
  {
    id: "revising",
    title: "Step 5: Revising",
    instruction:
      "Revise your paragraph selectively based on your own judgement and the useful feedback.",
    detail:
      "Make your own final decisions. Your revised paragraph must remain your own writing.",
    supportsAi: false,
  },
];

export const workflowMap = Object.fromEntries(
  workflow.map((step) => [step.id, step]),
) as Record<string, StepDefinition>;
