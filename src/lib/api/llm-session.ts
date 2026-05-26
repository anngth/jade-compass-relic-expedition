import type { IProviderConfig, ProviderType } from "@/types/llm";

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

function stripApiKeys(
  providerConfig: IProviderConfig
): Omit<IProviderConfig, "apiKeyManager"> {
  const safeConfig = { ...providerConfig };
  delete safeConfig.apiKeyManager;
  return safeConfig;
}

export async function syncApiSession(
  providerConfig: IProviderConfig
): Promise<void> {
  const provider = (providerConfig.provider ?? "openai") as ProviderType;
  const apiKey = providerConfig.apiKeyManager?.[provider];
  if (!apiKey?.trim()) {
    throw new Error("API key is required");
  }

  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ providerConfig }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function clearApiSession(): Promise<void> {
  await fetch("/api/session", {
    method: "DELETE",
    credentials: "include",
  });
}

export async function fetchWithSessionRetry(
  url: string,
  body: unknown,
  providerConfig: IProviderConfig
): Promise<Response> {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  };

  let response = await fetch(url, init);

  // Session expired or missing - sync once and retry.
  if (response.status === 401) {
    await syncApiSession(providerConfig);
    response = await fetch(url, init);
  }

  return response;
}

export async function parseSessionApiError(
  response: Response
): Promise<string> {
  return parseApiError(response);
}

export function withoutApiKeys(
  providerConfig: IProviderConfig
): Omit<IProviderConfig, "apiKeyManager"> {
  return stripApiKeys(providerConfig);
}

export async function testProviderConnection(
  providerConfig: IProviderConfig
): Promise<void> {
  const response = await fetchWithSessionRetry(
    "/api/test-connection",
    { providerConfig: stripApiKeys(providerConfig) },
    providerConfig
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
