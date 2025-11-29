import React from 'react';
import { WorkersPanel } from './WorkersPanel';
import { BackButton } from '@/components/ui/BackButton';
import { useGame } from '@/contexts/GameContext';
import { Coins, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return Math.floor(num).toLocaleString();
}

function formatCPS(cps: number): string {
  if (cps >= 1000) return `${(cps / 1000).toFixed(2)}K`;
  return cps.toFixed(1);
}

interface CPSDisplayProps {
  currentCPS: number;
  baseCPS: number;
  prestigeMultiplier: number;
  coins: number;
}

function CPSDisplay({ currentCPS, baseCPS, prestigeMultiplier, coins }: CPSDisplayProps) {
  const hasPrestigeBonus = prestigeMultiplier > 1;

  return (
    <Card className="p-4 bg-gradient-to-br from-[#1a0a30]/90 to-[#0a0520]/90 border-[#4a3080]/50">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Coins className="w-6 h-6 text-yellow-400" />
        <span className="text-2xl font-bold text-yellow-200">{formatNumber(coins)}</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-lg font-semibold text-emerald-300">+{formatCPS(currentCPS)}/s</span>
        </div>
        {hasPrestigeBonus && (
          <div className="flex items-center gap-1 text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>x{prestigeMultiplier.toFixed(2)}</span>
          </div>
        )}
      </div>
      {hasPrestigeBonus && (
        <div className="text-center mt-2 text-xs text-slate-400">Base: {formatCPS(baseCPS)}/s</div>
      )}
    </Card>
  );
}

export const WorkersHQScreen: React.FC = () => {
  const { gameState, hireWorker, upgradeWorker, currentCPS, baseCPS, prestigeMultiplier } = useGame();

  return (
    <div className='w-full h-full flex flex-col bg-[#050317]'>
      <div className='flex items-center justify-between p-4 bg-black/40 border-b border-white/10'>
        <BackButton />
        <h1 className='text-xl font-bold text-white tracking-widest uppercase'>Workers HQ</h1>
        <div className='w-16' />
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='max-w-2xl mx-auto space-y-4'>
          <CPSDisplay currentCPS={currentCPS} baseCPS={baseCPS} prestigeMultiplier={prestigeMultiplier} coins={gameState.coins} />
          <div className='text-center'>
            <p className='text-slate-400 text-sm'>Hire and upgrade staff to automate your casino operations.</p>
          </div>
          <WorkersPanel gameState={gameState} onHire={hireWorker} onUpgrade={upgradeWorker} />
        </div>
      </div>
    </div>
  );
};
