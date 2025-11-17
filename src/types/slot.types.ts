/**
 * Slot Machine Types
 * Typen für Slot-Maschinen und Spins
 */

export interface SlotMachineConfig {
  name: string;
  rows: number;
  reels: number;
  prestigeCost: number;
  symbols: string[];
}

export interface SpinResult {
  reels: string[][];
  winAmount: number;
  isJackpot: boolean;
  isUltraJackpot: boolean;
  matchedRows: number[];
  profit: number;
}

export interface ReelState {
  spinning: boolean;
  symbols: string[];
}

export type WinTier = 'small' | 'big' | 'mega' | 'jackpot' | 'ultra';

export type ConfettiIntensity = 'low' | 'medium' | 'high' | 'mega' | 'jackpot' | 'ultra';
