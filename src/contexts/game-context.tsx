"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { logger } from "@/lib/logger";
import {
  IGameState,
  IChoice,
  IGameRound,
} from "@/types/game";
import { generateStory } from "@/lib/api/llm-api";
import { createStorySeed } from "@/lib/story-seed";
import { useSettings } from "@/contexts/settings-context";
import { toast } from "sonner";

interface GameContextType {
  gameState: IGameState;
  allRounds: IGameRound[] | null;
  currentRoundData: IGameRound | null;
  isLoading: boolean;
  loadingMessage?: string;
  startGame: () => Promise<void>;
  makeChoice: (choice: IChoice) => Promise<void>;
  resetGame: () => void;
}

const defaultGameState: IGameState = {
  status: "idle",
  currentRound: 0,
  narrativeState: {
    location: "Unknown",
    status: "Ready",
    initItems: [],
  },
  choiceHistory: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [gameState, setGameState] = useState<IGameState>(defaultGameState);
  const [allRounds, setAllRounds] = useState<IGameRound[] | null>(null);
  const [currentRoundData, setCurrentRoundData] = useState<IGameRound | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(
    undefined
  );

  const startGame = useCallback(async () => {
    try {
      const { providerConfig, gameConfig } = settings;
      if (!providerConfig) {
        throw new Error("Provider configuration is required");
      }
      setIsLoading(true);
      setLoadingMessage("Generating your adventure…");

      const rounds = gameConfig?.rounds || 2;
      const choicesPerRound = gameConfig?.choicesPerRound || 2;

      const storyData = await generateStory(
        providerConfig,
        {
          rounds,
          choicesPerRound,
          contentLanguage: gameConfig?.contentLanguage || "English",
        },
        createStorySeed()
      );

      if (!storyData?.rounds?.length) {
        throw new Error("Failed to generate story data");
      }

      setAllRounds(storyData.rounds);
      setCurrentRoundData(storyData.rounds[0]);

      setGameState({
        status: "playing",
        currentRound: 1,
        narrativeState: storyData.rounds[0].narrativeState,
        choiceHistory: [],
        intro: storyData.intro,
        overallTheme: storyData.overallTheme,
      });
    } catch (error) {
      toast.error("Failed to start game: " + (error as Error).message);
      logger.error("Start game error:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage(undefined);
    }
  }, [settings]);

  const makeChoice = useCallback(
    async (choice: IChoice) => {
      if (!allRounds) return;

      if (!choice.isCorrect) {
        setGameState((prev: IGameState) => ({
          ...prev,
          status: "failure",
          failureReason: choice.consequence,
          choiceHistory: [...prev.choiceHistory, choice],
        }));
        return;
      }

      if (gameState.currentRound >= (settings.gameConfig?.rounds || 2)) {
        setGameState((prev: IGameState) => ({
          ...prev,
          status: "victory",
          choiceHistory: [...prev.choiceHistory, choice],
        }));
        return;
      }

      const nextRoundIndex = gameState.currentRound;
      if (nextRoundIndex < allRounds.length) {
        const nextRound = allRounds[nextRoundIndex];
        setCurrentRoundData(nextRound);
        setGameState((prev: IGameState) => ({
          ...prev,
          currentRound: prev.currentRound + 1,
          narrativeState: nextRound.narrativeState || prev.narrativeState,
          choiceHistory: [...prev.choiceHistory, choice],
        }));
      }
    },
    [allRounds, gameState, settings.gameConfig]
  );

  const resetGame = useCallback(() => {
    setGameState(defaultGameState);
    setAllRounds(null);
    setCurrentRoundData(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      gameState,
      allRounds,
      currentRoundData,
      isLoading,
      loadingMessage,
      startGame,
      makeChoice,
      resetGame,
    }),
    [
      gameState,
      allRounds,
      currentRoundData,
      isLoading,
      loadingMessage,
      startGame,
      makeChoice,
      resetGame,
    ]
  );

  useEffect(() => {
    logger.debug("GameContext state updated", {
      gameStateStatus: gameState.status,
      currentRound: gameState.currentRound,
      hasAllRounds: Boolean(allRounds),
    });
  }, [gameState.status, gameState.currentRound, allRounds]);

  return (
    <GameContext.Provider value={contextValue}>
      {isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-[var(--background)] pixel-border pixel-shadow px-6 py-5 text-center">
            <div className="font-pixel text-[var(--primary)] mb-3">
              LOADING…
            </div>
            <div className="flex gap-1 justify-center mb-2">
              <span className="w-3 h-3 bg-[var(--primary)] animate-bounce [animation-delay:-0.2s]"></span>
              <span className="w-3 h-3 bg-[var(--primary)]/80 animate-bounce [animation-delay:-0.1s]"></span>
              <span className="w-3 h-3 bg-[var(--primary)]/60 animate-bounce"></span>
            </div>
            {loadingMessage && (
              <div className="font-retro text-base text-[var(--muted-foreground)]">
                {loadingMessage}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
