import { SLOT_SYMBOL_ASSETS, FEATURE_GLOBAL_ASSETS } from '@/constants/asset.constants';
import { SlotTierId } from '@/types';

interface SlotReelsProps {
  tier: SlotTierId;
  symbols: string[];
  isSpinning: boolean;
}

export function SlotReels({ tier, symbols, isSpinning }: SlotReelsProps) {
  const assets = SLOT_SYMBOL_ASSETS[tier];

  return (
    <div className="flex justify-center gap-2 py-3">
      {symbols.map((symbol, index) => {
        const src = assets[symbol as keyof typeof assets];
        return (
          <div
            key={`${symbol}-${index}`}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-[#050317]/60 rounded-xl border border-[#3b2a6b] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.7)]"
          >
            {src ? (
              <img
                src={src}
                alt={symbol}
                className={`w-full h-full object-contain transition-transform duration-150 ${
                  isSpinning ? 'animate-pulse scale-105' : ''
                }`}
                loading="lazy"
              />
            ) : (
              <span className="text-xs text-cyan-300/60">{symbol}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface FeatureStripProps {
  showScatter?: boolean;
  showBonus?: boolean;
  showJackpot?: boolean;
}

export function FeatureStrip({ showScatter, showBonus, showJackpot }: FeatureStripProps) {
  const { scatter, bonus, jackpot } = FEATURE_GLOBAL_ASSETS;

  return (
    <div className="flex items-center justify-center gap-3 mt-1 mb-2">
      {showScatter && (
        <img
          src={scatter}
          alt="Scatter"
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(93,202,255,0.8)]"
          loading="lazy"
        />
      )}
      {showBonus && (
        <img
          src={bonus}
          alt="Bonus"
          className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_14px_rgba(255,215,128,0.9)]"
          loading="lazy"
        />
      )}
      {showJackpot && (
        <img
          src={jackpot}
          alt="Jackpot"
          className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_0_16px_rgba(255,96,176,0.95)]"
          loading="lazy"
        />
      )}
    </div>
  );
}
