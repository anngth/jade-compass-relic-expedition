import { ProviderDataType } from "@/types/game";

// ─── OpenAI ──────────────────────────────────────────────────────────────────
// Removed: gpt-5-chat-latest (non-standard), gpt-4-turbo / gpt-4 / gpt-3.5-turbo
//          (all shutting down 2026-10-23 per OpenAI deprecations page)
const OPENAI_MODELS = [
  { value: "gpt-5" },
  { value: "gpt-5-mini" },
  { value: "gpt-5-nano" },
  { value: "gpt-4o" },
  { value: "gpt-4o-mini" },
  { value: "__custom__", label: "Custom Model (Enter below)" },
];

// ─── Anthropic ───────────────────────────────────────────────────────────────
// Removed: claude-opus-4-20250514 / claude-sonnet-4-20250514 (retire 2026-06-15)
//          claude-3-7-sonnet-latest / -20250219 (retired 2026-02-19)
//          claude-3-5-sonnet-latest / claude-3-5-haiku-20241022 (retired 2026-02-19)
//          claude-3-haiku-20240307 (retired 2026-04-20)
const ANTHROPIC_MODELS = [
  { value: "claude-opus-4-latest" },
  { value: "claude-sonnet-4-latest" },
  { value: "claude-opus-4-7" },
  { value: "claude-opus-4-6" },
  { value: "claude-sonnet-4-6" },
  { value: "claude-sonnet-4-5-20250929" },
  { value: "claude-haiku-4-5-20251001" },
  { value: "claude-opus-4-1-20250805" },
  { value: "__custom__", label: "Custom Model (Enter below)" },
];

// ─── Google ───────────────────────────────────────────────────────────────────
// Removed: gemini-2.0-flash / gemini-2.0-flash-exp (shutdown 2026-06-01, 6 days away)
//          gemini-1.5-flash / gemini-1.5-pro (both retired 2025)
// Added:   gemini-3.5-flash (released 2026-05-19, no retirement date)
//          gemini-3.1-flash-lite (released 2026-05-07, no retirement date)
const GOOGLE_MODELS = [
  { value: "gemini-3.5-flash" },
  { value: "gemini-3.1-flash-lite" },
  { value: "gemini-2.5-pro" },
  { value: "gemini-2.5-flash" },
  { value: "gemini-2.5-flash-lite" },
  { value: "__custom__", label: "Custom Model (Enter below)" },
];

// ─── Groq ─────────────────────────────────────────────────────────────────────
// Removed: mixtral-8x7b-32768 (deprecated 2025-03-20), gemma2-9b-it (deprecated 2025-08-08)
// Added:   qwen/qwen3-32b (current replacement for Mixtral on Groq)
//          openai/gpt-oss-120b (current flagship on Groq)
const GROQ_MODELS = [
  { value: "meta-llama/llama-4-scout-17b-16e-instruct" },
  { value: "openai/gpt-oss-120b" },
  { value: "qwen/qwen3-32b" },
  { value: "llama-3.3-70b-versatile" },
  { value: "llama-3.1-8b-instant" },
  { value: "__custom__", label: "Custom Model (Enter below)" },
];

// ─── Mistral ──────────────────────────────────────────────────────────────────
// Removed: pixtral-large-latest (deprecated — replaced by newer vision models)
//          pixtral-12b-2409 (deprecated 2025-12-02)
// Added:   ministral-8b-latest (lightweight, fast)
//          magistral-medium-2506 (June 2026 reasoning model)
const MISTRAL_MODELS = [
  { value: "mistral-large-latest" },
  { value: "mistral-medium-latest" },
  { value: "mistral-small-latest" },
  { value: "magistral-medium-2506" },
  { value: "mistral-medium-2505" },
  { value: "ministral-8b-latest" },
  { value: "__custom__", label: "Custom Model (Enter below)" },
];

