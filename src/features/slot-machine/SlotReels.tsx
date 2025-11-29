import { FEATURE_GLOBAL_ASSETS } from '@/constants/asset.constants';
import { SlotTierId, SlotReelView } from '@/types';
import { ReelStrip } from './ReelStrip';

interface SlotReelsProps {
  tier: SlotTierId;
  reels: SlotReelView[];
}

export function SlotReels({ tier, reels }: SlotReelsProps) {
  return (
    <div className="flex justify-center gap-2 py-3">
      {reels.map((reel, index) => (
        <ReelStrip
          key={reel.id ?? `${index}`}
          tier={tier}
          symbol={reel.symbol}
          phase={reel.phase}
          delayMs={reel.delayMs}
          isWinning={reel.isWinning}
          index={index}
        />
      ))}
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
