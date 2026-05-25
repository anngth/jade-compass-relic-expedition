import { z } from "zod";

const VALID_PROVIDERS = [
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
] as const;

const VALID_LANGUAGES = ["English", "Vietnamese"] as const;

export const StoredSettingsSchema = z
  .object({
    gameConfig: z
      .object({
        rounds: z.number().int().min(2).max(10).optional(),
        choicesPerRound: z.number().int().min(2).max(5).optional(),
        contentLanguage: z.enum(VALID_LANGUAGES).optional(),
      })
      .optional(),
    providerConfig: z
      .object({
        provider: z.enum(VALID_PROVIDERS).optional(),
        model: z.string().max(256).optional(),
        customModel: z.string().max(128).optional(),
        apiBase: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
  })
  .strip();

export type StoredSettings = z.infer<typeof StoredSettingsSchema>;
