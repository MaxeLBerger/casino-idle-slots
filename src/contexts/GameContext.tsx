import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { GameState } from '../types/game.types';
import { useSupabaseGameState } from '../lib/persistence';
import { DEFAULT_GAME_STATE } from '../constants/game.constants';
import { calculatePrestigeReward, calculatePrestigeStartingCoins } from '../lib/prestige';

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  isLoading: boolean;
  saveGame: () => Promise<boolean>;
  userId: string | null;
  resetGame: () => void;
  handlePrestige: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState, , isLoading, userId, saveGameStateImmediately] = useSupabaseGameState<GameState>(DEFAULT_GAME_STATE);

  // Ensure we always have a valid gameState (never null)
  const safeGameState = gameState ?? DEFAULT_GAME_STATE;

  const resetGame = useCallback(() => {
    setGameState(DEFAULT_GAME_STATE);
  }, [setGameState]);

  const handlePrestige = useCallback(() => {
    setGameState(prev => {
      if (!prev) return DEFAULT_GAME_STATE;
      
      const reward = calculatePrestigeReward(prev.lifetimeEarnings ?? prev.totalEarnings);
      const newPrestigePoints = prev.prestigePoints + reward;
      const startingCoins = calculatePrestigeStartingCoins(newPrestigePoints, 200);
      
      return {
        ...DEFAULT_GAME_STATE,
        // Preserve lifetime stats
        prestigePoints: newPrestigePoints,
        totalPrestigeEarned: (prev.totalPrestigeEarned ?? 0) + reward,
        lifetimeEarnings: (prev.lifetimeEarnings ?? 0) + prev.totalEarnings,
        lifetimeSpins: (prev.lifetimeSpins ?? 0) + prev.totalSpins,
        lifetimeWins: (prev.lifetimeWins ?? 0) + prev.totalWins,
        lifetimeBiggestWin: Math.max(prev.lifetimeBiggestWin ?? 0, prev.biggestWin),
        // Start with bonus coins
        coins: startingCoins,
        // Preserve premium currency and preferences
        diamonds: prev.diamonds,
        preferences: prev.preferences,
        unlockedAchievements: prev.unlockedAchievements,
      };
    });
  }, [setGameState]);

  return (
    <GameContext.Provider value={{
      gameState: safeGameState,
      setGameState: setGameState as React.Dispatch<React.SetStateAction<GameState>>,
      isLoading,
      saveGame: saveGameStateImmediately,
      userId,
      resetGame,
      handlePrestige,
    }}>
      {children}
    </GameContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
