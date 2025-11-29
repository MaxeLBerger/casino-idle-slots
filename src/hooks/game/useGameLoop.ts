import { useEffect, useRef, useCallback } from 'react';
import { WORKER_CONFIGS } from '@/constants/workers.constants';
import type { GameState } from '@/types/game.types';

const TICK_INTERVAL_MS = 1000; // 1 second

// Calculate total CPS from all workers (before prestige multiplier)
export function calculateTotalCPS(workers: GameState['workers']): number {
  let totalCPS = 0;
  for (const [workerId, level] of Object.entries(workers)) {
    if (level > 0) {
      const config = WORKER_CONFIGS[workerId];
      if (config) {
        totalCPS += config.baseIncome + config.incomePerLevel * (level - 1);
      }
    }
  }
  return totalCPS;
}

// Apply prestige multiplier to base CPS
export function applyPrestigeMultiplier(baseCPS: number, prestigeLevel: number): number {
  // Each prestige level adds 10% to the multiplier (1.0, 1.1, 1.2, etc.)
  const multiplier = 1 + prestigeLevel * 0.1;
  return baseCPS * multiplier;
}

// Calculate offline earnings
export function calculateOfflineEarnings(
  lastSaveTime: number,
  currentCPS: number,
  maxOfflineHours: number = 8
): number {
  const now = Date.now();
  const elapsedMs = now - lastSaveTime;
  const elapsedSeconds = Math.min(elapsedMs / 1000, maxOfflineHours * 3600);
  // Offline earnings are 50% of normal rate
  return Math.floor(currentCPS * elapsedSeconds * 0.5);
}

// Check if a worker can be unlocked
export function canUnlockWorker(
  workerId: string,
  workers: GameState['workers'],
  prestigePoints: number
): boolean {
  const config = WORKER_CONFIGS[workerId];
  if (!config) return false;
  
  const requirement = config.unlockRequirement;
  if (!requirement) return true; // No requirement = always unlocked
  
  if (requirement.type === 'worker') {
    const requiredWorkerLevel = workers[requirement.workerId] || 0;
    return requiredWorkerLevel >= requirement.level;
  }
  
  if (requirement.type === 'prestige') {
    return prestigePoints >= requirement.prestigePoints;
  }
  
  return false;
}

// The game loop hook
export function useGameLoop(
  gameState: GameState,
  addCoins: (amount: number) => void,
  isActive: boolean = true
) {
  const lastTickRef = useRef<number>(Date.now());
  
  const tick = useCallback(() => {
    const baseCPS = calculateTotalCPS(gameState.workers);
    const currentCPS = applyPrestigeMultiplier(baseCPS, gameState.prestigeLevel);
    
    if (currentCPS > 0) {
      // Calculate coins earned since last tick
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      const earned = Math.floor(currentCPS * elapsed);
      
      if (earned > 0) {
        addCoins(earned);
      }
      
      lastTickRef.current = now;
    }
  }, [gameState.workers, gameState.prestigeLevel, addCoins]);

  useEffect(() => {
    if (!isActive) return;
    
    lastTickRef.current = Date.now();
    const interval = setInterval(tick, TICK_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [tick, isActive]);
  
  // Return current CPS values for display
  const baseCPS = calculateTotalCPS(gameState.workers);
  const currentCPS = applyPrestigeMultiplier(baseCPS, gameState.prestigeLevel);
  const prestigeMultiplier = 1 + gameState.prestigeLevel * 0.1;
  
  return { baseCPS, currentCPS, prestigeMultiplier };
}
