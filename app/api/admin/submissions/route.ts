import { NextResponse } from "next/server";
import { isAdminPasswordValid } from "@/lib/admin";
import { readSubmissions } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (!isAdminPasswordValid(body.password)) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }

  return NextResponse.json({ submissions: await readSubmissions() });
}
