"use client";

import type { StepDefinition, StepState } from "@/lib/types";

type Props = {
  index: number;
  step: StepDefinition;
  state: StepState;
  busy: boolean;
  message: string;
  isLastStep: boolean;
  onChangeInput: (value: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  onNext: () => void;
};

export function StepCard({
  index,
  step,
  state,
  busy,
  message,
  isLastStep,
  onChangeInput,
  onGenerate,
  onSave,
  onNext,
}: Props) {
  return (
    <section className="rounded-2xl border border-blue-500 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
          {index + 1}
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{step.instruction}</p>
        </div>
      </div>

      <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        {step.detail}
      </p>

      {step.supportsAi ? (
        <>
          <label className="mt-5 grid gap-2">
            <span className="text-sm font-semibold text-slate-800">{step.inputLabel}</span>
            <textarea
              value={state.studentInput}
              onChange={(event) => onChangeInput(event.target.value)}
              className="min-h-40 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
              placeholder={step.inputPlaceholder}
            />
          </label>

          <button
            type="button"
            onClick={onGenerate}
            disabled={busy}
            className="mt-4 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Generating..." : "Generate AI support"}
          </button>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-800">AI output</p>
            <div className="min-h-32 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
              {state.aiOutput || "AI guidance will appear here."}
            </div>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-900">
          No AI interaction is provided at this stage. Complete the task independently, then continue.
        </p>
      )}

      {message && <p className="mt-4 text-sm font-medium text-blue-800">{message}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        {step.supportsAi && (
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save AI interaction
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          {isLastStep ? "Finish practice" : "Next stage"}
        </button>
      </div>
    </section>
  );
}
