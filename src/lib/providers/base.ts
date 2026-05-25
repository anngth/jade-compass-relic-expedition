import {
  LLMProvider,
  IFullStoryResponse,
  ContentLanguageType,
} from "@/types/game";
import { logger } from "@/lib/logger";

export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;
  protected apiKey: string;
  protected apiBase: string;
  protected model: string;

  constructor(apiKey: string, apiBase: string, model: string) {
    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.model = model;
  }

  abstract generateFullStory(
    totalRounds: number,
    choicesPerRound: number,
    contentLanguage: ContentLanguageType,
    seed: string
  ): Promise<IFullStoryResponse>;

  protected createFullStorySystemPrompt({
    contentLanguage,
  }: {
    contentLanguage: ContentLanguageType;
  }): string {
    return `You are a narrative designer for a treasure-hunting adventure game called "Jade Compass: Relic Expedition".

Your task is to create a COMPLETE, CONNECTED story spanning multiple rounds. The story must:
- Maintain continuity between rounds
- Build tension as the player progresses
- Reference previous events and choices
- Culminate in finding the legendary Jade Compass
- Be written ENTIRELY in ${contentLanguage}

Your response must be in standard JSON format with no plain text, no markdown, no additional explanations, minimal, and no whitespace or end line.

The game theme is ALWAYS treasure hunting with elements like:
- Ancient ruins, mysterious temples, hidden caves,...
- Maps, compasses, artifacts, relics,...
- Traps, puzzles, rival treasure hunters,...
- Exotic locations with logical connections,...

Each round should BUILD upon the previous one, creating a cohesive adventure story.`;
  }

  protected createFullStoryPrompt(
    totalRounds: number,
    choicesPerRound: number,
    plusFormat: boolean = false
  ): string {
    return (
      `Generate a complete ${totalRounds}-round treasure hunting adventure.

Requirements:
1. Create a compelling introduction that sets up the adventure
2. Generate ${totalRounds} interconnected rounds forming a complete story arc
3. Each round must have exactly ${choicesPerRound} choices
4. Only ONE correct choice (isCorrect: true) per round
5. Ensure the correct answer position varies between rounds
6. Each choice must have clear consequences that affect the story
7. Maintain consistency in setting and characters
8. Include rich descriptions of locations, characters, and items
9. Each round should meaningfully advance the plot
10. The ending should be satisfying and consistent with the story flow
11. initItems is the initial items in the inventory before the choice is made
12. finalItems is the final items in the inventory after the choice is made
13. storyProgress is the summary of story events up to this point
14. location is the current location
15. status is the current status of the character
16. isCorrect is the correct choice
17. consequence is the consequence of the choice
18. id is the id of the choice
19. title is the title of the choice
20. summary is the summary of the choice
21. isCorrect is the correct choice
22. consequence is the consequence of the choice
` + (plusFormat ? this.createResponseFormat() : "")
    );
  }

  private createResponseFormat(): string {
    return `
Response Format (JSON only):
{
  "intro": "Compelling introduction to the adventure",
  "overall_theme": "Main theme of the story",
  "rounds": [
    {
      "id": "r1",
      "title": "Round 1 Title",
      "description": "Detailed description of the current situation",
      "narrativeState": {
        "location": "Current location",
        "status": "Character's current condition",
        "initItems": ["current", "inventory", "items"],
        "storyProgress": "Summary of story events up to this point"
      },
      "choices": [
        {
          "id": "r1_c1",
          "title": "Choice 1 Title",
          "summary": "What happens if this option is chosen (1-2 sentences)",
          "isCorrect": true,
          "consequence": "How this choice impacts the story",
          "finalItems": ["final", "inventory", "items"]
        },
        {
          "id": "r1_c2",
          "title": "Choice 2 Title",
          "summary": "What happens if this option is chosen",
          "isCorrect": false,
          "consequence": "Why this is not the optimal choice",
          "finalItems": ["final", "inventory", "items"]
        }
      ]
    }
  ]
}`;
  }

  protected createNextRoundStoryPrompt(
    totalRounds: number,
    choicesPerRound: number,
    plusFormat: boolean = false
  ): string {
    return (
      `Generate a complete ${totalRounds}-round treasure hunting adventure.

    Requirements:
    1. Create a compelling introduction that sets up the adventure
    2. Generate ${totalRounds} interconnected rounds forming a complete story arc
    3. Each round must have exactly ${choicesPerRound} choices
    4. Only ONE correct choice (isCorrect: true) per round
    ` + (plusFormat ? this.createResponseFormat() : "")
    );
  }

  // Helper methods for consistent logging
  protected logRequest(
    method: string,
    requestId: string,
    prompt: string,
    systemPrompt: string,
    metadata?: Record<string, unknown>
  ) {
    logger.group(`[LLM ${this.name}] ${method} #${requestId}`);
    logger.log("model:", this.model);
    if (metadata) logger.log("meta:", metadata);
    logger.log("system length:", systemPrompt.length);
    logger.log("prompt length:", prompt.length);
    logger.groupEnd();
  }

  protected logResponse(
    requestId: string,
    response?: string | object,
    json?: object,
    parsedResponse?: object,
    responseTime?: number,
    error?: string,
    metadata?: Record<string, unknown>
  ) {
    logger.group(`[LLM Response] #${requestId}`);
    if (typeof responseTime === "number") logger.log("ms:", responseTime);
    if (metadata) logger.log("meta:", metadata);
    if (error) {
      logger.error("error:", error);
    }
    if (response) {
      logger.log("response received:", typeof response === "string" ? `[${response.length} chars]` : "[object]");
    }
    if (json) {
      logger.log("json keys:", Object.keys(json));
    }
    if (parsedResponse) {
      logger.log("parsed rounds:", (parsedResponse as { rounds?: unknown[] }).rounds?.length ?? 0);
    }
    logger.groupEnd();
  }

  generateRequestId(): string {
    // Simple unique-ish id for debugging
    const rand = Math.random().toString(36).slice(4, 16);
    return `${Date.now().toString(36)}-${rand}`;
  }

  abstract testModelsAvailability(): Promise<void>;
  abstract testConnection(): Promise<void>;
}
