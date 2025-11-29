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
import { WORKER_ROLE_ASSETS } from '@/constants/workers.constants';
import { GAME_CONFIG } from '@/constants/game.constants';
import { calculatePrestigeStartingCoins } from '@/lib/prestige';

// Wrapper for Workers to map state
const WorkersScreenWrapper = () => {
  // TODO: Map actual workers from state
  const workers = [
    { id: '1', role: 'bartender' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Serves drinks' },
    { id: '2', role: 'security' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Guards the door' },
  ];
  return (
    <div className='p-4 h-full overflow-y-auto'>
      <WorkersPanel workers={workers} />
      <BackButton />
    </div>
  );
};

// Wrapper for Upgrades to map state
const UpgradesScreenWrapper = () => {
  const { gameState } = useGame();
  
  // Placeholder handlers
  const handleUpgradeSpin = () => console.log('Upgrade Spin');
  const handleUpgradeIdle = () => console.log('Upgrade Idle');

  return (
    <div className='p-4 h-full overflow-y-auto'>
      <UpgradesPanel 
        spinLevel={gameState.spinPowerLevel}
        spinCost={100} // TODO: Calculate cost
        idleLevel={gameState.idleIncomeLevel}
        idleCost={100} // TODO: Calculate cost
        onUpgradeSpin={handleUpgradeSpin}
        onUpgradeIdle={handleUpgradeIdle}
        canAffordSpin={gameState.coins >= 100}
        canAffordIdle={gameState.coins >= 100}
      />
      <BackButton />
    </div>
  );
};

// Wrapper for Prestige
const PrestigeScreenWrapper = () => {
  const { gameState, setGameState, saveGame } = useGame();
  const { goBack } = useNavigation();

  const handlePrestige = () => {
    // Calculate new prestige values
    const newPrestigePoints = gameState.prestigePoints + 1; // Simplified; real calculation would use calculatePrestigeReward
    const startingCoins = calculatePrestigeStartingCoins(newPrestigePoints, GAME_CONFIG.STARTING_COINS);
    
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        // Reset progress
        coins: startingCoins,
        totalEarnings: 0,
        totalSpins: 0,
        totalWins: 0,
        biggestWin: 0,
        winStreak: 0,
        // Keep and increment prestige
        prestigePoints: newPrestigePoints,
        totalPrestigeEarned: (prev.totalPrestigeEarned ?? 0) + 1,
        // Transfer to lifetime stats
        lifetimeEarnings: (prev.lifetimeEarnings ?? 0) + prev.totalEarnings,
        lifetimeSpins: (prev.lifetimeSpins ?? 0) + prev.totalSpins,
        lifetimeWins: (prev.lifetimeWins ?? 0) + prev.totalWins,
        lifetimeBiggestWin: Math.max(prev.lifetimeBiggestWin ?? 0, prev.biggestWin),
        // Reset slot machines
        currentSlotMachine: 0,
        unlockedSlotMachines: [0],
        // Reset upgrades
        spinPowerLevel: 0,
        spinMultiplier: 1,
        idleIncomeLevel: 1,
        idleIncomePerSecond: 1,
        reelSpeedLevel: 0,
        jackpotChanceLevel: 0,
        workerEfficiencyLevel: 0,
        offlineEarningsLevel: 0,
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

const BackButton = () => {
  const { goBack } = useNavigation();
  return (
    <button onClick={goBack} className='mt-4 px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors'>
      Back to City
    </button>
  );
};

export const ScreenRouter: React.FC = () => {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'LOADING':
      return <div className='flex items-center justify-center h-full text-gold-400'>Loading Casino...</div>;
    case 'CITY_MAP':
      return <CasinoCityMapScreen avatarId='highRoller' />; // TODO: Get avatar from state
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
