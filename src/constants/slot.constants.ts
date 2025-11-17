/**
 * Slot Machine Constants
 * Konfigurationen für Slot-Maschinen und Symbole
 */

import { SlotMachineConfig } from '@/types';

// ============================================================================
// SYMBOL SETS
// ============================================================================

export const SYMBOL_SETS = [
  ['', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '']
] as const;

// ============================================================================
// SPECIAL SYMBOLS
// ============================================================================

export const JACKPOT_SYMBOLS = ['', '', '', '', ''] as const;
export const ULTRA_JACKPOT_SYMBOLS = ['', '', ''] as const;

// ============================================================================
// SYMBOL MULTIPLIERS
// ============================================================================

export const SYMBOL_MULTIPLIERS: Record<string, number> = {
  '': 20,
  '': 20,
  '': 20,
  '': 30,
  '': 40,
  '': 60,
  '': 50,
  '': 100,
  '': 150,
  '': 200,
  '': 300,
  '': 500,
  '': 750,
  '': 1000,
};

// ============================================================================
// SLOT MACHINE CONFIGURATIONS
// ============================================================================

export const SLOT_MACHINE_CONFIGS: SlotMachineConfig[] = [
  { 
    name: 'Classic', 
    rows: 1, 
    reels: 3, 
    prestigeCost: 0, 
    symbols: SYMBOL_SETS[0] as unknown as string[]
  },
  { 
    name: 'Deluxe', 
    rows: 2, 
    reels: 3, 
    prestigeCost: 5, 
    symbols: SYMBOL_SETS[1] as unknown as string[]
  },
  { 
    name: 'Premium', 
    rows: 3, 
    reels: 3, 
    prestigeCost: 10, 
    symbols: SYMBOL_SETS[2] as unknown as string[]
  },
  { 
    name: 'Mega', 
    rows: 3, 
    reels: 4, 
    prestigeCost: 15, 
    symbols: SYMBOL_SETS[3] as unknown as string[]
  },
  { 
    name: 'Ultimate', 
    rows: 4, 
    reels: 5, 
    prestigeCost: 20, 
    symbols: SYMBOL_SETS[4] as unknown as string[]
  }
];

// ============================================================================
// SPIN CONFIGURATION
// ============================================================================

export const SPIN_TIMING = {
  REEL_SPIN_INTERVAL: 100,
  BASE_STOP_TIME: 1500,
  REEL_STOP_DELAY: 500,
} as const;

// ============================================================================
// WIN TIERS
// ============================================================================

export const WIN_TIER_THRESHOLDS = {
  SMALL: 5,
  BIG: 20,
  MEGA: 50,
  JACKPOT: 100,
} as const;
