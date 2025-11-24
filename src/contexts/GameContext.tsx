import React, { createContext, useContext, ReactNode } from 'react';
import { GameState } from '../types/game.types';
import { useSupabaseGameState } from '../lib/persistence';
import { STARTING_COINS } from '../constants/game.constants';

// Default state needs to be imported or defined. 
// For now I will redefine a minimal default or import if possible.
// But wait, STARTING_COINS is in App.tsx in the snippet. I should move constants to constants file.

const DEFAULT_STATE: GameState = {
  coins: 200, // Placeholder, should use constant
  totalSpins: 0,
  biggestWin: 0,
  totalEarnings: 0,
  lifetimeEarnings: 0,
  lifetimeSpins: 0,
  lifetimeWins: 0,
  lifetimeBiggestWin: 0,
  spinHistory: [],
  spinMultiplier: 1,
  idleIncomePerSecond: 1,
  spinPowerLevel: 0,
  idleIncomeLevel: 1,
  prestigePoints: 0,
  totalPrestigeEarned: 0,
  currentSlotMachine: 0,
  unlockedSlotMachines: [0],
  lastTimestamp: Date.now(),
  level: 1,
  experience: 0,
  totalWins: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalUpgrades: 0,
  unlockedAchievements: [],
  achievementProgress: {},
  dailyChallengeDate: '',
  dailyChallengeProgress: 0,
  dailyChallengeCompleted: false,
  lastLoginDate: '',
  loginStreak: 0,
};

interface GameContextType {
  gameState: GameState;
  setGameState: (newState: GameState | ((prevState: GameState) => GameState)) => void;
  isLoading: boolean;
  saveGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState, , isLoading, , saveGameStateImmediately] = useSupabaseGameState<GameState>(DEFAULT_STATE);

  return (
    <GameContext.Provider value={{ 
      gameState, 
      setGameState, 
      isLoading, 
      saveGame: saveGameStateImmediately 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
