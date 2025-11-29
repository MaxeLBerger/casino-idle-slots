// Worker asset paths (for avatar/visual display)
export const WORKER_ROLE_ASSETS: Record<string, string> = {
  cashier: '/assets/avatars/worker_cashier.png',
  host: '/assets/avatars/worker_host.png',
  security: '/assets/avatars/worker_security.png',
  analyst: '/assets/avatars/worker_analyst.png',
  vip_concierge: '/assets/avatars/worker_vip_concierge.png',
  marketing: '/assets/avatars/worker_marketing.png',
  technician: '/assets/avatars/worker_technician.png',
  manager: '/assets/avatars/worker_manager.png',
};

import type { WorkerConfig } from '@/types/game.types';

// Full worker configuration with economics
export const WORKER_CONFIGS: Record<string, WorkerConfig> = {
  cashier: {
    roleId: 'cashier',
    name: 'Cashier',
    description: 'Handles basic transactions. A reliable earner.',
    baseCost: 50,
    costMultiplier: 1.15,
    baseIncome: 1,
    incomePerLevel: 0.5,
    maxLevel: 100,
    unlockRequirement: null,
  },
  host: {
    roleId: 'host',
    name: 'Floor Host',
    description: 'Welcomes guests and keeps them happy.',
    baseCost: 200,
    costMultiplier: 1.18,
    baseIncome: 4,
    incomePerLevel: 2,
    maxLevel: 100,
    unlockRequirement: { type: 'worker', workerId: 'cashier', level: 5 },
  },
  security: {
    roleId: 'security',
    name: 'Security Guard',
    description: 'Keeps the casino safe and orderly.',
    baseCost: 1000,
    costMultiplier: 1.20,
    baseIncome: 15,
    incomePerLevel: 7,
    maxLevel: 100,
    unlockRequirement: { type: 'worker', workerId: 'host', level: 5 },
  },
  analyst: {
    roleId: 'analyst',
    name: 'Data Analyst',
    description: 'Optimizes operations with insights.',
    baseCost: 5000,
    costMultiplier: 1.22,
    baseIncome: 50,
    incomePerLevel: 25,
    maxLevel: 100,
    unlockRequirement: { type: 'worker', workerId: 'security', level: 5 },
  },
  vip_concierge: {
    roleId: 'vip_concierge',
    name: 'VIP Concierge',
    description: 'Caters to high-rollers exclusively.',
    baseCost: 25000,
    costMultiplier: 1.25,
    baseIncome: 200,
    incomePerLevel: 100,
    maxLevel: 100,
    unlockRequirement: { type: 'worker', workerId: 'analyst', level: 10 },
  },
  marketing: {
    roleId: 'marketing',
    name: 'Marketing Specialist',
    description: 'Attracts new customers to the casino.',
    baseCost: 100000,
    costMultiplier: 1.25,
    baseIncome: 750,
    incomePerLevel: 400,
    maxLevel: 100,
    unlockRequirement: { type: 'worker', workerId: 'vip_concierge', level: 10 },
  },
  technician: {
    roleId: 'technician',
    name: 'Slot Technician',
    description: 'Maintains and upgrades slot machines.',
    baseCost: 500000,
    costMultiplier: 1.28,
    baseIncome: 3000,
    incomePerLevel: 1500,
    maxLevel: 100,
    unlockRequirement: { type: 'worker', workerId: 'marketing', level: 15 },
  },
  manager: {
    roleId: 'manager',
    name: 'Casino Manager',
    description: 'Oversees all operations. The ultimate hire.',
    baseCost: 2500000,
    costMultiplier: 1.30,
    baseIncome: 12000,
    incomePerLevel: 6000,
    maxLevel: 100,
    unlockRequirement: { type: 'prestige', prestigePoints: 100 },
  },
};

// Order in which workers appear in the UI
export const WORKER_ORDER = [
  'cashier',
  'host',
  'security',
  'analyst',
  'vip_concierge',
  'marketing',
  'technician',
  'manager',
] as const;

// Calculate the cost to upgrade a worker to the next level
export function getWorkerUpgradeCost(workerId: string, currentLevel: number): number {
  const config = WORKER_CONFIGS[workerId];
  if (!config) return Infinity;
  if (currentLevel >= config.maxLevel) return Infinity;
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
}

// Calculate the income per second for a worker at a given level
export function getWorkerIncome(workerId: string, level: number): number {
  const config = WORKER_CONFIGS[workerId];
  if (!config || level <= 0) return 0;
  return config.baseIncome + config.incomePerLevel * (level - 1);
}
