"use client";

import { useGame } from "@/context/GameContext";
import Letter from "@/components/Letter/Letter";
import Roadmap from "@/components/Map/Roadmap";
import Game6 from "@/components/Games/Game6Cake";
import Game1 from "@/components/Games/Game1Chat";
import Game2 from "@/components/Games/Game2Flowers";
import Game3 from "@/components/Games/Game3HiddenOption";
import Game4Duck from "@/components/Games/Game4Duck";
import Game5 from "@/components/Games/Game5Puzzle";

export default function Home() {
  const { gameState, setGameState } = useGame();

  if (!gameState.isLetterOpened) {
    return <Letter />;
  }

  if (gameState.currentLevel === 0) {
    return <Roadmap />;
  }

  if (gameState.currentLevel === 1) {
    return <Game1 />;
  }

  if (gameState.currentLevel === 2) {
    return <Game2 />;
  }

  if (gameState.currentLevel === 3) {
    return <Game3 />;
  }

  if (gameState.currentLevel === 4) {
    // @ts-ignore
    return <Game4Duck />;
  }

  if (gameState.currentLevel === 5) {
    // @ts-ignore
    return <Game5 />;
  }

  if (gameState.currentLevel === 6) {
    return <Game6 />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4 font-righteous text-pink-600">To Be Continued...</h1>
        <p className="font-caveat text-xl">Level {gameState.currentLevel} is coming soon!</p>
        <button
          onClick={() => setGameState(prev => ({ ...prev, currentLevel: 0 }))}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-full text-sm font-bold"
        >
          Back to Map
        </button>
      </div>
    </div>
  );
}
