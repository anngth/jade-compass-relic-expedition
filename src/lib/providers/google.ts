import { GoogleGenAI } from "@google/genai";
import { ContentLanguageType, IFullStoryResponse } from "@/types/game";
import { BaseLLMProvider } from "./base";
import { validateFullStoryResponse } from "@/lib/schemas/full-story";
import { parseJSONResponse } from "@/utils/string";
import { logger } from "../logger";

export class GoogleProvider extends BaseLLMProvider {
  name: string;
  protected apiKey: string;
  protected apiBase: string;
  protected model: string;
  protected client: GoogleGenAI;

  constructor(apiKey: string, name: string, apiBase: string, model: string) {
    super(apiKey, apiBase, model);
    this.name = name;
    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.model = model;

    if (!apiKey) {
      throw new Error(`${name} API key is required`);
    }

    this.client = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateFullStory(
    totalRounds: number,
    choicesPerRound: number,
    contentLanguage: ContentLanguageType,
    seed: string
  ): Promise<IFullStoryResponse> {
    const requestId = this.generateRequestId();
    const systemPrompt = this.createFullStorySystemPrompt({
      contentLanguage,
    });
    const prompt = this.createFullStoryPrompt(
      totalRounds,
      choicesPerRound,
      true
    );

    this.logRequest("generateFullStory", requestId, prompt, systemPrompt, {
      totalRounds,
      choicesPerRound,
      seed,
      model: this.model,
    });

    const startTime = Date.now();
    try {
      if (!this.apiKey) {
        throw new Error(`${this.name} API key is not configured`);
      }

      // Combine system prompt and user prompt
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: fullPrompt,
      });

      const content = response.text;

      if (!content) {
        throw new Error(`No content in response from ${this.name}`);
      }

      const responseTime = Date.now() - startTime;

      const jsonText = parseJSONResponse<object>(content);
      const parsedResponse = validateFullStoryResponse(jsonText);

      this.logResponse(
        requestId,
        response,
        jsonText,
        parsedResponse,
        responseTime,
        undefined,
        undefined
      );

      return parsedResponse;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.logResponse(
        requestId,
        undefined,
        undefined,
        undefined,
        responseTime,
        errorMessage,
        undefined
      );

      throw new Error(`Failed to generate story: ${errorMessage}`);
    }
  }

  async testModelsAvailability() {
    try {
      const models = await this.client.models.list();
      logger.log("Google models:", models);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`${errorMessage}`);
    }
  }

  async testConnection() {
    await this.testModelsAvailability();
  }
}
