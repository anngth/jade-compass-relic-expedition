import React from "react";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewAdventureCardProps {
  onStartGame: () => void;
  canStart: boolean;
  startButtonText: string;
}

export function NewAdventureCard({
  onStartGame,
  canStart,
  startButtonText,
}: NewAdventureCardProps) {
  const { settings, updateSettings } = useSettings();
  const { gameConfig } = settings;

  const onChangeRound = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateSettings({
      gameConfig: {
        ...(gameConfig ?? {}),
        rounds: Math.max(
          2,
          Math.min(
            10,
            Number.isNaN(parseInt(e.target.value, 10))
              ? 2
              : parseInt(e.target.value, 10)
          )
        ),
      },
    });

  const onChangeChoicesPerRound = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      gameConfig: {
        ...(gameConfig ?? {}),
        choicesPerRound: Math.max(
          2,
          Math.min(
            5,
            Number.isNaN(parseInt(e.target.value, 10))
              ? 2
              : parseInt(e.target.value, 10)
          )
        ),
      },
    });
  };

  const onChangeContentLanguage = (value: string) => {
    updateSettings({
      gameConfig: {
        ...(gameConfig ?? {}),
        contentLanguage: value as "English" | "Vietnamese",
      },
    });
  };

  return (
    <Card className="relative flex-1 p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">New Adventure</CardTitle>
        <CardDescription className="text-sm">
          Configure your new adventure
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Game Settings */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[0.9fr_0.9fr_0.9fr_1.4fr] lg:items-end">
          <div>
            <label className="font-pixel mb-1.5 block text-base">
              Rounds (2-10)
            </label>
            <Input
              type="number"
              min="2"
              max="10"
              value={gameConfig?.rounds ?? 2}
              onChange={onChangeRound}
              className="w-full"
            />
          </div>
          <div>
            <label className="font-pixel mb-1.5 block text-base">
              Choices (2-5)
            </label>
            <Input
              type="number"
              min="2"
              max="5"
              value={gameConfig?.choicesPerRound ?? 2}
              onChange={onChangeChoicesPerRound}
              className="w-full"
            />
          </div>
          <div>
            <label className="font-pixel mb-1.5 block text-base">
              Language
            </label>
            <Select
              value={gameConfig?.contentLanguage ?? "English"}
              onValueChange={onChangeContentLanguage}
            >
              <SelectTrigger className="w-full rounded-none border-2 border-[var(--input)] pixel-shadow">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="pulse h-14 w-full whitespace-nowrap border-2 border-[var(--accent)] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-5 text-base uppercase tracking-[0.08em] shadow-[0_0_0_2px_rgba(0,0,0,0.35),0_4px_0_rgba(0,0,0,0.35)] hover:brightness-110 sm:text-lg"
            onClick={onStartGame}
            disabled={!canStart}
          >
            {startButtonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
