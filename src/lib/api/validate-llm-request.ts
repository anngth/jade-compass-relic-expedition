import {
  ContentLanguageType,
  IGameConfig,
  IProviderConfig,
  ProviderType,
} from "@/types/game";
import { readSessionApiKeys } from "@/lib/session/api-session";

const VALID_PROVIDERS = new Set<string>([
  "openrouter",
  "openai",
  "anthropic",
  "google",
  "mistral",
  "openai-ai-sdk",
  "anthropic-ai-sdk",
  "google-ai-sdk",
  "groq-ai-sdk",
  "mistral-ai-sdk",
  "openrouter-ai-sdk",
]);

const VALID_LANGUAGES = new Set<ContentLanguageType>(["English", "Vietnamese"]);
const CUSTOM_MODEL_PATTERN = /^[a-zA-Z0-9._\-:/]+$/;
const MAX_CUSTOM_MODEL_LENGTH = 128;
const MAX_API_KEY_LENGTH = 512;

export interface ValidatedLlmRequest {
  providerConfig: IProviderConfig;
  gameConfig?: IGameConfig;
}

function validateProviderFields(providerConfig: IProviderConfig): ProviderType {
  const provider = (providerConfig.provider ?? "openai") as ProviderType;
  if (!VALID_PROVIDERS.has(provider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  validateCustomModel(providerConfig);
  return provider;
}

function validateCustomModel(providerConfig: IProviderConfig): void {
  if (providerConfig.model !== "__custom__") return;

  const customModel = providerConfig.customModel?.trim();
  if (!customModel) {
    throw new Error("Custom model name is required");
  }
  if (customModel.length > MAX_CUSTOM_MODEL_LENGTH) {
    throw new Error(
      `Custom model name must be at most ${MAX_CUSTOM_MODEL_LENGTH} characters`
    );
  }
  if (!CUSTOM_MODEL_PATTERN.test(customModel)) {
    throw new Error("Custom model name contains invalid characters");
  }
}

function validateApiKey(apiKey: string | undefined, label = "API key"): string {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  if (apiKey.length > MAX_API_KEY_LENGTH) {
    throw new Error(`${label} is too long`);
  }
  return apiKey;
}

function validateGameConfig(gameConfig?: IGameConfig): void {
  if (!gameConfig) return;

  const rounds = gameConfig.rounds ?? 2;
  const choicesPerRound = gameConfig.choicesPerRound ?? 2;
  const language = gameConfig.contentLanguage ?? "English";

  if (rounds < 2 || rounds > 10) {
    throw new Error("rounds must be between 2 and 10");
  }
  if (choicesPerRound < 2 || choicesPerRound > 5) {
    throw new Error("choicesPerRound must be between 2 and 5");
  }
  if (!VALID_LANGUAGES.has(language)) {
    throw new Error("Invalid content language");
  }
}

export function validateSessionSetup(body: unknown): {
  apiKeyManager: Partial<Record<ProviderType, string>>;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { providerConfig } = body as { providerConfig?: IProviderConfig };
  if (!providerConfig || typeof providerConfig !== "object") {
    throw new Error("providerConfig is required");
  }

  const provider = validateProviderFields(providerConfig);
  const apiKeyManager = providerConfig.apiKeyManager ?? {};
  validateApiKey(apiKeyManager[provider]);

  return { apiKeyManager };
}

export async function validateLlmRequest(
  body: unknown
): Promise<ValidatedLlmRequest> {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { providerConfig, gameConfig } = body as {
    providerConfig?: IProviderConfig;
    gameConfig?: IGameConfig;
  };

  if (!providerConfig || typeof providerConfig !== "object") {
    throw new Error("providerConfig is required");
  }

  const provider = validateProviderFields(providerConfig);
  const sessionKeys = await readSessionApiKeys();
  if (!sessionKeys) {
    throw new Error("API session expired. Re-enter your API key.");
  }

  const apiKey = sessionKeys[provider];
  validateApiKey(apiKey, "Session API key");

  validateGameConfig(gameConfig);

  return {
    providerConfig: {
      ...providerConfig,
      apiKeyManager: sessionKeys,
    },
    gameConfig,
  };
}
