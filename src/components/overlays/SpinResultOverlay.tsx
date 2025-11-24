import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import { Confetti } from '@/components/Confetti';

interface SpinResultOverlayProps {
  winAmount: number;
  onComplete?: () => void;
}

export const SpinResultOverlay: React.FC<SpinResultOverlayProps> = ({ winAmount, onComplete }) => {
  const [show, setShow] = useState(false);
  const [type, setType] = useState<'big' | 'mega' | 'ultra' | null>(null);

  useEffect(() => {
    if (winAmount > 0) {
      // Determine win type based on amount (this logic might need to be relative to bet)
      // For now, let's assume:
      // > 1000 = Big
      // > 10000 = Mega
      // > 100000 = Ultra
      if (winAmount >= 100000) setType('ultra');
      else if (winAmount >= 10000) setType('mega');
      else if (winAmount >= 1000) setType('big');
      else setType(null);

      if (winAmount >= 1000) {
        setShow(true);
        const timer = setTimeout(() => {
          setShow(false);
          if (onComplete) onComplete();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [winAmount, onComplete]);

  if (!show || !type) return null;

  const text = type === 'ultra' ? 'ULTRA WIN' : type === 'mega' ? 'MEGA WIN' : 'BIG WIN';
  const color = type === 'ultra' ? 'text-purple-500' : type === 'mega' ? 'text-cyan-400' : 'text-gold-400';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'
        >
          <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
          <div className='relative z-10 flex flex-col items-center'>
            <motion.h1 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className={\	ext-6xl font-black \ drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mb-4\}
            >
              {text}
            </motion.h1>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className='text-4xl font-bold text-white'
            >
              +{formatNumber(winAmount)}
            </motion.div>
          </div>
          <Confetti active={true} intensity={type === 'ultra' ? 'ultra' : type === 'mega' ? 'jackpot' : 'high'} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
