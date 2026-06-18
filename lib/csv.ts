import type { SubmissionRecord } from "@/lib/types";

const columns: Array<keyof SubmissionRecord> = [
  "id",
  "studentId",
  "topic",
  "stepId",
  "stepName",
  "studentInput",
  "aiOutput",
  "timestamp",
];

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function submissionsToCsv(submissions: SubmissionRecord[]) {
  return [
    columns.join(","),
    ...submissions.map((record) =>
      columns.map((column) => escapeCsv(record[column])).join(","),
    ),
  ].join("\r\n");
}
