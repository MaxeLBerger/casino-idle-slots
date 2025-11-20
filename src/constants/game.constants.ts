/**
 * Game Constants
 * Zentrale Spielkonstanten und Konfiguration
 */

import { GameConfig, GameState } from '@/types';

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export const GAME_CONFIG: GameConfig = {
  SPIN_COST: 10,
  STARTING_COINS: 200,
  MAX_OFFLINE_HOURS: 4,
  PRESTIGE_EARNINGS_REQUIREMENT: 10000,
  JACKPOT_CHANCE: 0.03,
  ULTRA_JACKPOT_CHANCE: 0.005,
};

// ============================================================================
// DEFAULT GAME STATE
// ============================================================================

export const DEFAULT_GAME_STATE: GameState = {
  // Currency & Resources
  coins: GAME_CONFIG.STARTING_COINS,
  prestigePoints: 0,
  totalPrestigeEarned: 0,
  
  // Player Progress
  level: 1,
  experience: 0,
  totalSpins: 0,
  totalWins: 0,
  biggestWin: 0,
  totalEarnings: 0,
  lifetimeEarnings: 0,
  
  // Streaks & Combos
  winStreak: 0,
  maxWinStreak: 0,
  loginStreak: 0,
  
  // Upgrades
  spinPowerLevel: 0,
  spinMultiplier: 1,
  idleIncomeLevel: 1,
  idleIncomePerSecond: 1,
  totalUpgrades: 0,
  
  // Slot Machines
  currentSlotMachine: 0,
  unlockedSlotMachines: [0],
  
  // Achievements & Challenges
  unlockedAchievements: [],
  achievementProgress: {},
  dailyChallengeDate: '',
  dailyChallengeProgress: 0,
  dailyChallengeCompleted: false,
  
  // Timestamps
  lastTimestamp: Date.now(),
  lastLoginDate: '',
  spinHistory: [],
};

// ============================================================================
// UPGRADE CONFIGURATION
// ============================================================================

export const UPGRADE_BASE_COSTS = {
  SPIN_POWER: 50,
  IDLE_INCOME: 100,
} as const;

export const UPGRADE_SCALING = {
  COST_MULTIPLIER: 1.5,
  SPIN_POWER_BENEFIT: 0.5,
  IDLE_INCOME_BENEFIT: 1,
} as const;

// ============================================================================
// LEVEL & EXPERIENCE
// ============================================================================

export const XP_PER_LEVEL = 100;
export const XP_REWARDS = {
  SPIN: 2,
  WIN: 10,
  UPGRADE: 5,
  ACHIEVEMENT: 50,
  PRESTIGE: 100,
  DAILY_CHALLENGE: 50,
} as const;

// ============================================================================
// PRESTIGE CONFIGURATION
// ============================================================================

export const PRESTIGE_CONFIG = {
  // Base multiplier per prestige point (25% per point - Massive Dopamine Boost!)
  MULTIPLIER_PER_POINT: 0.25,
  // Starting coins bonus per prestige point
  STARTING_COINS_BONUS: 500,
  // Prestige point scaling based on earnings tiers
  EARNINGS_TIERS: [
    { threshold: 10000, points: 1 },
    { threshold: 25000, points: 2 },
    { threshold: 50000, points: 3 },
    { threshold: 100000, points: 5 },
    { threshold: 250000, points: 8 },
    { threshold: 500000, points: 12 },
    { threshold: 1000000, points: 20 },
  ],
  // Milestone bonuses
  MILESTONES: [
    { points: 5, bonus: 'Extra slot machine unlocked', multiplier: 0.50 },
    { points: 10, bonus: 'Jackpot chance increased', multiplier: 1.00 },
    { points: 25, bonus: 'Ultra rare symbols unlocked', multiplier: 2.50 },
    { points: 50, bonus: 'Master prestige benefits', multiplier: 5.00 },
  ],
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  GAME_STATE: 'casino-game-state',
  USER_PREFERENCES: 'user-preferences',
} as const;
