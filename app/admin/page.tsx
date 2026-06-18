"use client";

import { useState } from "react";
import type { SubmissionRecord } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadSubmissions() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { submissions?: SubmissionRecord[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to load submissions.");
      setSubmissions(data.submissions ?? []);
      setMessage(`Loaded ${data.submissions?.length ?? 0} records.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load submissions.");
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Unable to export CSV.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "writing-intervention-submissions.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("CSV export downloaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to export CSV.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Teacher access</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Admin and CSV export</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the password configured in <code>.env.local</code>. Password checks happen on the server.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-w-64 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            placeholder="Admin password"
          />
          <button
            type="button"
            onClick={loadSubmissions}
            disabled={busy}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            View submissions
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
        {message && <p className="mt-4 text-sm font-medium text-blue-800">{message}</p>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-800">
              <tr>
                {["Timestamp", "Student", "Stage", "Topic", "Student input", "AI output"].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-4 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {submissions.map((record) => (
                <tr key={record.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{record.studentId}</td>
                  <td className="min-w-56 px-4 py-3 text-slate-600">{record.stepName}</td>
                  <td className="min-w-64 px-4 py-3 text-slate-600">{record.topic}</td>
                  <td className="min-w-96 whitespace-pre-wrap px-4 py-3 text-slate-600">{record.studentInput}</td>
                  <td className="min-w-96 whitespace-pre-wrap px-4 py-3 text-slate-600">{record.aiOutput}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {submissions.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No records loaded yet.</p>
        )}
      </section>
    </main>
  );
}
