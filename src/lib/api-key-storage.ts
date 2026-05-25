import { ProviderType } from "@/types/game";

const SESSION_KEY = "jadeCompassApiKeys";

type ApiKeyManager = Partial<Record<ProviderType, string>>;

export function loadApiKeys(): ApiKeyManager {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ApiKeyManager) : {};
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeyManager): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(keys));
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

export function clearLegacyApiKeysFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("jadeCompassSettings");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed?.providerConfig?.apiKeyManager) return;

    delete parsed.providerConfig.apiKeyManager;
    localStorage.setItem("jadeCompassSettings", JSON.stringify(parsed));
  } catch {
    // ignore corrupt storage
  }
}
