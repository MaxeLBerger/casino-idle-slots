import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';
import { UI_ICON_ASSETS } from '@/constants/ui.constants';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const TopBar: React.FC<{ className?: string }> = ({ className }) => {
  const { gameState } = useGame();
  const { navigateTo } = useNavigation();

  return (
    <div className={cn('fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4', className)}>
      {/* Left: Profile/Level (Placeholder) */}
      <div className='flex items-center gap-2'>
        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-gold-500 flex items-center justify-center text-white font-bold'>
          {gameState.level}
        </div>
      </div>

      {/* Center: Currencies */}
      <div className='flex items-center gap-4'>
        {/* Coins */}
        <div className='flex items-center gap-1 bg-black/50 rounded-full px-3 py-1 border border-white/10'>
          <img src={CURRENCY_ICON_ASSETS.coins} alt='Coins' className='w-6 h-6' />
          <span className='text-gold-400 font-bold text-sm'>{formatNumber(gameState.coins)}</span>
        </div>

        {/* Prestige Points */}
        <div className='flex items-center gap-1 bg-black/50 rounded-full px-3 py-1 border border-white/10'>
          <img src={CURRENCY_ICON_ASSETS.prestigePoints} alt='Prestige' className='w-6 h-6' />
          <span className='text-purple-400 font-bold text-sm'>{formatNumber(gameState.prestigePoints)}</span>
        </div>

        {/* Diamonds */}
        <div className='flex items-center gap-1 bg-black/50 rounded-full px-3 py-1 border border-white/10'>
          <img src={CURRENCY_ICON_ASSETS.diamonds} alt='Diamonds' className='w-6 h-6' />
          <span className='text-cyan-400 font-bold text-sm'>{formatNumber(0)}</span> {/* TODO: Add diamonds to state */}
        </div>
      </div>

      {/* Right: Settings */}
      <button 
        onClick={() => navigateTo('SETTINGS')}
        className='w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors'
      >
        <img src={UI_ICON_ASSETS.settings} alt='Settings' className='w-6 h-6' />
      </button>
    </div>
  );
};
