"use client";

import React from "react";
import { useGame } from "@/contexts/game-context";
import { useSettings } from "@/contexts/settings-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";

export function VictoryPage() {
  const { gameState, resetGame } = useGame();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-6">
          {gameState.overallTheme && (
            <h1 className="font-pixel text-3xl text-[var(--accent)] mb-6">
              {gameState.overallTheme}
            </h1>
          )}

          <div className="relative inline-block py-4">
            <Trophy className="h-24 w-24 text-[var(--accent)] animate-bounce mx-auto" />
            <Sparkles className="h-8 w-8 text-[var(--primary)] absolute top-0 right-0 pulse animate-ping" />
            <Sparkles className="h-6 w-6 text-[var(--primary)] absolute bottom-0 left-0 pulse animate-ping" />
          </div>

          <h2 className="font-pixel text-3xl text-[var(--primary)]">
            VICTORY!
          </h2>

          <p className="font-pixel text-xl text-[var(--accent)]">
            Congratulations! You have found the pot.
          </p>
        </div>

        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Adventure Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-retro space-y-2">
              <p>
                <span className="text-[var(--muted-foreground)]">
                  Rounds Completed:{" "}
                </span>
                <span className="text-[var(--primary)]">
                  {settings.gameConfig?.rounds || 2}
                </span>
              </p>
              <p>
                <span className="text-[var(--muted-foreground)]">
                  Final Location:{" "}
                </span>
                <span className="text-[var(--accent)]">
                  {gameState.narrativeState.location}
                </span>
              </p>
              <p>
                <span className="text-[var(--muted-foreground)]">
                  Final Status:{" "}
                </span>
                <span className="text-[var(--primary)]">
                  {gameState.narrativeState.status}
                </span>
              </p>
              {gameState.narrativeState.storyProgress && (
                <p>
                  <span className="text-[var(--muted-foreground)]">
                    Final Progress:{" "}
                  </span>
                  <span className="text-[var(--accent)]">
                    {gameState.narrativeState.storyProgress}
                  </span>
                </p>
              )}
              <p>
                <span className="text-[var(--muted-foreground)]">
                  Total Choices Made:{" "}
                </span>
                <span className="text-[var(--primary)]">
                  {gameState.choiceHistory.length}
                </span>
              </p>
              {gameState.narrativeState.initItems.length > 0 && (
                <p>
                  <span className="text-[var(--muted-foreground)]">
                    Items Collected:{" "}
                  </span>
                  <span className="text-[var(--accent)]">
                    {gameState.narrativeState.initItems.join(", ")}
                  </span>
                </p>
              )}
            </div>

            {gameState.choiceHistory.length > 0 && (
              <div className="border-t border-[var(--border)] pt-4">
                <h4 className="font-pixel text-sm text-[var(--primary)] mb-2">
                  Victory Choice
                </h4>
                <div className="p-3 bg-[var(--accent)]/10 rounded">
                  <p className="font-retro text-sm font-semibold text-[var(--primary)]">
                    {
                      gameState.choiceHistory[
                        gameState.choiceHistory.length - 1
                      ]?.title
                    }
                  </p>
                  <p className="font-retro text-xs text-[var(--muted-foreground)] mt-1">
                    {
                      gameState.choiceHistory[
                        gameState.choiceHistory.length - 1
                      ]?.summary
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full text-lg pulse" onClick={resetGame}>
          PLAY AGAIN
        </Button>
      </div>
    </div>
  );
}
export default VictoryPage;
