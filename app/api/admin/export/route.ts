import { isAdminPasswordValid } from "@/lib/admin";
import { submissionsToCsv } from "@/lib/csv";
import { readSubmissions } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (!isAdminPasswordValid(body.password)) {
    return Response.json({ error: "Invalid admin password." }, { status: 401 });
  }

  const csv = submissionsToCsv(await readSubmissions());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="writing-intervention-submissions.csv"',
    },
  });
}
