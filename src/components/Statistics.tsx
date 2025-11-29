import React from 'react';
import { 
  ChartBar, 
  Trophy, 
  Coins, 
  Lightning, 
  Target,
  Clock,
  TrendUp,
  Star,
  Crown
} from '@phosphor-icons/react';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackButton } from '@/components/ui/BackButton';
import { AssetImage } from '@/components/ui/asset-image';
import { formatNumber } from '@/lib/utils';
import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';
import { XP_PER_LEVEL } from '@/constants/game.constants';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color = 'text-primary' }) => (
  <Card className="p-4 bg-card/80 border-border/50 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  </Card>
);

export const Statistics: React.FC = () => {
  const { gameState } = useGame();

  const winRate = gameState.totalSpins > 0 
    ? ((gameState.totalWins / gameState.totalSpins) * 100).toFixed(1) 
    : '0.0';

  const lifetimeWinRate = (gameState.lifetimeSpins ?? 0) > 0
    ? (((gameState.lifetimeWins ?? 0) / (gameState.lifetimeSpins ?? 1)) * 100).toFixed(1)
    : '0.0';

  const xpProgress = gameState.experience % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ChartBar size={28} weight="fill" className="text-primary" />
            Statistics
          </h1>
          <p className="text-sm text-muted-foreground">Your casino performance</p>
        </div>
      </div>

      {/* Level Progress Card */}
      <Card className="p-4 mb-6 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={20} weight="fill" className="text-primary" />
            <span className="font-bold">Level {gameState.level}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {xpProgress} / {xpNeeded} XP
          </span>
        </div>
        <Progress value={(xpProgress / xpNeeded) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {xpNeeded - xpProgress} XP until Level {gameState.level + 1}
        </p>
      </Card>

      {/* Currency Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 bg-card/80 border-border/50 text-center">
          <AssetImage src={CURRENCY_ICON_ASSETS.coins} alt="Coins" className="w-8 h-8 mx-auto mb-1 icon-blend" />
          <p className="text-xs text-muted-foreground">Coins</p>
          <p className="font-bold text-primary">{formatNumber(gameState.coins)}</p>
        </Card>
        <Card className="p-3 bg-card/80 border-border/50 text-center">
          <AssetImage src={CURRENCY_ICON_ASSETS.prestigePoints} alt="Prestige" className="w-8 h-8 mx-auto mb-1 icon-blend" />
          <p className="text-xs text-muted-foreground">Prestige</p>
          <p className="font-bold text-purple-400">{formatNumber(gameState.prestigePoints)}</p>
        </Card>
        <Card className="p-3 bg-card/80 border-border/50 text-center">
          <AssetImage src={CURRENCY_ICON_ASSETS.diamonds} alt="Diamonds" className="w-8 h-8 mx-auto mb-1 icon-blend" />
          <p className="text-xs text-muted-foreground">Diamonds</p>
          <p className="font-bold text-cyan-400">{formatNumber(gameState.diamonds)}</p>
        </Card>
      </div>

      {/* Current Run Stats */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Lightning size={20} weight="fill" className="text-accent" />
        Current Run
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Target size={20} weight="fill" />}
          label="Total Spins"
          value={formatNumber(gameState.totalSpins)}
          color="text-blue-400"
        />
        <StatCard
          icon={<Trophy size={20} weight="fill" />}
          label="Total Wins"
          value={formatNumber(gameState.totalWins)}
          subValue={`${winRate}% win rate`}
          color="text-green-400"
        />
        <StatCard
          icon={<Coins size={20} weight="fill" />}
          label="Total Earnings"
          value={formatNumber(gameState.totalEarnings)}
          color="text-primary"
        />
        <StatCard
          icon={<Crown size={20} weight="fill" />}
          label="Biggest Win"
          value={formatNumber(gameState.biggestWin)}
          color="text-yellow-400"
        />
      </div>

      <Separator className="my-4" />

      {/* Lifetime Stats */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <TrendUp size={20} weight="fill" className="text-purple-400" />
        Lifetime Stats
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Target size={20} weight="fill" />}
          label="Lifetime Spins"
          value={formatNumber(gameState.lifetimeSpins ?? 0)}
          color="text-blue-400"
        />
        <StatCard
          icon={<Trophy size={20} weight="fill" />}
          label="Lifetime Wins"
          value={formatNumber(gameState.lifetimeWins ?? 0)}
          subValue={`${lifetimeWinRate}% win rate`}
          color="text-green-400"
        />
        <StatCard
          icon={<Coins size={20} weight="fill" />}
          label="Lifetime Earnings"
          value={formatNumber(gameState.lifetimeEarnings ?? 0)}
          color="text-primary"
        />
        <StatCard
          icon={<Crown size={20} weight="fill" />}
          label="Lifetime Biggest Win"
          value={formatNumber(gameState.lifetimeBiggestWin ?? 0)}
          color="text-yellow-400"
        />
      </div>

      <Separator className="my-4" />

      {/* Streaks & Records */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Star size={20} weight="fill" className="text-yellow-400" />
        Records & Streaks
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Lightning size={20} weight="fill" />}
          label="Current Win Streak"
          value={gameState.winStreak}
          color="text-orange-400"
        />
        <StatCard
          icon={<Trophy size={20} weight="fill" />}
          label="Max Win Streak"
          value={gameState.maxWinStreak}
          color="text-yellow-400"
        />
        <StatCard
          icon={<Clock size={20} weight="fill" />}
          label="Login Streak"
          value={`${gameState.loginStreak} days`}
          color="text-cyan-400"
        />
        <StatCard
          icon={<TrendUp size={20} weight="fill" />}
          label="Total Upgrades"
          value={gameState.totalUpgrades}
          color="text-purple-400"
        />
      </div>
      </div>
    </ScrollArea>
  );
};

export default Statistics;
