/**
 * Map System Types
 * Typen für die Map, Gebäude und Interaktionen
 */

export type BuildingType = 'casino' | 'facility' | 'decoration';

export type MapBuildingId =
  | 'casino_classic'
  | 'casino_sapphire'
  | 'casino_emerald'
  | 'casino_royal'
  | 'casino_celestial'
  | 'casino_dragon'
  | 'facility_worker_hq'
  | 'facility_boutique'
  | 'facility_vip'
  | 'facility_event';

export interface MapBuilding {
  id: MapBuildingId;
  name: string;
  description: string;
  type: BuildingType;
  
  // Position auf der isometrischen Map (in Prozent oder Grid-Units)
  position: {
    x: number;
    y: number;
  };
  
  // Visuelle Größe (Skalierung)
  scale?: number;
  
  // Asset-Pfad (relativ zu /assets/buildings/)
  assetName: string;
  
  // Verknüpfung mit Slot-Maschine (nur für Casinos)
  slotMachineIndex?: number;
  
  // Unlock-Logik
  requiredLevel?: number;
  requiredPrestige?: number;
  isLocked?: boolean; // Runtime-Status
}

export interface MapConfig {
  width: number;
  height: number;
  backgroundAsset: string;
}
