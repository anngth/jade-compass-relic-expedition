"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useGame } from "@/games/relic-expedition/context/game-context";
import { useSettings } from "@/contexts/settings-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  GameHeader,
  IntroductionCard,
  NewAdventureCard,
  AIConfigurationCard,
} from "@/games/relic-expedition/components/setup";

export function HomePage() {
  const { startGame } = useGame();
  const { apiKey, isLoadingSettings } = useSettings();

  const [showApiKey, setShowApiKey] = useState(false);

  const handleStartGame = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    await startGame();
  };

  // Determine button text based on current form state
  const getStartButtonText = () => {
    if (!apiKey) {
      return "Enter API Key";
    }
    return "Start Adventure";
  };

  const canStart = () => {
    return !!apiKey;
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="font-pixel text-lg text-[var(--primary)]">
            Loading app...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-start px-3 py-3 sm:px-4">
        <div className="max-w-7xl w-full">
          <div className="mb-4 grid grid-cols-[auto_1fr_auto] items-start gap-4">
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/">Back to Jade Compass</Link>
            </Button>
            <GameHeader />
            <div className="hidden w-[164px] sm:block" aria-hidden="true" />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:gap-4">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3 flex flex-col space-y-3">
              <IntroductionCard />
              <NewAdventureCard
                onStartGame={handleStartGame}
                canStart={canStart()}
                startButtonText={getStartButtonText()}
              />
            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-2 space-y-3">
              <AIConfigurationCard
                showApiKey={showApiKey}
                onToggleApiKeyVisibility={() => setShowApiKey(!showApiKey)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