// ─── OpenRouter (free tier) ───────────────────────────────────────────────────
// Kept recent free models; gemini-2.0-flash-exp may stop working ~2026-06-01
const OPENROUTER_MODELS = [
  { value: "deepseek/deepseek-chat-v3-0324:free" },
  { value: "deepseek/deepseek-r1-0528:free" },
  { value: "moonshotai/kimi-k2:free" },
  { value: "qwen/qwen3-235b-a22b:free" },
  { value: "microsoft/mai-ds-r1:free" },
  { value: "meta-llama/llama-3.3-70b-instruct:free" },
  { value: "openai/gpt-oss-20b:free" },
  { value: "qwen/qwen3-14b:free" },
  { value: "mistralai/mistral-small-3.2-24b-instruct:free" },
  { value: "google/gemma-3-27b-it:free" },
  { value: "z-ai/glm-4.5-air:free" },
  { value: "__custom__", label: "Custom Model (Enter below)" },
];

export const providerData: ProviderDataType = {
  // Popular Providers
  openrouter: {
    providerName: "OpenRouter",
    apiBase: "https://openrouter.ai/api/v1",
    link: "openrouter.ai/keys",
    models: OPENROUTER_MODELS,
    defaultModel: OPENROUTER_MODELS[0].value,
  },
  openai: {
    providerName: "OpenAI",
    apiBase: "https://api.openai.com/v1",
    link: "platform.openai.com/api-keys",
    models: OPENAI_MODELS,
    defaultModel: OPENAI_MODELS[0].value,
  },
  anthropic: {
    providerName: "Anthropic",
    apiBase: "https://api.anthropic.com/v1",
    link: "console.anthropic.com/account/keys",
    models: ANTHROPIC_MODELS,
    defaultModel: ANTHROPIC_MODELS[1].value, // claude-sonnet-4-latest
  },
  google: {
    providerName: "Google",
    apiBase: "https://generativelanguage.googleapis.com",
    link: "aistudio.google.com/app/apikey",
    models: GOOGLE_MODELS,
    defaultModel: GOOGLE_MODELS[0].value, // gemini-3.5-flash
  },
  mistral: {
    providerName: "Mistral",
    apiBase: "https://api.mistral.ai",
    link: "console.mistral.ai/api-keys",
    models: MISTRAL_MODELS,
    defaultModel: MISTRAL_MODELS[0].value,
  },
  // AI SDK Providers
  "openai-ai-sdk": {
    providerName: "OpenAI (AI SDK)",
    apiBase: "https://api.openai.com/v1",
    link: "platform.openai.com/api-keys",
    models: OPENAI_MODELS,
    defaultModel: OPENAI_MODELS[0].value,
  },
  "anthropic-ai-sdk": {
    providerName: "Anthropic (AI SDK)",
    apiBase: "https://api.anthropic.com",
    link: "console.anthropic.com/account/keys",
    models: ANTHROPIC_MODELS,
    defaultModel: ANTHROPIC_MODELS[1].value,
  },
  "google-ai-sdk": {
    providerName: "Google (AI SDK)",
    apiBase: "https://generativelanguage.googleapis.com",
    link: "aistudio.google.com/app/apikey",
    models: GOOGLE_MODELS,
    defaultModel: GOOGLE_MODELS[0].value,
  },
  "groq-ai-sdk": {
    providerName: "Groq (AI SDK)",
    apiBase: "https://api.groq.com/openai/v1",
    link: "console.groq.com/keys",
    models: GROQ_MODELS,
    defaultModel: GROQ_MODELS[0].value,
  },
  "mistral-ai-sdk": {
    providerName: "Mistral (AI SDK)",
    apiBase: "https://api.mistral.ai",
    link: "console.mistral.ai/api-keys",
    models: MISTRAL_MODELS,
    defaultModel: MISTRAL_MODELS[0].value,
  },
  "openrouter-ai-sdk": {
    providerName: "OpenRouter (AI SDK)",
    apiBase: "https://openrouter.ai/api/v1",
    link: "openrouter.ai/keys",
    models: OPENROUTER_MODELS,
    defaultModel: OPENROUTER_MODELS[0].value,
  },
};
