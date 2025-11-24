import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useGame } from '@/contexts/GameContext';
import { PrestigeDialog } from '@/components/PrestigeDialog';

export const PrestigeScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { gameState } = useGame();

  return (
    <div className='w-full h-full flex flex-col bg-[#050317]'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-black/40 border-b border-white/10'>
        <button onClick={goBack} className='px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20'>
          Back
        </button>
        <h1 className='text-xl font-bold text-purple-400 tracking-widest uppercase'>VIP Lounge</h1>
        <div className='w-16' /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 flex items-center justify-center'>
        <div className='max-w-2xl w-full'>
          <PrestigeDialog 
            open={true} 
            onOpenChange={() => {}} 
            currentCoins={gameState.coins}
            lifetimeEarnings={gameState.lifetimeEarnings}
            prestigePoints={gameState.prestigePoints}
            onPrestige={() => console.log('Prestige Triggered')}
          />
        </div>
      </div>
    </div>
  );
};
