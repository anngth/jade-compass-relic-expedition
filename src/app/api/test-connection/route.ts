import { NextResponse } from "next/server";
import { ProviderFactory } from "@/lib/providers/provider-factory";
import { validateLlmRequest } from "@/lib/api/validate-llm-request";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerConfig } = await validateLlmRequest(body);

    const provider = await ProviderFactory.create(providerConfig);
    await provider.testConnection();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection test failed";
    const status = message.includes("API key") || message.includes("session")
      ? 401
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
