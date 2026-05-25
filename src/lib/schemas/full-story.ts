import { z } from "zod";
import { IFullStoryResponse } from "@/types/game";
import { parseToFullStoryResponse } from "@/utils/response-parser";

const NarrativeStateSchema = z.object({
  location: z.string(),
  status: z.string(),
  initItems: z.array(z.string()),
  storyProgress: z.string().optional(),
});

const ChoiceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  isCorrect: z.boolean(),
  consequence: z.string(),
  finalItems: z.array(z.string()),
});

const GameRoundSchema = z.object({
  intro: z.string(),
  round: z.number().int().positive(),
  location: z.string(),
  narrativeState: NarrativeStateSchema,
  choices: z.array(ChoiceSchema).min(1),
  failureSummary: z.string().optional(),
});

export const FullStoryResponseSchema = z.object({
  intro: z.string(),
  overallTheme: z.string(),
  rounds: z.array(GameRoundSchema).min(1),
});

/** Schema for Vercel AI SDK generateObject (structured output). */
export const FullStoryObjectSchema = FullStoryResponseSchema;

export function validateFullStoryResponse(raw: unknown): IFullStoryResponse {
  const parsed = parseToFullStoryResponse(raw);
  return FullStoryResponseSchema.parse(parsed);
}
