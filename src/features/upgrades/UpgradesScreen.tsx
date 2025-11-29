import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { UpgradesPanel } from './UpgradesPanel';
import { BackButton } from '@/components/ui/BackButton';

export const UpgradesScreen: React.FC = () => {
  const { gameState, setGameState } = useGame();

  const handleUpgradeSpin = () => {
    if (gameState.coins >= 100) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - 100,
        spinPowerLevel: prev.spinPowerLevel + 1
      }));
    }
  };

  const handleUpgradeIdle = () => {
    if (gameState.coins >= 100) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - 100,
        idleIncomeLevel: prev.idleIncomeLevel + 1
      }));
    }
  };

  return (
    <div className='w-full h-full flex flex-col bg-[#050317]'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-black/40 border-b border-white/10'>
        <BackButton />
        <h1 className='text-xl font-bold text-white tracking-widest uppercase'>Upgrades Lab</h1>
        <div className='w-16' /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='mb-6 text-center'>
            <p className='text-slate-400 text-sm'>Enhance your casino's performance with cutting-edge technology.</p>
          </div>
          <UpgradesPanel 
            spinLevel={gameState.spinPowerLevel}
            spinCost={100} // TODO: Calculate cost dynamically
            idleLevel={gameState.idleIncomeLevel}
            idleCost={100} // TODO: Calculate cost dynamically
            onUpgradeSpin={handleUpgradeSpin}
            onUpgradeIdle={handleUpgradeIdle}
            canAffordSpin={gameState.coins >= 100}
            canAffordIdle={gameState.coins >= 100}
          />
        </div>
      </div>
    </div>
  );
};
