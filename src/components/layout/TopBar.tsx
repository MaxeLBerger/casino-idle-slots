import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';
import { UI_ICON_ASSETS } from '@/constants/ui.constants';
import { XP_PER_LEVEL, XP_REWARDS } from '@/constants/game.constants';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Star, Lightning, Trophy } from '@phosphor-icons/react';
import { AssetImage } from '@/components/ui/asset-image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Level Info Dialog Component
interface LevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  experience: number;
}

const LevelDialog: React.FC<LevelDialogProps> = ({ open, onOpenChange, level, experience }) => {
  const xpInCurrentLevel = experience % XP_PER_LEVEL;
  const xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  const xpNeeded = XP_PER_LEVEL - xpInCurrentLevel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star size={24} weight="fill" className="text-primary" />
            Level Progress
          </DialogTitle>
          <DialogDescription>
            Your current level and XP progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Level Display */}
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-4 border-primary flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>
            <h3 className="text-lg font-bold">Level {level}</h3>
            <p className="text-sm text-muted-foreground">High Roller</p>
          </Card>

          {/* XP Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Experience</span>
              <span className="text-sm text-muted-foreground">
                {xpInCurrentLevel} / {XP_PER_LEVEL} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {xpNeeded} XP until Level {level + 1}
            </p>
          </div>

          {/* XP Rewards Info */}
          <Card className="p-3 bg-card/50 border-border/50">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
              <Lightning size={14} weight="fill" className="text-accent" />
              How to Earn XP
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Each Spin</span>
                <Badge variant="secondary" className="text-[10px]">+{XP_REWARDS.SPIN} XP</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Each Win</span>
                <Badge variant="secondary" className="text-[10px]">+{XP_REWARDS.WIN} XP</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upgrade Purchase</span>
                <Badge variant="secondary" className="text-[10px]">+{XP_REWARDS.UPGRADE} XP</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Achievement</span>
                <Badge variant="secondary" className="text-[10px]">+{XP_REWARDS.ACHIEVEMENT} XP</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestige</span>
                <Badge variant="secondary" className="text-[10px]">+{XP_REWARDS.PRESTIGE} XP</Badge>
              </div>
            </div>
          </Card>

          {/* Next Level Reward Teaser */}
          <Card className="p-3 bg-accent/10 border-accent/30">
            <div className="flex items-center gap-2">
              <Trophy size={20} weight="fill" className="text-accent" />
              <div>
                <p className="text-sm font-bold">Level {level + 1} Reward</p>
                <p className="text-xs text-muted-foreground">Unlock new features & bonuses!</p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TopBar: React.FC<{ className?: string }> = ({ className }) => {
  const { gameState } = useGame();
  const { navigateTo, currentScreen } = useNavigation();
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);

  const navItems = [
    { id: 'map', icon: UI_ICON_ASSETS.map, label: 'City Map', screen: 'CITY_MAP' as const },
    { id: 'stats', icon: UI_ICON_ASSETS.stats, label: 'Statistics', screen: 'STATISTICS' as const },
    { id: 'shop', icon: UI_ICON_ASSETS.shop, label: 'Shop', screen: 'MAIN_SHOP' as const },
  ];

  return (
    <>
      <div className={cn('fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border/50 z-50 flex items-center justify-between px-4', className)}>
        {/* Left: Profile/Level (Clickable) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setLevelDialogOpen(true)}
                className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-primary flex items-center justify-center text-white font-bold hover:scale-105 transition-transform'
              >
                {gameState.level}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Level {gameState.level} - Click for details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center: Currencies */}
        <div className='flex items-center gap-2 sm:gap-4'>
          {/* Coins -> Upgrades */}
          <button 
            onClick={() => navigateTo('UPGRADES_LAB')}
            className='flex items-center gap-1 bg-card/80 rounded-full px-3 py-1 border border-border/50 hover:bg-card transition-colors'
          >
            <AssetImage src={CURRENCY_ICON_ASSETS.coins} alt='Coins' className='w-5 h-5 sm:w-6 sm:h-6 icon-blend' />
            <span className='text-primary font-bold text-xs sm:text-sm'>{formatNumber(gameState.coins)}</span>
          </button>

          {/* Prestige Points -> Prestige Lounge */}
          <button 
            onClick={() => navigateTo('PRESTIGE_LOUNGE')}
            className='flex items-center gap-1 bg-card/80 rounded-full px-3 py-1 border border-border/50 hover:bg-card transition-colors'
          >
            <AssetImage src={CURRENCY_ICON_ASSETS.prestigePoints} alt='Prestige' className='w-5 h-5 sm:w-6 sm:h-6 icon-blend' />
            <span className='text-purple-400 font-bold text-xs sm:text-sm'>{formatNumber(gameState.prestigePoints)}</span>
          </button>

          {/* Diamonds -> Shop */}
          <button 
            onClick={() => navigateTo('MAIN_SHOP', { shopTab: 'diamonds' })}
            className='flex items-center gap-1 bg-card/80 rounded-full px-3 py-1 border border-border/50 hover:bg-card transition-colors'
          >
            <AssetImage src={CURRENCY_ICON_ASSETS.diamonds} alt='Diamonds' className='w-5 h-5 sm:w-6 sm:h-6 icon-blend' />
            <span className='text-cyan-400 font-bold text-xs sm:text-sm'>{formatNumber(gameState.diamonds)}</span>
          </button>
        </div>

        {/* Right: Navigation & Settings */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigateTo(item.screen)}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-full transition-colors',
                      currentScreen === item.screen ? 'bg-primary/20' : 'hover:bg-card'
                    )}
                  >
                    <AssetImage src={item.icon} alt={item.label} className='w-6 h-6 icon-blend' />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => navigateTo('SETTINGS')}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-full transition-colors',
                    currentScreen === 'SETTINGS' ? 'bg-primary/20' : 'hover:bg-card'
                  )}
                >
                  <AssetImage src={UI_ICON_ASSETS.settings} alt='Settings' className='w-6 h-6 icon-blend' />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Level Dialog */}
      <LevelDialog
        open={levelDialogOpen}
        onOpenChange={setLevelDialogOpen}
        level={gameState.level}
        experience={gameState.experience}
      />
    </>
  );
};
