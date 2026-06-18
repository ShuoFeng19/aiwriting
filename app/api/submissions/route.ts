import { NextResponse } from "next/server";
import { appendSubmission } from "@/lib/storage";
import { workflowMap } from "@/lib/workflow";
import type { SubmissionRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<SubmissionRecord, "id" | "timestamp">;
    const step = workflowMap[body.stepId];

    if (!body.studentId?.trim() || !body.topic?.trim() || !step) {
      return NextResponse.json(
        { error: "Student ID, topic and a valid stage are required." },
        { status: 400 },
      );
    }

    const submission = await appendSubmission({
      ...body,
      studentId: body.studentId.trim(),
      topic: body.topic.trim(),
      stepName: step.title,
    });
    return NextResponse.json({ submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the submission.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
