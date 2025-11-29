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

export type EventTokenId = Exclude<CurrencyId, 'coins' | 'prestigePoints' | 'diamonds'>;

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

// Worker unlock requirements
export type WorkerUnlockRequirement =
  | { type: 'worker'; workerId: string; level: number }
  | { type: 'prestige'; prestigePoints: number }
  | null;

// Worker configuration for the idle economy
export interface WorkerConfig {
  roleId: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseIncome: number;
  incomePerLevel: number;
  maxLevel: number;
  unlockRequirement: WorkerUnlockRequirement;
}

export interface PlayerPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  autoSpinEnabled: boolean;
  autoSpinBatchSize: number;
}

export interface WorkerState {
  role: WorkerRoleId;
  level: number;
  isUnlocked: boolean;
  efficiencyBonus: number;
}

export interface SpinResult {
  id: string;
  timestamp: number;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  symbols: string[];
  machineName?: string;
  multiplier?: number;
  winTier?: 'small' | 'big' | 'mega' | 'jackpot' | 'ultra';
  winningIndices?: number[];
}

export interface GameState {
  // Currency & Resources
  coins: number;
  prestigePoints: number;
  diamonds: number;
  eventTokenBalances: Record<EventTokenId, number>;
  totalPrestigeEarned?: number;
  
  // Player Progress
  level: number;
  experience: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  totalEarnings: number;
  lifetimeEarnings?: number;
  
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
  reelSpeedLevel: number;
  jackpotChanceLevel: number;
  workerEfficiencyLevel: number;
  offlineEarningsLevel: number;
  totalUpgrades: number;
  
  // Slot Machines
  currentSlotMachine: number;
  unlockedSlotMachines: number[];
  currentBet: number;
  
  // Achievements & Challenges
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  dailyChallengeDate: string;
  dailyChallengeProgress: number;
  dailyChallengeCompleted: boolean;
  avatarId: AvatarId;
  preferences: PlayerPreferences;
  
  // Workers - Record of workerId to level (0 = not hired)
  workers: Record<string, number>;
  
  // Prestige
  prestigeLevel: number;
  
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
