"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StepCard } from "@/components/StepCard";
import { workflow } from "@/lib/workflow";
import type { StepDefinition, StepState, StudentSession } from "@/lib/types";

function initialStepState(step: StepDefinition): StepState {
  return { studentInput: step.inputDefault ?? "", aiOutput: "", saved: false };
}

function ActivityContent() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [states, setStates] = useState<Record<string, StepState>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [busyStep, setBusyStep] = useState("");
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const studentId = searchParams.get("studentId")?.trim() ?? "";
    const topic = searchParams.get("topic")?.trim() ?? "";
    if (!studentId || !topic) return;

    setSession({ studentId, topic });
    setStates(
      Object.fromEntries(workflow.map((step) => [step.id, initialStepState(step)])),
    );
  }, [searchParams]);

  function updateState(stepId: string, update: Partial<StepState>) {
    setStates((current) => ({
      ...current,
      [stepId]: { ...current[stepId], ...update },
    }));
  }

  async function generate(step: StepDefinition) {
    if (!session) return;
    const state = states[step.id];
    if (!state.studentInput.trim()) {
      setMessages((current) => ({
        ...current,
        [step.id]: "Please enter your own content before generating AI support.",
      }));
      return;
    }

    setBusyStep(step.id);
    setMessages((current) => ({ ...current, [step.id]: "" }));
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: step.id,
          topic: session.topic,
          studentInput: state.studentInput,
        }),
      });
      const data = (await response.json()) as { output?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to generate AI support.");
      updateState(step.id, { aiOutput: data.output ?? "", saved: false });
    } catch (error) {
      setMessages((current) => ({
        ...current,
        [step.id]: error instanceof Error ? error.message : "Unable to generate AI support.",
      }));
    } finally {
      setBusyStep("");
    }
  }

  async function save(step: StepDefinition) {
    if (!session) return;
    const state = states[step.id];
    if (!state.studentInput.trim() || !state.aiOutput.trim()) {
      setMessages((current) => ({
        ...current,
        [step.id]: "Generate AI support before saving this interaction.",
      }));
      return;
    }

    setBusyStep(step.id);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          stepId: step.id,
          stepName: step.title,
          studentInput: state.studentInput,
          aiOutput: state.aiOutput,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save.");
      updateState(step.id, { saved: true });
      setMessages((current) => ({ ...current, [step.id]: "Saved successfully." }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        [step.id]: error instanceof Error ? error.message : "Unable to save.",
      }));
    } finally {
      setBusyStep("");
    }
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Practice details are missing</h1>
          <p className="mt-2 text-slate-600">Return to the home page and start the workflow first.</p>
          <Link href="/" className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Workflow complete</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Writing practice finished</h1>
          <p className="mt-3 leading-7 text-slate-600">
            You have completed brainstorming, drafting, peer-reviewing, feedback judgement and revising.
            Submit your revised paragraph according to your teacher&apos;s instructions.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white">
            Start a new practice
          </Link>
        </div>
      </main>
    );
  }

  const step = workflow[activeIndex];
  const state = states[step.id];

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          AI-assisted argumentative writing workflow
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">CT-oriented writing practice</h1>
        <div className="mt-4 grid gap-1 text-sm text-slate-600">
          <p><strong>Student ID:</strong> {session.studentId}</p>
          <p><strong>Topic:</strong> {session.topic}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-slate-900">Writing stages</p>
          <ol className="grid gap-2">
            {workflow.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    activeIndex === index
                      ? "bg-blue-100 font-semibold text-blue-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}. {item.title.replace(/^Step \d+: /, "")}
                  {states[item.id]?.saved && <span className="ml-1 text-green-700">Saved</span>}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <StepCard
          index={activeIndex}
          step={step}
          state={state}
          busy={busyStep === step.id}
          message={messages[step.id] ?? ""}
          isLastStep={activeIndex === workflow.length - 1}
          onChangeInput={(value) => updateState(step.id, { studentInput: value, saved: false })}
          onGenerate={() => generate(step)}
          onSave={() => save(step)}
          onNext={() => {
            if (activeIndex === workflow.length - 1) {
              setFinished(true);
            } else {
              setActiveIndex((current) => current + 1);
            }
          }}
        />
      </div>
    </main>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-5 py-12">Loading practice...</main>}>
      <ActivityContent />
    </Suspense>
  );
}
