import {
  IFullStoryResponse,
  IGameRound,
  IChoice,
  INarrativeState,
} from "@/types/game";

function readPath(obj: unknown, ...keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function readString(obj: unknown, ...keys: string[]): string {
  const value = readPath(obj, ...keys);
  return typeof value === "string" ? value : "";
}

/**
 * Parses a raw response object to IFullStoryResponse
 */
export function parseToFullStoryResponse(
  rawResponse: unknown,
): IFullStoryResponse {
  const intro = readString(rawResponse, "intro");
  const overallTheme =
    readString(rawResponse, "overallTheme") ||
    readString(rawResponse, "overall_theme");
  const roundsRaw = readPath(rawResponse, "rounds");
  const rounds = Array.isArray(roundsRaw)
    ? roundsRaw.map((round: unknown, index: number) =>
        parseGameRound(round, index),
      )
    : [];

  return {
    intro,
    overallTheme,
    rounds,
  };
}

function parseGameRound(round: unknown, index: number): IGameRound {
  const intro = readString(round, "intro") || readString(round, "description");
  const roundNumber =
    readPath(round, "round") ?? readPath(round, "id") ?? index + 1;
  const location = readString(round, "location");
  const narrativeState = parseNarrativeState(round);
  const choicesRaw = readPath(round, "choices");
  const choices = Array.isArray(choicesRaw)
    ? choicesRaw.map((choice: unknown) => parseChoice(choice))
    : [];
  const failureSummary =
    readString(round, "failureSummary") || readString(round, "failure_summary");

  return {
    intro,
    round: normalizeRoundNumber(roundNumber, index),
    location,
    narrativeState,
    choices,
    failureSummary: failureSummary || undefined,
  };
}

function normalizeRoundNumber(roundNumber: unknown, index: number): number {
  if (typeof roundNumber === "string") {
    const parsed = parseInt(roundNumber, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : index + 1;
  }
  if (
    typeof roundNumber === "number" &&
    Number.isFinite(roundNumber) &&
    roundNumber > 0
  ) {
    return roundNumber;
  }
  return index + 1;
}

function parseNarrativeState(round: unknown): INarrativeState {
  const narrativeState =
    readPath(round, "narrativeState") ??
    readPath(round, "narrative_state") ??
    {};
  const location = readString(narrativeState, "location");
  const status = readString(narrativeState, "status");
  const initItems =
    readPath(narrativeState, "initItems") ??
    readPath(narrativeState, "items") ??
    readPath(narrativeState, "init_items");
  const storyProgress =
    readString(narrativeState, "storyProgress") ||
    readString(narrativeState, "story_progress");

  return {
    location,
    status,
    initItems: Array.isArray(initItems)
      ? initItems.filter((item): item is string => typeof item === "string")
      : [],
    storyProgress: storyProgress || undefined,
  };
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "y" ||
      normalized === "1"
    );
  }
  return false;
}

function parseChoice(choice: unknown): IChoice {
  const id = readString(choice, "id");
  const title = readString(choice, "title");
  const summary = readString(choice, "summary");
  const isCorrectRaw =
    readPath(choice, "isCorrect") ??
    readPath(choice, "is_correct") ??
    readPath(choice, "correct");
  const consequence = readString(choice, "consequence");
  const finalItems =
    readPath(choice, "finalItems") ??
    readPath(choice, "final_items") ??
    readPath(choice, "items");

  return {
    id,
    title,
    summary,
    isCorrect: toBoolean(isCorrectRaw),
    consequence,
    finalItems: Array.isArray(finalItems)
      ? finalItems.filter((item): item is string => typeof item === "string")
      : [],
  };
}
