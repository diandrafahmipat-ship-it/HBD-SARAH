"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type GameState = {
    currentLevel: number;
    completedLevels: number[];
    isLetterOpened: boolean;
    unlockedLevels: number[];
    userName: string;
    flowerChoice: string | null;
    wishes: string;
};

type GameContextType = {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    completeLevel: (level: number) => void;
    unlockLevel: (level: number) => void;
    resetProgress: () => void;
    playSound: (type: 'nice' | 'win' | 'bgm') => void;
    savedState: GameState | null;
    loadSave: () => void;
};

const defaultState: GameState = {
    currentLevel: 0,
    completedLevels: [],
    isLetterOpened: false,
    unlockedLevels: [1],
    userName: "Sayang",
    flowerChoice: null,
    wishes: "",
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [gameState, setGameState] = useState<GameState>(defaultState);
    const [savedState, setSavedState] = useState<GameState | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("sarah-birthday-save");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSavedState(parsed);
            } catch (e) {
                console.error("Failed to load save", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded && gameState.isLetterOpened) {
            localStorage.setItem("sarah-birthday-save", JSON.stringify(gameState));
        }
    }, [gameState, isLoaded]);

    const loadSave = () => {
        if (savedState) {
            setGameState(savedState);
        }
    };

    const completeLevel = (level: number) => {
        setGameState((prev) => {
            const nextLevels = new Set(prev.unlockedLevels);
            nextLevels.add(level + 1);
            return {
                ...prev,
                unlockedLevels: Array.from(nextLevels),
                currentLevel: 0,
            };
        });
    };

    const unlockLevel = (level: number) => {
        setGameState((prev) => {
            const nextLevels = new Set(prev.unlockedLevels);
            nextLevels.add(level);
            return {
                ...prev,
                unlockedLevels: Array.from(nextLevels),
            };
        });
    };

    const resetProgress = () => {
        setGameState(defaultState);
        localStorage.removeItem("sarah-birthday-save");
        localStorage.removeItem("intro_popup_shown");
        setSavedState(null);
        window.location.reload();
    };

    const playSound = (type: 'nice' | 'win' | 'bgm') => {
        // Placeholder for sound logic
        console.log(`Playing sound: ${type}`);
    };

    return (
        <GameContext.Provider value={{ gameState, setGameState, completeLevel, unlockLevel, resetProgress, playSound, savedState, loadSave }}>
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
