/**
 * Slot Machine Constants
 * Konfigurationen für Slot-Maschinen und Symbole
 */

import { SlotMachineConfig } from '@/types';
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
// SLOT MACHINE CONFIGURATIONS
// ============================================================================

export const SLOT_MACHINE_CONFIGS: SlotMachineConfig[] = [
  { 
    name: 'Classic', 
    tier: 'classic',
    rows: 1, 
    reels: 3, 
    prestigeCost: 0, 
    symbols: SYMBOL_SETS[0] as unknown as string[],
    assetBasePath: '/assets/slots/classic_1',
    backgroundImage: 'classic_background.png',
    idleMultiplier: 1,
    idleBoostPerMinute: 150,
    betOptions: [10, 25, 50, 100],
    features: { scatter: true, bonus: true, jackpot: true },
    payoutProfile: {
      rtpTarget: 0.94,
      volatility: 'low',
      jackpotChance: 0.0005,
      ultraJackpotChance: 0.00005,
      jackpotMultiplier: 180,
      ultraJackpotMultiplier: 420,
      consolationMultiplier: 0.35,
      symbolWeights: {
        cherry: 45,
        bell: 30,
        seven: 15,
        bar: 10,
      },
      paytable: {
        cherry: { 3: 5, 4: 8, 5: 12 },
        bell: { 3: 8, 4: 12, 5: 18 },
        seven: { 3: 18, 4: 30, 5: 45 },
        bar: { 3: 22, 4: 36, 5: 60 },
      },
    },
    animationProfile: {
      spinDurationMs: 1100,
      reelLagMs: 220,
      celebrationDurationMs: 1600,
    },
  },
  { 
    name: 'Sapphire Room', 
    tier: 'sapphire',
    rows: 2, 
    reels: 3, 
    prestigeCost: 5, 
    symbols: SYMBOL_SETS[1] as unknown as string[],
    assetBasePath: '/assets/slots/sapphire_2',
    backgroundImage: 'sapphire_background.png',
    betOptions: [50, 100, 250, 500],
    features: { scatter: true, bonus: true, jackpot: true },
    idleMultiplier: 2,
    idleBoostPerMinute: 300,
    payoutProfile: {
      rtpTarget: 0.952,
      volatility: 'medium',
      jackpotChance: 0.0008,
      ultraJackpotChance: 0.00008,
      jackpotMultiplier: 220,
      ultraJackpotMultiplier: 520,
      consolationMultiplier: 0.4,
      symbolWeights: {
        gem: 35,
        ice7: 20,
        star: 28,
        cocktail: 17,
      },
      paytable: {
        gem: { 3: 10, 4: 20, 5: 45 },
        ice7: { 3: 16, 4: 30, 5: 65 },
        star: { 3: 8, 4: 15, 5: 30 },
        cocktail: { 3: 6, 4: 12, 5: 24 },
      },
    },
    animationProfile: {
      spinDurationMs: 1300,
      reelLagMs: 240,
      celebrationDurationMs: 1700,
    },
  },
  { 
    name: 'Emerald Suite', 
    tier: 'emerald',
    rows: 3, 
    reels: 3, 
    prestigeCost: 10, 
    symbols: SYMBOL_SETS[2] as unknown as string[],
    assetBasePath: '/assets/slots/emerald_3',
    backgroundImage: 'emerald_background.png',
    betOptions: [250, 500, 750, 1000],
    features: { scatter: true, bonus: true, jackpot: true },
    idleMultiplier: 3,
    idleBoostPerMinute: 450,
    payoutProfile: {
      rtpTarget: 0.955,
      volatility: 'medium',
      jackpotChance: 0.001,
      ultraJackpotChance: 0.0001,
      jackpotMultiplier: 260,
      ultraJackpotMultiplier: 620,
      consolationMultiplier: 0.45,
      symbolWeights: {
        cash_stack: 32,
        gold_watch: 24,
        yacht: 22,
        emerald_ring: 18,
      },
      paytable: {
        cash_stack: { 3: 9, 4: 16, 5: 28 },
        gold_watch: { 3: 12, 4: 22, 5: 38 },
        yacht: { 3: 15, 4: 28, 5: 55 },
        emerald_ring: { 3: 20, 4: 40, 5: 80 },
      },
    },
    animationProfile: {
      spinDurationMs: 1450,
      reelLagMs: 260,
      celebrationDurationMs: 1850,
    },
  },
  { 
    name: 'Royal Palace', 
    tier: 'royal',
    rows: 3, 
    reels: 4, 
    prestigeCost: 15, 
    symbols: SYMBOL_SETS[3] as unknown as string[],
    assetBasePath: '/assets/slots/royal_4',
    backgroundImage: 'royal_background.png',
    betOptions: [500, 1000, 2500, 5000],
    features: { scatter: true, bonus: true, jackpot: true },
    idleMultiplier: 4,
    idleBoostPerMinute: 650,
    payoutProfile: {
      rtpTarget: 0.962,
      volatility: 'high',
      jackpotChance: 0.0012,
      ultraJackpotChance: 0.00015,
      jackpotMultiplier: 320,
      ultraJackpotMultiplier: 740,
      consolationMultiplier: 0.5,
      symbolWeights: {
        crown: 28,
        scepter: 24,
        throne: 20,
        faberge_egg: 16,
      },
      paytable: {
        crown: { 3: 12, 4: 26, 5: 50 },
        scepter: { 3: 16, 4: 32, 5: 64 },
        throne: { 3: 18, 4: 36, 5: 72 },
        faberge_egg: { 3: 24, 4: 48, 5: 96 },
      },
    },
    animationProfile: {
      spinDurationMs: 1600,
      reelLagMs: 280,
      celebrationDurationMs: 2000,
    },
  },
  { 
    name: 'Celestial Deck', 
    tier: 'celestial',
    rows: 4, 
    reels: 5, 
    prestigeCost: 20, 
    symbols: SYMBOL_SETS[4] as unknown as string[],
    assetBasePath: '/assets/slots/celestial_5',
    backgroundImage: 'celestial_background.png',
    betOptions: [1000, 2500, 5000, 10000],
    features: { scatter: true, bonus: true, jackpot: true },
    idleMultiplier: 5,
    idleBoostPerMinute: 900,
    payoutProfile: {
      rtpTarget: 0.968,
      volatility: 'high',
      jackpotChance: 0.0015,
      ultraJackpotChance: 0.0002,
      jackpotMultiplier: 380,
      ultraJackpotMultiplier: 880,
      consolationMultiplier: 0.55,
      symbolWeights: {
        planet: 26,
        atom: 22,
        robot: 18,
        infinity: 14,
      },
      paytable: {
        planet: { 3: 14, 4: 28, 5: 56 },
        atom: { 3: 16, 4: 34, 5: 70 },
        robot: { 3: 22, 4: 44, 5: 92 },
        infinity: { 3: 28, 4: 54, 5: 110 },
      },
    },
    animationProfile: {
      spinDurationMs: 1750,
      reelLagMs: 300,
      celebrationDurationMs: 2200,
    },
  },
  // Event / Dragon slot
  {
    name: 'Golden Dragon',
    tier: 'dragonEvent',
    rows: 3,
    reels: 5,
    prestigeCost: 50,
    symbols: ['dragon', 'coin', 'lantern', 'firecracker'] as string[],
    assetBasePath: '/assets/slots/event_dragon_6',
    backgroundImage: 'dragon_background.png',
    betOptions: [5000, 10000, 25000],
    features: { scatter: true, bonus: true, jackpot: true },
    idleMultiplier: 6,
    idleBoostPerMinute: 1200,
    payoutProfile: {
      rtpTarget: 0.985,
      volatility: 'extreme',
      jackpotChance: 0.0018,
      ultraJackpotChance: 0.00035,
      jackpotMultiplier: 520,
      ultraJackpotMultiplier: 1250,
      consolationMultiplier: 0.6,
      symbolWeights: {
        dragon: 12,
        coin: 34,
        lantern: 28,
        firecracker: 26,
      },
      paytable: {
        dragon: { 3: 60, 4: 120, 5: 260 },
        coin: { 3: 10, 4: 18, 5: 34 },
        lantern: { 3: 14, 4: 26, 5: 44 },
        firecracker: { 3: 18, 4: 32, 5: 52 },
      },
    },
    animationProfile: {
      spinDurationMs: 1900,
      reelLagMs: 320,
      celebrationDurationMs: 2500,
    },
  },
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
  ULTRA: 200,
} as const;
