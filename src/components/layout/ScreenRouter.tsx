import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useGame } from '@/contexts/GameContext';
import { SlotCasinoScreen } from '@/features/slot-machine/SlotCasinoScreen';
import { CasinoCityMapScreen } from '@/features/map/CasinoCityMapScreen';
import { WorkersPanel } from '@/features/workers/WorkersPanel';
import { UpgradesPanel } from '@/features/upgrades/UpgradesPanel';
import { PrestigeDialog } from '@/components/PrestigeDialog';
import { MainShopScreen } from '@/features/shop/MainShopScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { AvatarWardrobeScreen } from '@/features/avatar/AvatarWardrobeScreen';
import { SocialHubScreen } from '@/features/social/SocialHubScreen';
import { Statistics } from '@/components/Statistics';
import { GAME_CONFIG } from '@/constants/game.constants';
import { calculatePrestigeStartingCoins } from '@/lib/prestige';

// Wrapper for Workers to map state
const WorkersScreenWrapper = () => {
  const { gameState, hireWorker, upgradeWorker, currentCPS } = useGame();
  const { goBack } = useNavigation();
  
  return (
    <div className='p-4 h-full overflow-y-auto'>
      <div className="mb-4 text-center">
        <span className="text-sm text-slate-400">Coins per second: </span>
        <span className="text-lg font-bold text-yellow-400">{currentCPS.toFixed(1)}/s</span>
      </div>
      <WorkersPanel 
        gameState={gameState} 
        onHire={hireWorker} 
        onUpgrade={upgradeWorker} 
      />
      <button onClick={goBack} className='mt-4 px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors'>
        Back to City
      </button>
    </div>
  );
};

// Wrapper for Upgrades to map state
const UpgradesScreenWrapper = () => {
  const { gameState } = useGame();
  const { goBack } = useNavigation();
  
  // Placeholder handlers
  const handleUpgradeSpin = () => console.log('Upgrade Spin');
  const handleUpgradeIdle = () => console.log('Upgrade Idle');

  return (
    <div className='p-4 h-full overflow-y-auto'>
      <UpgradesPanel 
        spinLevel={gameState.spinPowerLevel}
        spinCost={100}
        idleLevel={gameState.idleIncomeLevel}
        idleCost={100}
        onUpgradeSpin={handleUpgradeSpin}
        onUpgradeIdle={handleUpgradeIdle}
        canAffordSpin={gameState.coins >= 100}
        canAffordIdle={gameState.coins >= 100}
      />
      <button onClick={goBack} className='mt-4 px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors'>
        Back to City
      </button>
    </div>
  );
};

// Wrapper for Prestige
const PrestigeScreenWrapper = () => {
  const { gameState, setGameState, saveGame } = useGame();
  const { goBack } = useNavigation();

  const handlePrestige = () => {
    const newPrestigePoints = gameState.prestigePoints + 1;
    const startingCoins = calculatePrestigeStartingCoins(newPrestigePoints, GAME_CONFIG.STARTING_COINS);
    
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: startingCoins,
        totalEarnings: 0,
        totalSpins: 0,
        totalWins: 0,
        biggestWin: 0,
        winStreak: 0,
        prestigePoints: newPrestigePoints,
        totalPrestigeEarned: (prev.totalPrestigeEarned ?? 0) + 1,
        lifetimeEarnings: (prev.lifetimeEarnings ?? 0) + prev.totalEarnings,
        lifetimeSpins: (prev.lifetimeSpins ?? 0) + prev.totalSpins,
        lifetimeWins: (prev.lifetimeWins ?? 0) + prev.totalWins,
        lifetimeBiggestWin: Math.max(prev.lifetimeBiggestWin ?? 0, prev.biggestWin),
        currentSlotMachine: 0,
        unlockedSlotMachines: [0],
        spinPowerLevel: 0,
        spinMultiplier: 1,
        idleIncomeLevel: 1,
        idleIncomePerSecond: 1,
        reelSpeedLevel: 0,
        jackpotChanceLevel: 0,
        workerEfficiencyLevel: 0,
        offlineEarningsLevel: 0,
        prestigeLevel: (prev.prestigeLevel ?? 0) + 1,
        workers: {},
      };
    });
    
    saveGame();
    goBack();
  };

  const handleClose = () => {
    goBack();
  };

  return (
    <div className='p-4 flex items-center justify-center h-full'>
      <PrestigeDialog 
        open={true} 
        onOpenChange={handleClose}
        currentPrestigePoints={gameState.prestigePoints ?? 0}
        totalEarnings={gameState.totalEarnings ?? 0}
        currentCoins={gameState.coins ?? 0}
        level={gameState.level ?? 1}
        onConfirm={handlePrestige}
      />
    </div>
  );
};

export const ScreenRouter: React.FC = () => {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'LOADING':
      return <div className='flex items-center justify-center h-full text-gold-400'>Loading Casino...</div>;
    case 'CITY_MAP':
      return <CasinoCityMapScreen avatarId='highRoller' />;
    case 'SLOT_MACHINE':
      return <SlotCasinoScreen />;
    case 'WORKERS_HQ':
      return <WorkersScreenWrapper />;
    case 'UPGRADES_LAB':
      return <UpgradesScreenWrapper />;
    case 'PRESTIGE_LOUNGE':
      return <PrestigeScreenWrapper />;
    case 'MAIN_SHOP':
      return <MainShopScreen />;
    case 'SETTINGS':
      return <SettingsScreen />;
    case 'AVATAR_WARDROBE':
      return <AvatarWardrobeScreen />;
    case 'SOCIAL_HUB':
      return <SocialHubScreen />;
    case 'STATISTICS':
      return <Statistics />;
    default:
      return <div className='text-white'>Screen not found: {currentScreen}</div>;
  }
};
