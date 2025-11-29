import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { GameState } from '../types/game.types';
import { useSupabaseGameState } from '../lib/persistence';
import { DEFAULT_GAME_STATE } from '../constants/game.constants';
import { calculatePrestigeReward, calculatePrestigeStartingCoins } from '../lib/prestige';
import { getWorkerUpgradeCost } from '../constants/workers.constants';
import { useGameLoop, canUnlockWorker, calculateOfflineEarnings, calculateTotalCPS, applyPrestigeMultiplier } from '../hooks/game/useGameLoop';

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  isLoading: boolean;
  saveGame: () => Promise<boolean>;
  userId: string | null;
  resetGame: () => void;
  handlePrestige: () => void;
  // Worker actions
  hireWorker: (workerId: string) => boolean;
  upgradeWorker: (workerId: string) => boolean;
  // CPS values from game loop
  baseCPS: number;
  currentCPS: number;
  prestigeMultiplier: number;
  // Offline earnings
  claimOfflineEarnings: () => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState, , isLoading, userId, saveGameStateImmediately] = useSupabaseGameState<GameState>(DEFAULT_GAME_STATE);

  // Ensure we always have a valid gameState (never null)
  const safeGameState = gameState ?? DEFAULT_GAME_STATE;

  // Internal addCoins function for the game loop
  const addCoins = useCallback((amount: number) => {
    setGameState(prev => {
      if (!prev) return DEFAULT_GAME_STATE;
      return {
        ...prev,
        coins: prev.coins + amount,
        totalEarnings: prev.totalEarnings + amount,
      };
    });
  }, [setGameState]);

  // Game loop for passive income
  const { baseCPS, currentCPS, prestigeMultiplier } = useGameLoop(safeGameState, addCoins, true);

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
        // Increment prestige level
        prestigeLevel: (prev.prestigeLevel ?? 0) + 1,
        // Reset workers
        workers: {},
      };
    });
  }, [setGameState]);

  // Hire a worker (first purchase, level 0 -> 1)
  const hireWorker = useCallback((workerId: string): boolean => {
    let success = false;
    setGameState(prev => {
      if (!prev) return DEFAULT_GAME_STATE;
      
      const currentLevel = prev.workers[workerId] || 0;
      if (currentLevel > 0) return prev; // Already hired
      
      // Check unlock requirements
      if (!canUnlockWorker(workerId, prev.workers, prev.prestigePoints)) {
        return prev;
      }
      
      const cost = getWorkerUpgradeCost(workerId, 0);
      if (prev.coins < cost) return prev;
      
      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        workers: {
          ...prev.workers,
          [workerId]: 1,
        },
      };
    });
    return success;
  }, [setGameState]);

  // Upgrade a worker (level 1+ -> level+1)
  const upgradeWorker = useCallback((workerId: string): boolean => {
    let success = false;
    setGameState(prev => {
      if (!prev) return DEFAULT_GAME_STATE;
      
      const currentLevel = prev.workers[workerId] || 0;
      if (currentLevel === 0) return prev; // Not hired yet
      
      const cost = getWorkerUpgradeCost(workerId, currentLevel);
      if (cost === Infinity) return prev; // Max level
      if (prev.coins < cost) return prev;
      
      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        workers: {
          ...prev.workers,
          [workerId]: currentLevel + 1,
        },
      };
    });
    return success;
  }, [setGameState]);

  // Claim offline earnings when returning to the game
  const claimOfflineEarnings = useCallback((): number => {
    const cps = applyPrestigeMultiplier(
      calculateTotalCPS(safeGameState.workers),
      safeGameState.prestigeLevel ?? 0
    );
    const earnings = calculateOfflineEarnings(safeGameState.lastTimestamp, cps);
    
    if (earnings > 0) {
      setGameState(prev => {
        if (!prev) return DEFAULT_GAME_STATE;
        return {
          ...prev,
          coins: prev.coins + earnings,
          totalEarnings: prev.totalEarnings + earnings,
          lastTimestamp: Date.now(),
        };
      });
    }
    
    return earnings;
  }, [safeGameState.workers, safeGameState.prestigeLevel, safeGameState.lastTimestamp, setGameState]);

  return (
    <GameContext.Provider value={{
      gameState: safeGameState,
      setGameState: setGameState as React.Dispatch<React.SetStateAction<GameState>>,
      isLoading,
      saveGame: saveGameStateImmediately,
      userId,
      resetGame,
      handlePrestige,
      hireWorker,
      upgradeWorker,
      baseCPS,
      currentCPS,
      prestigeMultiplier,
      claimOfflineEarnings,
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
