import { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { SlotTierId, ReelPhase } from '@/types';
import { SLOT_SYMBOL_ASSETS } from '@/constants/asset.constants';
import { cn } from '@/lib/utils';
import { AssetImage } from '@/components/ui/asset-image';

interface ReelStripProps {
  tier: SlotTierId;
  symbol: string;
  phase: ReelPhase;
  delayMs: number;
  isWinning: boolean;
  index: number;
}

export function ReelStrip({ tier, symbol, phase, delayMs, isWinning }: ReelStripProps) {
  const controls = useAnimation();
  const assets = SLOT_SYMBOL_ASSETS[tier];
  
  // Get all valid symbol keys for this tier to generate random strips
  const symbolKeys = useMemo(() => 
    Object.keys(assets).filter(k => assets[k as keyof typeof assets] !== ''),
    [assets]
  );

  // Generate a static strip for the spin animation
  // We create a strip of ~10 items to loop through
  const [stripSymbols] = useState(() => {
    if (symbolKeys.length === 0) return [];
    return Array.from({ length: 8 }, () => 
      symbolKeys[Math.floor(Math.random() * symbolKeys.length)]
    );
  });

  const currentAsset = assets[symbol as keyof typeof assets];

  // Animation variants
  const spinVariants: Variants = {
    spinning: {
      y: [0, -800], // Assuming each item is roughly 80-100px, 8 items
      transition: {
        duration: 0.4, // Fast spin
        ease: "linear",
        repeat: Infinity,
      }
    },
    stop: {
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 1
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === 'spin') {
        controls.start("spinning");
      } else if (phase === 'stop' || phase === 'idle' || phase === 'win') {
        controls.start("stop");
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [phase, controls, delayMs]);

  return (
    <div className={cn(
      "relative w-16 h-16 sm:w-20 sm:h-20 bg-[#050317]/80 rounded-xl border border-[#3b2a6b] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]",
      isWinning ? "ring-2 ring-[#fbbf24] shadow-[0_0_25px_rgba(251,191,36,0.6)]" : "ring-1 ring-white/10"
    )}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-10" />

      {/* Spinning Strip */}
      {phase === 'spin' && (
        <motion.div
          variants={spinVariants}
          initial="spinning"
          animate={controls}
          className="absolute top-0 left-0 w-full flex flex-col items-center"
        >
          {/* Render the strip twice to allow for seamless looping if we were doing that, 
              but for simple blur, a long list is fine. 
              We need enough height to cover the translation. */}
          {[...stripSymbols, ...stripSymbols].map((sym, i) => (
            <div key={`spin-${i}`} className="w-full h-20 flex items-center justify-center blur-[1px]">
               {assets[sym as keyof typeof assets] && (
                 <AssetImage 
                   src={assets[sym as keyof typeof assets]} 
                   className="w-14 h-14 object-contain opacity-70" 
                   alt=""
                 />
               )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Target Symbol (Visible when stopped) */}
      {phase !== 'spin' && (
        <motion.div
          initial={{ y: -100, filter: "blur(4px)" }}
          animate={{ y: 0, filter: "blur(0px)" }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 20,
            mass: 0.8
          }}
          className="w-full h-full flex items-center justify-center z-0"
        >
          {currentAsset ? (
            <AssetImage
              src={currentAsset}
              alt={symbol}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-lg",
                isWinning && "animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
              )}
            />
          ) : (
             <span className="text-xs text-cyan-300/60">{symbol}</span>
          )}
        </motion.div>
      )}
      
      {/* Winning Overlay Effect */}
      {isWinning && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-[#fbbf24] mix-blend-overlay z-20"
        />
      )}

      {/* Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-xl z-30" />
    </div>
  );
}
