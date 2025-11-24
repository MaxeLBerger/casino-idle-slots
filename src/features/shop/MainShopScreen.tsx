import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

export const MainShopScreen: React.FC = () => {
  const { goBack } = useNavigation();
  return (
    <div className='p-8 text-center'>
      <h1 className='text-2xl font-bold text-gold-400 mb-4'>Main Shop</h1>
      <p className='text-white/70 mb-8'>Buy Coins, Diamonds, and Special Offers.</p>
      <button onClick={goBack} className='px-4 py-2 bg-white/10 rounded hover:bg-white/20'>Back</button>
    </div>
  );
};
