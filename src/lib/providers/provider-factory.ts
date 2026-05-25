import { LLMProvider, IProviderConfig } from "@/types/game";
import { providerData } from "@/lib/providers/provider-data";

export class ProviderFactory {
  static async create(config: IProviderConfig): Promise<LLMProvider> {
    const provider = config.provider ?? "openai";
    const apiKey = config.apiKeyManager?.[provider];
    const providerInfo = providerData[provider];
    const effectiveModel =
      config.model === "__custom__" && config.customModel
        ? config.customModel
        : (config.model ?? providerInfo?.defaultModel);

    switch (provider) {
      case "openai": {
        if (!apiKey) {
          throw new Error("API key is required for OpenAI");
        }
        const { OpenAIProvider } = await import("./openai");
        return new OpenAIProvider(
          apiKey,
          "OpenAI",
          providerData.openai.apiBase,
          effectiveModel || providerData.openai.defaultModel,
        );
      }

      case "openrouter": {
        if (!apiKey) {
          throw new Error("API key is required for OpenRouter");
        }
        const { OpenAIProvider } = await import("./openai");
        return new OpenAIProvider(
          apiKey,
          "OpenRouter",
          providerData.openrouter.apiBase,
          effectiveModel || providerData.openrouter.defaultModel,
        );
      }

      case "anthropic": {
        if (!apiKey) {
          throw new Error("API key is required for Anthropic");
        }
        const { AnthropicProvider } = await import("./anthropic");
        return new AnthropicProvider(
          apiKey,
          "Anthropic",
          providerData.anthropic.apiBase,
          effectiveModel || providerData.anthropic.defaultModel,
        );
      }

      case "google": {
        if (!apiKey) {
          throw new Error("API key is required for Google");
        }
        const { GoogleProvider } = await import("./google");
        return new GoogleProvider(
          apiKey,
          "Google",
          providerData.google.apiBase,
          effectiveModel || providerData.google.defaultModel,
        );
      }

      case "mistral": {
        if (!apiKey) {
          throw new Error("API key is required for Mistral");
        }
        const { MistralProvider } = await import("./mistral");
        return new MistralProvider(
          apiKey,
          "Mistral",
          providerData.mistral.apiBase,
          effectiveModel || providerData.mistral.defaultModel,
        );
      }

      case "openai-ai-sdk":
      case "anthropic-ai-sdk":
      case "google-ai-sdk":
      case "groq-ai-sdk":
      case "mistral-ai-sdk":
      case "openrouter-ai-sdk": {
        if (!apiKey) {
          throw new Error(
            `API key is required for ${providerInfo.providerName}`,
          );
        }
        const { VercelAIProvider } = await import("./vercel");
        return new VercelAIProvider(
          apiKey,
          providerInfo.providerName,
          providerInfo.apiBase,
          effectiveModel || providerInfo.defaultModel,
          provider,
        );
      }

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
