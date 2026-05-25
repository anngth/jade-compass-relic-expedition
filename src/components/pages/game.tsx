"use client";

import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useGame } from "@/contexts/game-context";
import { useSettings } from "@/contexts/settings-context";
import { IChoice } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ChoiceCardProps {
  choice: IChoice;
  index: number;
  className: string;
  onClick: () => void;
}

const ChoiceCard = memo(function ChoiceCard({
  choice,
  index,
  className,
  onClick,
}: ChoiceCardProps) {
  return (
    <Card key={choice.id} className={className} onClick={onClick}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{choice.title}</span>
          <span className="font-pixel text-sm text-[var(--muted-foreground)]">
            [{index + 1}]
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-retro text-[var(--muted-foreground)]">
          {choice.summary}
        </p>
      </CardContent>
    </Card>
  );
});

export function GamePage() {
  const { gameState, makeChoice, currentRoundData, isLoading } = useGame();
  const { settings } = useSettings();

  const [selectedChoice, setSelectedChoice] = useState<IChoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChoice = useCallback(
    async (choice: IChoice) => {
      if (isProcessing) return;

      setSelectedChoice(choice);
      setIsProcessing(true);

      try {
        await makeChoice(choice);
      } catch (error) {
        console.error("Error making choice:", error);
        throw error;
      } finally {
        setIsProcessing(false);
        setSelectedChoice(null);
      }
    },
    [isProcessing, makeChoice]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!currentRoundData || isProcessing) return;

      // Early return if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Check for digit keys using e.code
      let digit: number | null = null;
      if (e.code.startsWith("Digit")) {
        digit = parseInt(e.code.replace("Digit", ""));
      } else if (e.code.startsWith("Numpad")) {
        digit = parseInt(e.code.replace("Numpad", ""));
      }

      if (digit && digit >= 1 && digit <= currentRoundData.choices.length) {
        const choice = currentRoundData.choices[digit - 1];
        handleChoice(choice);
      }
    },
    [currentRoundData, isProcessing, handleChoice]
  );

  // Memoize the items display logic
  const itemsDisplay = useMemo(() => {
    const items =
      currentRoundData?.narrativeState.initItems ??
      gameState.narrativeState.initItems ??
      [];
    return items.length ? items.join(", ") : "None";
  }, [
    currentRoundData?.narrativeState.initItems,
    gameState.narrativeState.initItems,
  ]);

  // Memoize choice card class names
  const getChoiceCardClassName = useCallback(
    (choice: IChoice) => {
      const baseClasses = "cursor-pointer transition-all hover:scale-105";
      const selectedClasses =
        selectedChoice?.id === choice.id ? "ring-4 ring-[var(--primary)]" : "";
      const processingClasses =
        isProcessing && selectedChoice?.id !== choice.id ? "opacity-50" : "";

      return `${baseClasses} ${selectedClasses} ${processingClasses}`.trim();
    },
    [selectedChoice?.id, isProcessing]
  );

  // Memoize choice click handler
  const createChoiceClickHandler = useCallback(
    (choice: IChoice) => {
      return () => handleChoice(choice);
    },
    [handleChoice]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading || !currentRoundData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)] mx-auto" />
          <p className="font-pixel text-lg">Loading adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          {gameState.overallTheme && (
            <h1 className="font-pixel text-3xl text-[var(--accent)] mb-4">
              {gameState.overallTheme}
            </h1>
          )}
          <h2 className="font-pixel text-2xl text-[var(--primary)]">
            Round {gameState.currentRound} of {settings?.gameConfig?.rounds}
          </h2>
          {gameState.intro && gameState.currentRound === 1 && (
            <p className="font-retro text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              {gameState.intro}
            </p>
          )}
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-base font-retro mb-4">
              <div>
                <span className="text-[var(--muted-foreground)]">
                  Location:{" "}
                </span>
                <span className="text-[var(--accent)]">
                  {currentRoundData?.narrativeState.location ||
                    gameState.narrativeState.location}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Status: </span>
                <span className="text-[var(--primary)]">
                  {currentRoundData?.narrativeState.status ||
                    gameState.narrativeState.status}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Items: </span>
                <span>{itemsDisplay}</span>
              </div>
              {(currentRoundData?.narrativeState.storyProgress ||
                gameState.narrativeState.storyProgress) && (
                <div>
                  <span className="text-[var(--muted-foreground)]">
                    Progress:{" "}
                  </span>
                  <span className="text-[var(--accent)]">
                    {currentRoundData?.narrativeState.storyProgress ||
                      gameState.narrativeState.storyProgress}
                  </span>
                </div>
              )}
            </div>

            {currentRoundData?.intro && (
              <div className="border-t border-[var(--border)] pt-4">
                <h3 className="font-pixel text-sm text-[var(--primary)] mb-2">
                  Round Description
                </h3>
                <p className="font-retro text-sm text-[var(--muted-foreground)] mb-2">
                  {currentRoundData.intro}
                </p>
              </div>
            )}

            {gameState.choiceHistory.length > 0 &&
              gameState.currentRound > 1 && (
                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="font-pixel text-sm text-[var(--primary)] mb-2">
                    Previous Choice Result
                  </h3>
                  <div className="p-3 bg-[var(--accent)]/10 rounded">
                    <p className="font-retro text-xs font-semibold text-[var(--primary)] mb-1">
                      {
                        gameState.choiceHistory[
                          gameState.choiceHistory.length - 1
                        ]?.title
                      }
                    </p>
                    <p className="font-retro text-sm text-[var(--muted-foreground)]">
                      {
                        gameState.choiceHistory[
                          gameState.choiceHistory.length - 1
                        ]?.consequence
                      }
                    </p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentRoundData?.choices.map((choice, index) => (
            <ChoiceCard
              key={choice.id}
              choice={choice}
              index={index}
              className={getChoiceCardClassName(choice)}
              onClick={createChoiceClickHandler(choice)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default GamePage;
