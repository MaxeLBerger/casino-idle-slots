import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Confetti } from '@/components/Confetti';
import { formatNumber } from '@/lib/utils';
import type { WinTier } from '@/types';

interface SpinResultOverlayProps {
  winAmount: number;
  winTier?: WinTier | null;
  multiplier?: number;
  onComplete?: () => void;
}

const TIER_COPY: Record<Exclude<WinTier, 'small'>, { label: string; color: string; confetti: 'high' | 'mega' | 'jackpot' | 'ultra' }> = {
  big: { label: 'BIG WIN', color: 'text-amber-300', confetti: 'high' },
  mega: { label: 'MEGA WIN', color: 'text-cyan-300', confetti: 'jackpot' },
  jackpot: { label: 'JACKPOT', color: 'text-emerald-200', confetti: 'mega' },
  ultra: { label: 'ULTRA WIN', color: 'text-fuchsia-300', confetti: 'ultra' },
};

function CountUp({ value, duration = 2.5 }: { value: number, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(start + (end - start) * ease));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value, duration]);

  return <>{formatNumber(displayValue)}</>;
}

export const SpinResultOverlay: React.FC<SpinResultOverlayProps> = ({ winAmount, winTier, multiplier, onComplete }) => {
  const [show, setShow] = useState(false);
  const [activeTier, setActiveTier] = useState<Exclude<WinTier, 'small'> | null>(null);

  useEffect(() => {
    if (winAmount > 0 && winTier && winTier !== 'small') {
      const tier = winTier === 'mega' || winTier === 'jackpot' || winTier === 'ultra' ? winTier : 'big';
      
      // Defer state updates to avoid synchronous render warnings
      const startTimer = setTimeout(() => {
        setActiveTier(tier);
        setShow(true);
      }, 0);

      const timer = setTimeout(() => {
        setShow(false);
        setActiveTier(null);
        onComplete?.();
      }, 4000); // Extended duration for count up
      
      return () => {
        clearTimeout(startTimer);
        clearTimeout(timer);
      }
    }
  }, [winAmount, winTier, onComplete]);

  if (!activeTier) {
    return null;
  }

  const tierMeta = TIER_COPY[activeTier];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <Confetti active={true} intensity={tierMeta.confetti} />
          
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-white/20 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-4xl sm:text-6xl font-black tracking-wider ${tierMeta.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] orbitron`}
            >
              {tierMeta.label}
            </motion.h2>
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-3xl sm:text-5xl font-bold text-white drop-shadow-md"
            >
              <span className="text-amber-400 mr-2">🪙</span>
              <CountUp value={winAmount} />
            </motion.div>

            {multiplier && multiplier > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-cyan-300 font-mono"
              >
                {multiplier}x Multiplier!
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

