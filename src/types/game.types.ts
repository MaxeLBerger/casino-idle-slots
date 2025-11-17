/**
 * Core Game State Types
 * Zentrale TypeScript-Typen für den Game State
 */

export interface GameState {
  // Currency & Resources
  coins: number;
  prestigePoints: number;
  
  // Player Progress
  level: number;
  experience: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  totalEarnings: number;
  
  // Streaks & Combos
  winStreak: number;
  maxWinStreak: number;
  loginStreak: number;
  
  // Upgrades
  spinPowerLevel: number;
  spinMultiplier: number;
  idleIncomeLevel: number;
  idleIncomePerSecond: number;
  totalUpgrades: number;
  
  // Slot Machines
  currentSlotMachine: number;
  unlockedSlotMachines: number[];
  
  // Achievements & Challenges
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  dailyChallengeDate: string;
  dailyChallengeProgress: number;
  dailyChallengeCompleted: boolean;
  
  // Timestamps
  lastTimestamp: number;
  lastLoginDate: string;
}

export interface GameConfig {
  SPIN_COST: number;
  STARTING_COINS: number;
  MAX_OFFLINE_HOURS: number;
  PRESTIGE_EARNINGS_REQUIREMENT: number;
  JACKPOT_CHANCE: number;
  ULTRA_JACKPOT_CHANCE: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  baseCoins: number;
  scaling: number;
  benefit: number;
  maxLevel?: number;
}
