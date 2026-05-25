"use client";

import dynamic from "next/dynamic";
import { GameProvider } from "@/contexts/game-context";
import { useGame } from "@/contexts/game-context";

const HomePage = dynamic(() =>
  import("@/components/pages/home").then((mod) => ({ default: mod.HomePage }))
);
const GamePage = dynamic(() =>
  import("@/components/pages/game").then((mod) => ({ default: mod.GamePage }))
);
const VictoryPage = dynamic(() =>
  import("@/components/pages/victory").then((mod) => ({
    default: mod.VictoryPage,
  }))
);
const FailurePage = dynamic(() =>
  import("@/components/pages/failure").then((mod) => ({
    default: mod.FailurePage,
  }))
);

function GameRouter() {
  const { gameState } = useGame();

  switch (gameState.status) {
    case "idle":
      return <HomePage />;
    case "playing":
      return <GamePage />;
    case "victory":
      return <VictoryPage />;
    case "failure":
      return <FailurePage />;
    default:
      return <HomePage />;
  }
}

export default function Home() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
