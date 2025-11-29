import { useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useGame } from '@/contexts/GameContext';
import { SLOT_MACHINE_CONFIGS } from '@/constants/slot.constants';
import { playBigWinSound, playReelStopSound, playSmallWinSound, playSpinSound } from '@/lib/sounds';
import { pickWeightedValue, ratioToTier } from '@/lib/utils';
import type { SlotMachineConfig, SlotReelView, WinTier } from '@/types';
import type { SpinResult } from '@/types/game.types';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildReels = (config: SlotMachineConfig, previous?: SlotReelView[]): SlotReelView[] => {
  const placeholder = config.symbols[0] ?? 'seven';
  return Array.from({ length: config.reels }, (_, index) => {
    const prevSymbol = previous?.[index]?.symbol ?? placeholder;
    return {
      id: `reel-${index}`,
      symbol: prevSymbol,
      isWinning: false,
      phase: 'idle',
      delayMs: index * config.animationProfile.reelLagMs,
    };
  });
};

interface SpinOutcome {
  symbols: string[];
  winAmount: number;
  multiplier: number;
  tier: WinTier | null;
  winningIndices: number[];
  isJackpot: boolean;
  isUltraJackpot: boolean;
}

const evaluateSpin = (config: SlotMachineConfig, betAmount: number): SpinOutcome => {
  const fallbackSymbol = config.symbols[0] ?? 'seven';
  const availableWeights = config.symbols.reduce<Record<string, number>>((map, symbol) => {
    map[symbol] = config.payoutProfile.symbolWeights[symbol] ?? 1;
    return map;
  }, {});

  const reels = Array.from({ length: config.reels }, () => pickWeightedValue(availableWeights, fallbackSymbol));
  const counts = new Map<string, number>();
  reels.forEach(symbol => counts.set(symbol, (counts.get(symbol) ?? 0) + 1));

  let bestSymbol: string | null = null;
  let bestMultiplier = 0;
  let bestMatchCount = 0;

  counts.forEach((count, symbol) => {
    const paytable = config.payoutProfile.paytable[symbol];
    if (!paytable) return;
    const matches = Object.keys(paytable)
      .map(Number)
      .filter(match => count >= match)
      .sort((a, b) => b - a);
    if (!matches.length) return;
    const bestMatch = matches[0];
    const multiplier = paytable[bestMatch];
    if (multiplier > bestMultiplier) {
      bestMultiplier = multiplier;
      bestSymbol = symbol;
      bestMatchCount = bestMatch;
    }
  });

  let winAmount = 0;
  let tier: WinTier | null = null;
  let winningIndices: number[] = [];
  let isJackpot = false;
  let isUltraJackpot = false;

  const profile = config.payoutProfile;
  const rollUltra = Math.random() < profile.ultraJackpotChance;
  const rollJackpot = Math.random() < profile.jackpotChance;

  if (rollUltra) {
    winAmount = Math.round(betAmount * profile.ultraJackpotMultiplier);
    tier = 'ultra';
    winningIndices = reels.map((_, index) => index);
    isUltraJackpot = true;
  } else if (rollJackpot) {
    winAmount = Math.round(betAmount * profile.jackpotMultiplier);
    tier = 'jackpot';
    winningIndices = reels.map((_, index) => index);
    isJackpot = true;
  } else if (bestSymbol && bestMultiplier > 0) {
    winAmount = Math.round(betAmount * bestMultiplier);
    const indices = reels.reduce<number[]>((acc, symbol, index) => {
      if (symbol === bestSymbol) {
        acc.push(index);
      }
      return acc;
    }, []);
    winningIndices = indices.slice(0, Math.min(bestMatchCount, indices.length));
  } else {
    const hasPair = Array.from(counts.values()).some(count => count === 2);
    if (hasPair && profile.consolationMultiplier > 0) {
      winAmount = Math.round(betAmount * profile.consolationMultiplier);
      const pairSymbol = Array.from(counts.entries()).find(([, count]) => count === 2)?.[0];
      winningIndices = reels.reduce<number[]>((acc, symbol, index) => {
        if (symbol === pairSymbol) {
          acc.push(index);
        }
        return acc;
      }, []).slice(0, 2);
    }
  }

  const multiplier = betAmount > 0 && winAmount > 0 ? Number((winAmount / betAmount).toFixed(2)) : 0;
  if (!tier) {
    tier = ratioToTier(multiplier);
  }

  return {
    symbols: reels,
    winAmount,
    multiplier,
    tier,
    winningIndices,
    isJackpot,
    isUltraJackpot,
  };
};

