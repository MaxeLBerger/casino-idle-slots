import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useGame } from '@/contexts/GameContext';
import { SlotMachineView } from '@/features/slot-machine/SlotMachineView';
import { CityMapView } from '@/features/map/CityMapView';
import { WorkersPanel } from '@/features/workers/WorkersPanel';
import { UpgradesPanel } from '@/features/upgrades/UpgradesPanel';
import { PrestigeDialog } from '@/components/PrestigeDialog';
import { MainShopScreen } from '@/features/shop/MainShopScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { AvatarWardrobeScreen } from '@/features/avatar/AvatarWardrobeScreen';
import { SocialHubScreen } from '@/features/social/SocialHubScreen';
import { WORKER_ROLE_ASSETS } from '@/constants/workers.constants';

// Wrapper for Workers to map state
const WorkersScreenWrapper = () => {
  const { gameState } = useGame();
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
  const { gameState, setGameState } = useGame();
  
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
  const { gameState } = useGame();
  // PrestigeDialog is a Dialog, we might need to adapt it to be a screen or just open it.
  // For now, let's render it as a screen content if possible, or just a placeholder.
  return (
    <div className='p-4 flex items-center justify-center h-full'>
      <PrestigeDialog 
        open={true} 
        onOpenChange={() => {}} 
        currentCoins={gameState.coins}
        lifetimeEarnings={gameState.lifetimeEarnings}
        prestigePoints={gameState.prestigePoints}
        onPrestige={() => console.log('Prestige')}
      />
      <div className='absolute bottom-8'>
        <BackButton />
      </div>
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
  const { gameState } = useGame();

  switch (currentScreen) {
    case 'LOADING':
      return <div className='flex items-center justify-center h-full text-gold-400'>Loading Casino...</div>;
    case 'CITY_MAP':
      return <CityMapView avatarId='highRoller' />; // TODO: Get avatar from state
    case 'SLOT_MACHINE':
      return <SlotMachineView />;
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
    default:
      return <div className='text-white'>Screen not found: {currentScreen}</div>;
  }
};
