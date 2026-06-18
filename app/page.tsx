"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  function startLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentId.trim() || !topic.trim()) {
      setError("Please enter your Student ID and writing topic.");
      return;
    }
    const query = new URLSearchParams({
      studentId: studentId.trim(),
      topic: topic.trim(),
    });
    router.push(`/activity?${query.toString()}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
          AI group classroom system
        </p>
          <h1 className="text-3xl font-bold text-slate-900">Start your writing practice</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
          Follow the five stages in order. AI is a thinking scaffold: it can give guidance,
          questions, options and feedback, but it must not write your paragraph for you.
        </p>
      </section>

      <form onSubmit={startLesson} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-800">Student ID</span>
            <input
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              placeholder="Enter your assigned ID"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-800">Writing topic</span>
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="min-h-24 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              placeholder="Enter the argumentative writing topic provided by your teacher"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}
        <button className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
          Start practice
        </button>
      </form>
    </main>
  );
}