export const useSlotMachine = () => {
  const { gameState, setGameState, saveGame } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<SlotReelView[]>(() => buildReels(SLOT_MACHINE_CONFIGS[0]));
  const [lastWinMeta, setLastWinMeta] = useState<{ amount: number; multiplier: number; tier: WinTier | null }>({
    amount: 0,
    multiplier: 0,
    tier: null,
  });

  const machineIndex = gameState?.currentSlotMachine ?? 0;
  const machine = SLOT_MACHINE_CONFIGS[machineIndex] ?? SLOT_MACHINE_CONFIGS[0];
  const betOptions = useMemo(() => machine?.betOptions?.length ? machine.betOptions : [10], [machine]);

  const resolveBetAmount = useCallback((override?: number) => {
    const candidate = override ?? gameState?.currentBet ?? betOptions[0];
    if (betOptions.includes(candidate)) {
      return candidate;
    }
    return betOptions[0];
  }, [betOptions, gameState?.currentBet]);

  useEffect(() => {
    // Defer to avoid synchronous state update warning
    const timer = setTimeout(() => {
      setReels(prev => buildReels(machine, prev));
    }, 0);
    return () => clearTimeout(timer);
  }, [machineIndex, machine]);

  const spin = useCallback(async (betOverride?: number) => {
    if (isSpinning || !gameState) return;
    const betAmount = resolveBetAmount(betOverride);
    if (gameState.coins < betAmount) {
      return;
    }

    const animation = machine.animationProfile;
    setIsSpinning(true);
    setLastWinMeta({ amount: 0, multiplier: 0, tier: null });
    setReels(prev =>
      prev.map((reel, index) => ({
        ...reel,
        phase: 'spin',
        isWinning: false,
        delayMs: index * animation.reelLagMs,
      }))
    );
    playSpinSound();

    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: prev.coins - betAmount,
        totalSpins: (prev.totalSpins ?? 0) + 1,
        currentBet: betAmount,
      };
    });

    await wait(animation.spinDurationMs);

    const outcome = evaluateSpin(machine, betAmount);

    setReels(prev =>
      prev.map((reel, index) => ({
        ...reel,
        symbol: outcome.symbols[index] ?? reel.symbol,
        phase: outcome.winningIndices.includes(index) ? 'win' : 'stop',
        isWinning: outcome.winningIndices.includes(index),
        delayMs: index * animation.reelLagMs,
      }))
    );
    playReelStopSound();

    const spinResult: SpinResult = {
      id: uuidv4(),
      timestamp: Date.now(),
      betAmount,
      winAmount: outcome.winAmount,
      isWin: outcome.winAmount > 0,
      symbols: outcome.symbols,
      machineName: machine.name,
      multiplier: outcome.multiplier || undefined,
      winTier: outcome.tier ?? undefined,
      winningIndices: outcome.winningIndices,
    };

    setGameState(prev => {
      if (!prev) return prev;
      const updatedCoins = prev.coins + outcome.winAmount;
      const updatedWins = outcome.winAmount > 0 ? (prev.totalWins ?? 0) + 1 : prev.totalWins ?? 0;
      const updatedHistory = [spinResult, ...prev.spinHistory].slice(0, 200);
      const winStreak = outcome.winAmount > 0 ? prev.winStreak + 1 : 0;
      return {
        ...prev,
        coins: updatedCoins,
        totalWins: updatedWins,
        totalEarnings: (prev.totalEarnings ?? 0) + outcome.winAmount,
        lifetimeEarnings: (prev.lifetimeEarnings ?? 0) + outcome.winAmount,
        biggestWin: Math.max(prev.biggestWin ?? 0, outcome.winAmount),
        winStreak,
        maxWinStreak: Math.max(prev.maxWinStreak ?? 0, winStreak),
        spinHistory: updatedHistory,
        lifetimeSpins: (prev.lifetimeSpins ?? 0) + 1,
        lifetimeWins: outcome.winAmount > 0 ? (prev.lifetimeWins ?? 0) + 1 : prev.lifetimeWins ?? 0,
      };
    });

    if (outcome.winAmount > 0) {
      if (outcome.tier === 'mega' || outcome.tier === 'jackpot' || outcome.tier === 'ultra') {
        playBigWinSound();
      } else {
        playSmallWinSound();
      }
    }

    setLastWinMeta({
      amount: outcome.winAmount,
      multiplier: outcome.multiplier,
      tier: outcome.tier,
    });

    await wait(animation.celebrationDurationMs);
    setReels(prev => prev.map(reel => ({ ...reel, phase: 'idle', isWinning: false })));
    setIsSpinning(false);
    saveGame();
  }, [gameState, isSpinning, machine, resolveBetAmount, saveGame, setGameState]);

  useEffect(() => {
    if (!gameState?.preferences.autoSpinEnabled || isSpinning) {
      return;
    }
    const betAmount = resolveBetAmount();
    if ((gameState?.coins ?? 0) < betAmount) {
      return;
    }
    const timer = setTimeout(() => {
      spin();
    }, machine.animationProfile.spinDurationMs + machine.animationProfile.celebrationDurationMs + machine.animationProfile.reelLagMs);
    return () => clearTimeout(timer);
  }, [gameState?.preferences.autoSpinEnabled, gameState?.coins, isSpinning, machine.animationProfile, resolveBetAmount, spin]);

  return {
    spin,
    isSpinning,
    reels,
    lastWin: lastWinMeta.amount,
    lastWinTier: lastWinMeta.tier,
    lastWinMultiplier: lastWinMeta.multiplier,
  };
};
