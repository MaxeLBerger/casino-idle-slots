import { useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { SYMBOL_SETS, SYMBOL_MULTIPLIERS } from '@/constants/slot.constants';
import { playSpinSound, playReelStopSound, playSmallWinSound, playBigWinSound } from '@/lib/sounds';

export const useSlotMachine = () => {
  const { gameState, setGameState, saveGame } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [reels, setReels] = useState<string[]>(['seven', 'seven', 'seven']); // Initial state

  const spin = useCallback(async (betAmount: number) => {
    if (isSpinning) return;
    if (gameState.coins < betAmount) {
      // TODO: Show error toast
      console.log('Not enough coins');
      return;
    }

    setIsSpinning(true);
    setLastWin(0);
    playSpinSound();

    // Deduct bet
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - betAmount,
      totalSpins: prev.totalSpins + 1
    }));

    // Simulate spin delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate result
    // TODO: Use proper weights from config
    const currentMachineIndex = gameState.currentSlotMachine || 0;
    const availableSymbols = SYMBOL_SETS[currentMachineIndex] || SYMBOL_SETS[0];
    
    const newReels = [
      availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
      availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
      availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
    ];

    setReels(newReels);
    playReelStopSound();

    // Calculate Win
    let winAmount = 0;
    if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
      // 3 of a kind
      const symbol = newReels[0];
      const multiplier = SYMBOL_MULTIPLIERS[symbol] || 10;
      winAmount = betAmount * multiplier;
    } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2] || newReels[0] === newReels[2]) {
      // 2 of a kind (simplified)
      winAmount = betAmount * 1.5;
    }

    if (winAmount > 0) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + winAmount,
        totalWins: prev.totalWins + 1,
        totalEarnings: prev.totalEarnings + winAmount,
        lifetimeEarnings: prev.lifetimeEarnings + winAmount,
        biggestWin: Math.max(prev.biggestWin, winAmount)
      }));
      setLastWin(winAmount);
      if (winAmount > betAmount * 10) {
        playBigWinSound();
      } else {
        playSmallWinSound();
      }
    }

    setIsSpinning(false);
    saveGame();

  }, [gameState.coins, gameState.currentSlotMachine, isSpinning, setGameState, saveGame]);

  return {
    spin,
    isSpinning,
    reels,
    lastWin
  };
};
