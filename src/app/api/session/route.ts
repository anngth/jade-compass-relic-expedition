import { NextResponse } from "next/server";
import { validateSessionSetup } from "@/lib/api/validate-llm-request";
import { writeSessionCookie, clearSessionCookie } from "@/lib/session/api-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKeyManager } = validateSessionSetup(body);

    await writeSessionCookie(apiKeyManager);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to clear session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
