import { WORKER_ROLE_ASSETS, WORKER_CONFIGS, WORKER_ORDER, getWorkerUpgradeCost, getWorkerIncome } from '@/constants/workers.constants';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GameState } from '@/types';
import { canUnlockWorker } from '@/hooks/game/useGameLoop';
import { Lock, TrendingUp, Coins } from 'lucide-react';

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return Math.floor(num).toString();
}

function getUnlockReason(workerId: string): string {
  const config = WORKER_CONFIGS[workerId];
  if (!config?.unlockRequirement) return '';
  const req = config.unlockRequirement;
  if (req.type === 'worker') {
    const requiredConfig = WORKER_CONFIGS[req.workerId];
    return `Requires ${requiredConfig?.name || req.workerId} Lv.${req.level}`;
  }
  if (req.type === 'prestige') {
    return `Requires ${req.prestigePoints} Prestige Points`;
  }
  return 'Locked';
}

interface WorkerCardProps {
  roleId: string;
  level: number;
  coins: number;
  workers: Record<string, number>;
  prestigePoints: number;
  onHire: (roleId: string) => void;
  onUpgrade: (roleId: string) => void;
}

function WorkerCard({ roleId, level, coins, workers, prestigePoints, onHire, onUpgrade }: WorkerCardProps) {
  const config = WORKER_CONFIGS[roleId];
  if (!config) return null;
  
  const icon = WORKER_ROLE_ASSETS[roleId];
  const isHired = level > 0;
  const upgradeCost = getWorkerUpgradeCost(roleId, level);
  const currentIncome = getWorkerIncome(roleId, level);
  const nextIncome = getWorkerIncome(roleId, level + 1);
  const incomeGain = nextIncome - currentIncome;
  const canAfford = coins >= upgradeCost;
  const isMaxLevel = level >= config.maxLevel;
  const canUnlock = canUnlockWorker(roleId, workers, prestigePoints);
  const isLocked = !isHired && !canUnlock;
  const unlockReason = isLocked ? getUnlockReason(roleId) : '';

  let buttonText = '';
  let buttonDisabled = false;
  let buttonAction: (() => void) | null = null;

  if (isLocked) {
    buttonText = unlockReason || 'Locked';
    buttonDisabled = true;
  } else if (!isHired) {
    buttonText = `Hire: ${formatNumber(upgradeCost)}`;
    buttonDisabled = !canAfford;
    buttonAction = () => onHire(roleId);
  } else if (isMaxLevel) {
    buttonText = 'MAX';
    buttonDisabled = true;
  } else {
    buttonText = `Upgrade: ${formatNumber(upgradeCost)}`;
    buttonDisabled = !canAfford;
    buttonAction = () => onUpgrade(roleId);
  }

  const cardClasses = isLocked 
    ? 'bg-[#050317]/60 border-[#1a1030] opacity-60' 
    : isHired 
      ? 'bg-gradient-to-br from-[#0a0520]/90 to-[#050317]/90 border-[#4a3080]/50' 
      : 'bg-[#050317]/80 border-[#312556]';
  const iconClasses = isHired ? 'bg-[#1a0a30] ring-2 ring-[#8b5cf6]/30' : 'bg-[#0b0418]';
  const btnClasses = !buttonDisabled && !isLocked 
    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#9d6eff] hover:to-[#7c7fff] text-white border-0' 
    : 'bg-transparent border-[#312556] text-slate-400';

  return (
    <div className={`flex flex-col p-4 rounded-2xl border transition-all duration-200 ${cardClasses}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${iconClasses}`}>
          {isLocked ? (
            <Lock className="w-6 h-6 text-slate-500" />
          ) : icon ? (
            <img src={icon} alt={config.name} className="w-8 h-8 object-contain icon-blend" loading="lazy" />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white truncate">{config.name}</span>
            {isHired && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-[#8b5cf6]/40 text-[#c4b5fd] bg-[#1a0a30]">
                Lv. {level}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{config.description}</p>
        </div>
      </div>
      
      {isHired && !isMaxLevel && (
        <div className="flex items-center gap-4 mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-200">{currentIncome.toFixed(1)}/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{incomeGain.toFixed(1)}/s</span>
          </div>
        </div>
      )}
      
      {isHired && isMaxLevel && (
        <div className="flex items-center gap-4 mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-200">{currentIncome.toFixed(1)}/s</span>
          </div>
          <Badge className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            MAXED
          </Badge>
        </div>
      )}
      
      <Button 
        variant={isLocked || buttonDisabled ? 'outline' : 'default'} 
        size="sm" 
        disabled={buttonDisabled} 
        onClick={buttonAction ?? undefined} 
        className={`w-full h-9 text-xs font-semibold tracking-wide ${btnClasses}`}
      >   
        {isLocked && <Lock className="w-3.5 h-3.5 mr-1.5" />}
        {buttonText}
      </Button>
    </div>
  );
}

export interface WorkersPanelProps {
  gameState: GameState;
  onHire: (roleId: string) => void;
  onUpgrade: (roleId: string) => void;
}

export function WorkersPanel({ gameState, onHire, onUpgrade }: WorkersPanelProps) {
  return (
    <Card className="p-4 bg-[#02010d]/90 border-[#312556]">
      <h2 className="text-sm font-semibold tracking-[0.14em] uppercase text-slate-100 mb-4">Casino Staff</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WORKER_ORDER.map((roleId) => {
          const level = gameState.workers[roleId] || 0;
          return (
            <WorkerCard 
              key={roleId} 
              roleId={roleId} 
              level={level} 
              coins={gameState.coins} 
              workers={gameState.workers}
              prestigePoints={gameState.prestigePoints}
              onHire={onHire} 
              onUpgrade={onUpgrade} 
            />
          );
        })}
      </div>
    </Card>
  );
}
