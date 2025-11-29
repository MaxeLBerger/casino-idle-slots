import React from 'react';
import { WorkersPanel } from './WorkersPanel';
import { WORKER_ROLE_ASSETS } from '@/constants/workers.constants';
import { BackButton } from '@/components/ui/BackButton';

export const WorkersHQScreen: React.FC = () => {
  // TODO: Map actual workers from state
  const workers = [
    { id: '1', role: 'bartender' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Serves drinks to increase idle income.' },
    { id: '2', role: 'security' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Guards the door to prevent theft.' },
    { id: '3', role: 'manager' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Manages the staff for better efficiency.' },
    { id: '4', role: 'host' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Welcomes guests to increase reputation.' },
    { id: '5', role: 'chef' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Cooks delicious food for VIPs.' },
    { id: '6', role: 'dj' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Plays music to keep guests entertained.' },
    { id: '7', role: 'technician' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Maintains the slot machines.' },
    { id: '8', role: 'accountant' as keyof typeof WORKER_ROLE_ASSETS, level: 1, description: 'Optimizes finances for more profit.' },
  ];

  return (
    <div className='w-full h-full flex flex-col bg-[#050317]'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-black/40 border-b border-white/10'>
        <BackButton />
        <h1 className='text-xl font-bold text-white tracking-widest uppercase'>Workers HQ</h1>
        <div className='w-16' /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='mb-6 text-center'>
            <p className='text-slate-400 text-sm'>Hire and upgrade staff to automate your casino operations.</p>
          </div>
          <WorkersPanel workers={workers} />
        </div>
      </div>
    </div>
  );
};
