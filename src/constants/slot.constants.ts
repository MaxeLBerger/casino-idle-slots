/**
 * Slot Machine Constants
 * Konfigurationen für Slot-Maschinen und Symbole
 */

import { SlotMachineConfig, SlotTierId } from '@/types';
import { SLOT_SYMBOL_ASSETS } from './asset.constants';

// ============================================================================
// SYMBOL SETS
// ============================================================================

// Hinweis: SYMBOL_SETS enthalten die logischen Symbol-Keys, nicht die Emojis.
// Die tatsächlichen PNGs werden über assetBasePath + "key.png" geladen.

export const SYMBOL_SETS = [
  // Classic Lounge (Tier 1)
  ['cherry', 'bell', 'seven', 'bar'],
  // Sapphire Room (Tier 2)
  ['gem', 'ice7', 'star', 'cocktail'],
  // Emerald Suite (Tier 3) – Platzhalter, Assets folgen
  ['cash_stack', 'gold_watch', 'yacht', 'emerald_ring'],
  // Royal Palace (Tier 4) – Platzhalter
  ['crown', 'scepter', 'throne', 'faberge_egg'],
  // Celestial Deck (Tier 5) – Platzhalter
  ['planet', 'atom', 'robot', 'infinity'],
] as const;

// Mapping von logischen Symbol-Keys zu konkreten PNG-Dateinamen pro Maschine.
// So können wir flexible Keys behalten und trotzdem exakt auf die generierten
// Assets in /public/assets/slots/* zeigen.

export const SYMBOL_ASSET_MAP = SLOT_SYMBOL_ASSETS;

// ============================================================================
// SPECIAL SYMBOLS
// ============================================================================

// Jackpot-Symbole basieren auf den logischen Keys. Für Classic/Sapphire
// können wir hier später wichtige High-Tier-Symbole hinterlegen.

export const JACKPOT_SYMBOLS = ['seven', 'bar', 'gem', 'ice7', 'dragon'] as const;
export const ULTRA_JACKPOT_SYMBOLS = ['infinity', 'robot', 'planet'] as const;

// ============================================================================
// SYMBOL MULTIPLIERS
// ============================================================================

export const SYMBOL_MULTIPLIERS: Record<string, number> = {
  // Classic
  cherry: 20,
  bell: 25,
  seven: 80,
  bar: 120,
  // Sapphire
  gem: 90,
  ice7: 140,
  star: 40,
  cocktail: 30,
  // Emerald (Platzhalter)
  cash_stack: 50,
  gold_watch: 80,
  yacht: 120,
  emerald_ring: 150,
  // Royal (Platzhalter)
  crown: 150,
  scepter: 100,
  throne: 90,
  faberge_egg: 130,
  // Celestial (Platzhalter)
  planet: 70,
  atom: 60,
  robot: 160,
  infinity: 200,
};

// ============================================================================
// SLOT MACHINE CONFIGURATIONS
// ============================================================================

const SLOT_TIER_ORDER: SlotTierId[] = [
  'classic',
  'sapphire',
  'emerald',
  'royal',
  'celestial',
  'dragonEvent',
];

export const SLOT_MACHINE_CONFIGS: SlotMachineConfig[] = [
  { 
    name: 'Classic', 
    rows: 1, 
    reels: 3, 
    prestigeCost: 0, 
    symbols: SYMBOL_SETS[0] as unknown as string[],
    assetBasePath: '/assets/slots/classic_1',
    backgroundImage: 'classic_background.png',
    idleMultiplier: 1,
  },
  { 
    name: 'Sapphire Room', 
    rows: 2, 
    reels: 3, 
    prestigeCost: 5, 
    symbols: SYMBOL_SETS[1] as unknown as string[],
    assetBasePath: '/assets/slots/sapphire_2',
    backgroundImage: 'sapphire_background.png',
    idleMultiplier: 2,
  },
  { 
    name: 'Emerald Suite', 
    rows: 3, 
    reels: 3, 
    prestigeCost: 10, 
    symbols: SYMBOL_SETS[2] as unknown as string[],
    assetBasePath: '/assets/slots/emerald_3',
    backgroundImage: 'emerald_background.png',
  },
  { 
    name: 'Royal Palace', 
    rows: 3, 
    reels: 4, 
    prestigeCost: 15, 
    symbols: SYMBOL_SETS[3] as unknown as string[],
    assetBasePath: '/assets/slots/royal_4',
    backgroundImage: 'royal_background.png',
  },
  { 
    name: 'Celestial Deck', 
    rows: 4, 
    reels: 5, 
    prestigeCost: 20, 
    symbols: SYMBOL_SETS[4] as unknown as string[],
    assetBasePath: '/assets/slots/celestial_5',
    backgroundImage: 'celestial_background.png',
  }
  // Event / Dragon slot
  ,{
    name: 'Golden Dragon',
    rows: 3,
    reels: 5,
    prestigeCost: 50,
    symbols: ['dragon', 'coin', 'lantern', 'firecracker'] as string[],
    assetBasePath: '/assets/slots/event_dragon_6',
    backgroundImage: 'dragon_background.png',
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
