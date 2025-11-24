/**
 * Core Game State Types
 * Zentrale TypeScript-Typen für den Game State
 */

export type SlotTierId =
  | 'classic'
  | 'sapphire'
  | 'emerald'
  | 'royal'
  | 'celestial'
  | 'dragonEvent';

export type PrestigeRankId =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export type CurrencyId =
  | 'coins'
  | 'prestigePoints'
  | 'diamonds'
  | 'eventTokenDragonJade'
  | 'eventTokenSapphire'
  | 'eventTokenEmerald'
  | 'eventTokenRoyal'
  | 'eventTokenCelestial'
  | 'limitedPass';

export type UiIconId =
  | 'map'
  | 'shop'
  | 'stats'
  | 'workers'
  | 'prestige'
  | 'prestigeNav'
  | 'settings'
  | 'soundOn'
  | 'soundOff'
  | 'notification'
  | 'inventory'
  | 'upgradeMenu'
  | 'info'
  | 'lockOverlay'
  | 'event'
  | 'hostElegant';

export type ActionUiId =
  | 'spinButton'
  | 'autoSpinToggle'
  | 'tooltipPanel'
  | 'notificationToast'
  | 'loadingSpinner';

export type WorkerRoleId =
  | 'cashier'
  | 'host'
  | 'security'
  | 'analyst'
  | 'vipConcierge'
  | 'marketing'
  | 'technician'
  | 'manager';

export type AvatarId =
  | 'male'
  | 'female'
  | 'highRoller'
  | 'dealer'
  | 'security'
  | 'vipHost';

export interface SpinResult {
  id: string;
  timestamp: number;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  symbols: string[];
  machineName?: string;
  multiplier?: number;
}

export interface GameState {
  // Currency & Resources
  coins: number;
  prestigePoints: number;
  totalPrestigeEarned?: number; // Track lifetime prestige points for milestones
  
  // Player Progress
  level: number;
  experience: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  totalEarnings: number;
  lifetimeEarnings?: number; // Track earnings across all prestiges
  
  lifetimeSpins?: number;
  lifetimeWins?: number;
  lifetimeBiggestWin?: number;
  
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
  spinHistory: SpinResult[];
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
