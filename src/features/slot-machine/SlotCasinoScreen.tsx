import { useMemo, useState } from 'react';
import { SLOT_MACHINE_CONFIGS } from '@/constants/slot.constants';
import { ActionUiId, SlotTierId } from '@/types';
import { ACTION_UI_ASSETS } from '@/constants/ui.constants';
import { SlotReels, FeatureStrip } from './SlotReels';

const DEFAULT_SYMBOLS: Record<SlotTierId, string[]> = {
  classic: ['cherry', 'bell', 'seven'],
  sapphire: ['gem', 'star', 'ice7'],
  emerald: ['cash_stack', 'gold_watch', 'yacht'],
  royal: ['crown', 'throne', 'faberge_egg'],
  celestial: ['planet', 'robot', 'infinity'],
  dragonEvent: ['dragon', 'coin', 'lantern'],
};

function getActionAsset(id: ActionUiId) {
  return ACTION_UI_ASSETS[id];
}

export function SlotMachineView() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex] = useState(0);

  const machine = SLOT_MACHINE_CONFIGS[currentIndex];
  const tier: SlotTierId = useMemo(() => {
    const name = machine.name;
    if (name.includes('Classic')) return 'classic';
    if (name.includes('Sapphire')) return 'sapphire';
    if (name.includes('Emerald')) return 'emerald';
    if (name.includes('Royal')) return 'royal';
    if (name.includes('Celestial')) return 'celestial';
    return 'dragonEvent';
  }, [machine.name]);

  const symbols = DEFAULT_SYMBOLS[tier];

  const spinIcon = getActionAsset('spinButton');

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-4 bg-gradient-to-b from-[#0b0418] via-[#02010d] to-[#050317] rounded-3xl border border-[#3b2a6b]/80 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
      <div className="text-center mb-2">
        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/70">Current Machine</div>
        <div className="text-lg font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]">
          {machine.name}
        </div>
      </div>

      <FeatureStrip showScatter showBonus showJackpot />

      <SlotReels tier={tier} symbols={symbols} isSpinning={isSpinning} />

      <div className="mt-3 flex items-center justify-center">
        <button
          type="button"
          onClick={handleSpin}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f97316] to-[#ec4899] text-[#050317] text-sm font-semibold tracking-wide shadow-[0_0_24px_rgba(250,204,21,0.7)] active:scale-95 transition-transform min-w-[140px]"
        >
          {spinIcon && (
            <img
              src={spinIcon}
              alt="Spin"
              className="w-6 h-6 object-contain"
              loading="lazy"
            />
          )}
          <span>Spin</span>
        </button>
      </div>
    </div>
  );
}
