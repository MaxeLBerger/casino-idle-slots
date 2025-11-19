/**
 * Prestige System Utilities
 * Helper functions for prestige calculations and rewards
 */

import { PRESTIGE_CONFIG } from '@/constants/game.constants';

/**
 * Calculate how many prestige points to award based on total earnings
 */
export function calculatePrestigeReward(totalEarnings: number): number {
  const tiers = PRESTIGE_CONFIG.EARNINGS_TIERS;
  
  // Find the highest tier the player has reached
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalEarnings >= tiers[i].threshold) {
      return tiers[i].points;
    }
  }
  
  return 1; // Minimum 1 point
}

/**
 * Calculate the prestige multiplier bonus
 */
export function calculatePrestigeMultiplier(prestigePoints: number): number {
  const baseMultiplier = 1 + (prestigePoints * PRESTIGE_CONFIG.MULTIPLIER_PER_POINT);
  
  // Add milestone bonuses
  let milestoneBonus = 0;
  for (const milestone of PRESTIGE_CONFIG.MILESTONES) {
    if (prestigePoints >= milestone.points) {
      milestoneBonus = Math.max(milestoneBonus, milestone.multiplier);
    }
  }
  
  return baseMultiplier + milestoneBonus;
}

/**
 * Calculate starting coins after prestige
 */
export function calculatePrestigeStartingCoins(prestigePoints: number, baseCoins: number): number {
  return baseCoins + (prestigePoints * PRESTIGE_CONFIG.STARTING_COINS_BONUS);
}

/**
 * Get the next milestone for the player
 */
export function getNextMilestone(currentPrestige: number) {
  for (const milestone of PRESTIGE_CONFIG.MILESTONES) {
    if (currentPrestige < milestone.points) {
      return milestone;
    }
  }
  return null;
}

/**
 * Get all unlocked milestones
 */
export function getUnlockedMilestones(prestigePoints: number) {
  return PRESTIGE_CONFIG.MILESTONES.filter(m => prestigePoints >= m.points);
}

/**
 * Get the prestige tier based on total earnings
 */
export function getPrestigeTier(totalEarnings: number) {
  const tiers = PRESTIGE_CONFIG.EARNINGS_TIERS;
  
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalEarnings >= tiers[i].threshold) {
      return {
        tier: i,
        threshold: tiers[i].threshold,
        points: tiers[i].points,
        nextTier: i < tiers.length - 1 ? tiers[i + 1] : null
      };
    }
  }
  
  return {
    tier: 0,
    threshold: tiers[0].threshold,
    points: tiers[0].points,
    nextTier: tiers.length > 1 ? tiers[1] : null
  };
}

/**
 * Format prestige bonus text for display
 */
export function formatPrestigeBonus(prestigePoints: number): string {
  const multiplier = calculatePrestigeMultiplier(prestigePoints);
  const bonusPercent = ((multiplier - 1) * 100).toFixed(0);
  return `+${bonusPercent}%`;
}

export type PrestigeRank = {
  name: string;
  color: string;
  threshold: number;
};

export const PRESTIGE_RANKS: PrestigeRank[] = [
  { name: 'Novice', color: 'text-gray-400', threshold: 0 },
  { name: 'Bronze', color: 'text-orange-700', threshold: 10 },
  { name: 'Silver', color: 'text-slate-400', threshold: 25 },
  { name: 'Gold', color: 'text-yellow-400', threshold: 50 },
  { name: 'Platinum', color: 'text-cyan-400', threshold: 100 },
  { name: 'Diamond', color: 'text-blue-500', threshold: 250 },
  { name: 'Master', color: 'text-purple-500', threshold: 500 },
  { name: 'Grandmaster', color: 'text-rose-500', threshold: 1000 },
  { name: 'Legend', color: 'text-amber-500', threshold: 2500 },
];

export function getPrestigeRank(points: number): PrestigeRank {
  for (let i = PRESTIGE_RANKS.length - 1; i >= 0; i--) {
    if (points >= PRESTIGE_RANKS[i].threshold) {
      return PRESTIGE_RANKS[i];
    }
  }
  return PRESTIGE_RANKS[0];
}
