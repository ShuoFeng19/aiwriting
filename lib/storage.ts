import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SubmissionRecord } from "@/lib/types";

const dataDirectory =
  process.env.RAILWAY_VOLUME_MOUNT_PATH ||
  process.env.DATA_DIR ||
  path.join(process.cwd(), "data");
const submissionsPath = path.join(dataDirectory, "submissions.json");

declare global {
  // eslint-disable-next-line no-var
  var submissionWriteQueue: Promise<void> | undefined;
}

async function ensureDataFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(submissionsPath, "utf8");
  } catch {
    await writeFile(submissionsPath, "[]\n", "utf8");
  }
}

export async function readSubmissions(): Promise<SubmissionRecord[]> {
  await ensureDataFile();
  const raw = await readFile(submissionsPath, "utf8");
  return JSON.parse(raw) as SubmissionRecord[];
}

export async function appendSubmission(
  record: Omit<SubmissionRecord, "id" | "timestamp">,
) {
  const submission: SubmissionRecord = {
    ...record,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };

  const operation = async () => {
    const submissions = await readSubmissions();
    submissions.push(submission);
    await writeFile(submissionsPath, `${JSON.stringify(submissions, null, 2)}\n`, "utf8");
  };

  globalThis.submissionWriteQueue = (globalThis.submissionWriteQueue ?? Promise.resolve())
    .then(operation, operation);
  await globalThis.submissionWriteQueue;
  return submission;
}
