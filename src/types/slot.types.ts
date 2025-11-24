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
  /** Multiplikator für Idle-Einkommen je Maschine */
  idleMultiplier?: number;
  /** Pfad-Basis unter /public für Assets, z.B. /assets/slots/classic_1 */
  assetBasePath: string;
  /** Dateiname des Hintergrundbildes innerhalb des Asset-Pfads */
  backgroundImage: string;
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
