/**
 * Map System Constants
 * Konfiguration der Map-Gebäude und Positionen
 */

import { MapBuilding, MapBuildingId, MapConfig } from '@/types/map.types';

export const MAP_CONFIG: MapConfig = {
  width: 1920,
  height: 1080,
  backgroundAsset: '/assets/buildings/map_background.png',
};

export const MAP_BUILDING_ASSETS: Record<MapBuildingId, string> = {
  casino_classic: '/assets/buildings/building_classic.png',
  casino_sapphire: '/assets/buildings/building_sapphire.png',
  casino_emerald: '/assets/buildings/building_emerald.png',
  casino_royal: '/assets/buildings/building_royal.png',
  casino_celestial: '/assets/buildings/building_celestial.png',
  casino_dragon: '/assets/buildings/building_dragon.png',
  facility_worker_hq: '/assets/buildings/building_worker_hq.png',
  facility_boutique: '/assets/buildings/building_boutique.png',
  facility_vip: '/assets/buildings/building_vip_lounge.png',
  facility_event: '/assets/buildings/building_event_plaza.png',
};

export const MAP_BUILDINGS: MapBuilding[] = [
  // --- CASINOS ---
  {
    id: 'casino_classic',
    name: 'Classic Lounge',
    description: 'Where it all began. Retro vibes and classic wins.',
    type: 'casino',
    position: { x: 15, y: 60 },
    scale: 1,
    assetName: MAP_BUILDING_ASSETS.casino_classic,
    slotMachineIndex: 0,
    requiredPrestige: 0,
  },
  {
    id: 'casino_sapphire',
    name: 'Sapphire Room',
    description: 'Modern luxury with a cool touch.',
    type: 'casino',
    position: { x: 35, y: 50 },
    scale: 1,
    assetName: MAP_BUILDING_ASSETS.casino_sapphire,
    slotMachineIndex: 1,
    requiredPrestige: 5,
  },
  {
    id: 'casino_emerald',
    name: 'Emerald Suite',
    description: 'High stakes for the serious player.',
    type: 'casino',
    position: { x: 55, y: 45 },
    scale: 1,
    assetName: MAP_BUILDING_ASSETS.casino_emerald,
    slotMachineIndex: 2,
    requiredPrestige: 10,
  },
  {
    id: 'casino_royal',
    name: 'Royal Palace',
    description: 'Fit for a king. Majestic rewards await.',
    type: 'casino',
    position: { x: 75, y: 40 },
    scale: 1.1,
    assetName: MAP_BUILDING_ASSETS.casino_royal,
    slotMachineIndex: 3,
    requiredPrestige: 15,
  },
  {
    id: 'casino_celestial',
    name: 'Celestial Deck',
    description: 'Wins that are out of this world.',
    type: 'casino',
    position: { x: 85, y: 20 },
    scale: 1.2,
    assetName: MAP_BUILDING_ASSETS.casino_celestial,
    slotMachineIndex: 4,
    requiredPrestige: 20,
  },
  {
    id: 'casino_dragon',
    name: 'Golden Dragon',
    description: 'Legendary luck and fortune.',
    type: 'casino',
    position: { x: 50, y: 20 }, // Central/Top position
    scale: 1.3,
    assetName: MAP_BUILDING_ASSETS.casino_dragon,
    slotMachineIndex: 5, // Event slot
    requiredPrestige: 50,
  },

  // --- FACILITIES ---
  {
    id: 'facility_worker_hq',
    name: 'Worker HQ',
    description: 'Manage your idle workforce here.',
    type: 'facility',
    position: { x: 10, y: 30 },
    scale: 0.9,
    assetName: MAP_BUILDING_ASSETS.facility_worker_hq,
  },
  {
    id: 'facility_boutique',
    name: 'Luxury Boutique',
    description: 'Spend your diamonds on exclusive items.',
    type: 'facility',
    position: { x: 25, y: 80 },
    scale: 0.8,
    assetName: MAP_BUILDING_ASSETS.facility_boutique,
  },
  {
    id: 'facility_vip',
    name: 'VIP Lounge',
    description: 'Exclusive club for top-tier players.',
    type: 'facility',
    position: { x: 90, y: 70 },
    scale: 0.9,
    assetName: MAP_BUILDING_ASSETS.facility_vip,
  },
  {
    id: 'facility_event',
    name: 'Event Plaza',
    description: 'Check out current events and challenges.',
    type: 'facility',
    position: { x: 50, y: 75 },
    scale: 1.2,
    assetName: MAP_BUILDING_ASSETS.facility_event,
  },
];
