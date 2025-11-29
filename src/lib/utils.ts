import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { WIN_TIER_THRESHOLDS } from '@/constants/slot.constants'
import type { WinTier } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format large numbers with suffixes (K, M, B, T) for HUD display
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0"

  const abs = Math.abs(value)
  if (abs >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString("en-US")
}

export function pickWeightedValue(weights: Record<string, number>, fallback?: string) {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0)
  if (entries.length === 0) {
    return fallback ?? ''
  }
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  if (total <= 0) {
    return fallback ?? entries[0][0]
  }
  let roll = Math.random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) {
      return value
    }
  }
  return entries[entries.length - 1][0]
}

export function ratioToTier(multiplier?: number): WinTier | null {
  if (!multiplier || multiplier < WIN_TIER_THRESHOLDS.SMALL) {
    return null
  }
  if (multiplier >= WIN_TIER_THRESHOLDS.ULTRA) {
    return 'ultra'
  }
  if (multiplier >= WIN_TIER_THRESHOLDS.JACKPOT) {
    return 'jackpot'
  }
  if (multiplier >= WIN_TIER_THRESHOLDS.MEGA) {
    return 'mega'
  }
  if (multiplier >= WIN_TIER_THRESHOLDS.BIG) {
    return 'big'
  }
  return 'small'
}

/**
 * Gets the correct asset path that works in both development and production.
 * In production on GitHub Pages, assets are served from /CasinoIdleSlots/assets/...
 * In development, they're served from /assets/...
 * 
 * @param path - The asset path starting with /assets/ or just the filename
 * @returns The correctly prefixed asset path
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present for consistent handling
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production, Vite sets import.meta.env.BASE_URL to '/CasinoIdleSlots/'
  // In development, it's '/'
  const base = import.meta.env.BASE_URL || '/';
  
  // Ensure no double slashes
  return `${base}${cleanPath}`.replace(/\/\//g, '/');
}
