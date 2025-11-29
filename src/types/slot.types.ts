/**
 * Slot Machine Types
 * Typen für Slot-Maschinen und Spins
 */

import { SlotTierId } from './game.types';

export type WinTier = 'small' | 'big' | 'mega' | 'jackpot' | 'ultra';

export type ConfettiIntensity = 'low' | 'medium' | 'high' | 'mega' | 'jackpot' | 'ultra';

export type SlotVolatility = 'low' | 'medium' | 'high' | 'extreme';

export type ReelPhase = 'idle' | 'shuffle' | 'spin' | 'stop' | 'win';

export interface SlotPaytable {
  [matches: number]: number;
}

export interface SlotPayoutProfile {
  /** Target Return-To-Player for balancing */
  rtpTarget: number;
  /** Volatility informs UI copy + win cadence */
  volatility: SlotVolatility;
  /** Chance (0-1) to trigger jackpot override each spin */
  jackpotChance: number;
  /** Chance (0-1) to trigger ultra jackpot override */
  ultraJackpotChance: number;
  /** Multiplier applied when jackpotChance fires */
  jackpotMultiplier: number;
  /** Multiplier applied when ultraJackpotChance fires */
  ultraJackpotMultiplier: number;
  /** Safety net for two-of-a-kind results */
  consolationMultiplier: number;
  /** Weight map per symbol (higher = more common) */
  symbolWeights: Record<string, number>;
  /** Paytable per symbol describing multipliers per match length */
  paytable: Record<string, SlotPaytable>;
}

export interface SlotAnimationProfile {
  /** Total time each reel should remain in "spin" phase */
  spinDurationMs: number;
  /** Stagger delay between consecutive reel stops */
  reelLagMs: number;
  /** Duration for celebratory win pulses */
  celebrationDurationMs: number;
}

export interface SlotReelView {
  id: string;
  symbol: string;
  phase: ReelPhase;
  isWinning: boolean;
  delayMs: number;
}

export interface SlotMachineConfig {
  name: string;
  rows: number;
  reels: number;
  prestigeCost: number;
  symbols: string[];
  tier: SlotTierId;
  /** Multiplikator für Idle-Einkommen je Maschine */
  idleMultiplier?: number;
  /** Bonus auf passive Coins/min während Maschine aktiv ist */
  idleBoostPerMinute?: number;
  /** Pfad-Basis unter /public für Assets, z.B. /assets/slots/classic_1 */
  assetBasePath: string;
  /** Dateiname des Hintergrundbildes innerhalb des Asset-Pfads */
  backgroundImage: string;
  /** Verfügbare Einsatzhöhen für diese Maschine */
  betOptions: number[];
  /** Welche Features (Scatter, Bonus, Jackpot) UI-seitig angezeigt werden */
  features?: {
    scatter?: boolean;
    bonus?: boolean;
    jackpot?: boolean;
  };
  payoutProfile: SlotPayoutProfile;
  animationProfile: SlotAnimationProfile;
}
