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
