import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className='relative w-full h-screen overflow-hidden bg-slate-950 text-white font-sans select-none'>
      {/* Global Background */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black z-0' />
      
      {/* Ambient Glow */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none z-0' />

      {/* Content Container */}
      <div className={cn('relative z-10 w-full h-full flex flex-col', className)}>
        <TopBar />
        
        <main className='flex-1 relative overflow-hidden'>
          {children}
        </main>
      </div>
    </div>
  );
};
