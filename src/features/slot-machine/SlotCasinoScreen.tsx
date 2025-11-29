import { useMemo } from 'react';
import { motion } from 'framer-motion';

import { SLOT_MACHINE_CONFIGS } from '@/constants/slot.constants';
import { ActionUiId } from '@/types';
import { ACTION_UI_ASSETS } from '@/constants/ui.constants';
import { SlotReels, FeatureStrip } from './SlotReels';
import { useGame } from '@/contexts/GameContext';
import { useSlotMachine } from '@/hooks/useSlotMachine';
import { SpinResultOverlay } from '@/components/overlays/SpinResultOverlay';
import { formatNumber, cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/BackButton';
import { AssetImage } from '@/components/ui/asset-image';

function getActionAsset(id: ActionUiId) {
  return ACTION_UI_ASSETS[id];
}

export function SlotCasinoScreen() {
  const { gameState, setGameState } = useGame();
  const { spin, isSpinning, lastWin, lastWinTier, lastWinMultiplier, reels } = useSlotMachine();

  const currentIndex = gameState?.currentSlotMachine ?? 0;
  const machine = SLOT_MACHINE_CONFIGS[currentIndex] ?? SLOT_MACHINE_CONFIGS[0];
  const tier = machine.tier;
  const betOptions = useMemo(() => machine.betOptions ?? [10], [machine]);
  const currentBet = useMemo(() => {
    if (!gameState) return betOptions[0];
    return betOptions.includes(gameState.currentBet) ? gameState.currentBet : betOptions[0];
  }, [betOptions, gameState]);

  const sessionStats = useMemo(() => {
    if (!gameState) {
      return { net: 0, recentWinRate: 0 };
    }
    const recent = gameState.spinHistory.slice(0, 50);
    if (recent.length === 0) {
      return { net: 0, recentWinRate: 0 };
    }
    const net = recent.reduce((acc, spin) => acc + (spin.winAmount - spin.betAmount), 0);
    const wins = recent.filter((spin) => spin.isWin).length;
    return {
      net,
      recentWinRate: (wins / recent.length) * 100,
    };
  }, [gameState]);

  const spinIcon = getActionAsset('spinButton');

  const handleSpin = () => {
    if (!gameState || isSpinning) return;

    if (gameState.coins < currentBet) return;

    spin(currentBet);
  };

  const handleBetChange = (bet: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentBet: bet,
      };
    });
  };

  const handleAutoSpinToggle = (checked: boolean) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          autoSpinEnabled: checked,
        },
      };
    });
  };

  const backgroundUrl = `${machine.assetBasePath}/${machine.backgroundImage}`;
  const canSpin = Boolean(gameState && gameState.coins >= currentBet && !isSpinning);
  const isBigWin = lastWinTier && ['big', 'mega', 'jackpot', 'ultra'].includes(lastWinTier);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-6">
      <div className="relative rounded-[32px] border border-white/10 shadow-[0_25px_60px_rgba(5,3,23,0.65)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03010d]/90 via-[#03010d]/85 to-[#050317]" />

        <motion.div 
          className="relative z-10 p-4 sm:p-6 space-y-4"
          animate={isBigWin ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between gap-3">
            <BackButton />
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">Current Machine</p>
              <p className="text-xl font-semibold text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]">
                {machine.name}
              </p>
              <p className="text-xs text-white/60">Prestige {machine.prestigeCost}+ required</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-end">
                <Badge variant="outline" className="border-white/20 text-white/90 bg-white/10">
                  RTP {(machine.payoutProfile.rtpTarget * 100).toFixed(1)}%
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 capitalize">
                  {machine.payoutProfile.volatility} volatility
                </Badge>
              </div>
            </div>
          </div>

          <FeatureStrip
            showScatter={machine.features?.scatter}
            showBonus={machine.features?.bonus}
            showJackpot={machine.features?.jackpot}
          />

          <SlotReels tier={tier} reels={reels} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill label="Active Bet" value={`$${formatNumber(currentBet)}`} />
            <StatPill label="Win Streak" value={`${gameState?.winStreak ?? 0}`} />
            <StatPill label="Recent Win%" value={`${sessionStats.recentWinRate.toFixed(0)}%`} />
            <StatPill label="Session Net" value={`${sessionStats.net >= 0 ? '+' : ''}${formatNumber(sessionStats.net)}`} positive={sessionStats.net >= 0} />
          </div>

          <div className="space-y-3">
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest text-white/60">Bet Selector</p>
                <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">
                  Balance: {formatNumber(gameState?.coins ?? 0)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {betOptions.map((bet) => (
                  <button
                    key={bet}
                    type="button"
                    onClick={() => handleBetChange(bet)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors',
                      currentBet === bet
                        ? 'bg-white text-[#050317] border-white'
                        : 'text-white/70 border-white/20 hover:border-white/40'
                    )}
                  >
                    ${formatNumber(bet)}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Auto-Spin</p>
                <p className="text-xs text-white/60">Play {gameState?.preferences.autoSpinBatchSize ?? 10} spins in a row</p>
              </div>
              <Switch
                checked={gameState?.preferences.autoSpinEnabled}
                onCheckedChange={handleAutoSpinToggle}
              />
            </section>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <p className="text-sm text-white/70 text-center sm:text-left">
              Last Win:{' '}
              <span className="font-semibold text-white">
                {lastWin > 0 ? `+${formatNumber(lastWin)}` : '—'}
              </span>
            </p>
            <div className="flex-1" />
            <Button
              onClick={handleSpin}
              disabled={!canSpin}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold bg-gradient-to-r from-[#fbbf24] via-[#f97316] to-[#ec4899] text-[#050317] shadow-[0_0_30px_rgba(250,204,21,0.6)] disabled:opacity-50"
            >
              {spinIcon && (
                <AssetImage
                  src={spinIcon}
                  alt="Spin"
                  className="w-6 h-6 object-contain"
                  loading="lazy"
                />
              )}
              <span>Spin ${formatNumber(currentBet)}</span>
            </Button>
          </div>
        </motion.div>

        <SpinResultOverlay winAmount={lastWin} winTier={lastWinTier} multiplier={lastWinMultiplier} />
      </div>
    </div>
  );
}

interface StatPillProps {
  label: string;
  value: string;
  positive?: boolean;
}

function StatPill({ label, value, positive }: StatPillProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className={cn('text-lg font-semibold text-white', positive ? 'text-emerald-300' : undefined)}>{value}</p>
    </div>
  );
}
