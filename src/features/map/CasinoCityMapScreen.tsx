import { useCallback } from 'react';

import { MAP_BUILDINGS, MAP_CONFIG } from '@/constants/map.constants';
import { AVATAR_ASSETS } from '@/constants/avatar.constants';
import { AvatarId } from '@/types';
import { useGame } from '@/contexts/GameContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { MapBuilding, MapBuildingId } from '@/types/map.types';
import { GameScreen } from '@/types/navigation.types';
import { getAssetPath } from '@/lib/utils';
import { AssetImage } from '@/components/ui/asset-image';

interface CasinoCityMapScreenProps {
  avatarId?: AvatarId;
}

export function CasinoCityMapScreen({ avatarId = 'highRoller' }: CasinoCityMapScreenProps) {
  const avatarSrc = AVATAR_ASSETS[avatarId];
  const { gameState, setGameState } = useGame();
  const { navigateTo } = useNavigation();

  const handleBuildingClick = useCallback((building: MapBuilding) => {
    if (!gameState) {
      return;
    }

    const lockReason = getBuildingLockReason(building, gameState);
    if (lockReason) {
      return;
    }

    if (building.type === 'casino' && typeof building.slotMachineIndex === 'number') {
      const slotIndex = building.slotMachineIndex;
      setGameState(prev => {
        if (!prev) return prev;
        const alreadyUnlocked = prev.unlockedSlotMachines.includes(slotIndex);
        if (prev.currentSlotMachine === slotIndex && alreadyUnlocked) {
          return prev;
        }
        return {
          ...prev,
          currentSlotMachine: slotIndex,
          unlockedSlotMachines: alreadyUnlocked
            ? prev.unlockedSlotMachines
            : [...prev.unlockedSlotMachines, slotIndex],
        };
      });
      navigateTo('SLOT_MACHINE');
      return;
    }

    const destination = FACILITY_DESTINATIONS[building.id];
    if (destination) {
      navigateTo(destination);
      return;
    }

    return;
  }, [gameState, navigateTo, setGameState]);

  return (
    <div
      className="relative w-full max-w-md mx-auto aspect-[9/16] rounded-3xl overflow-hidden border border-[#312556] bg-[#02010d] shadow-[0_0_40px_rgba(0,0,0,0.85)]"
      style={{
        backgroundImage: `url(${getAssetPath(MAP_CONFIG.backgroundAsset)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {MAP_BUILDINGS.map((building) => {
        const lockReason = getBuildingLockReason(building, gameState);
        const isLocked = Boolean(lockReason);
        const isActive = Boolean(
          building.type === 'casino' &&
          typeof building.slotMachineIndex === 'number' &&
          gameState?.currentSlotMachine === building.slotMachineIndex,
        );

        return (
          <button
            key={building.id}
            type="button"
            onClick={() => handleBuildingClick(building)}
            className={`absolute transition-transform duration-300 ${isLocked ? 'opacity-60 grayscale' : 'hover:scale-105 active:scale-95'} ${isActive ? 'drop-shadow-[0_0_18px_rgba(248,191,36,0.8)]' : ''}`}
            style={{
              left: `${building.position.x}%`,
              top: `${building.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`${building.name}${isLocked ? ' (locked)' : ''}`}
            aria-disabled={isLocked}
            title={lockReason ?? building.description}
          >
            <div className="relative">
              <AssetImage
                src={building.assetName}
                alt={building.name}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_16px_rgba(0,0,0,0.9)]"
                loading="lazy"
              />
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm text-[8px] sm:text-[10px] font-semibold text-gold-200">
                  Locked
                </div>
              )}
              {isActive && !isLocked && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold bg-[#fbbf24] text-[#050317] rounded-full shadow-lg whitespace-nowrap">
                  Active
                </div>
              )}
            </div>
          </button>
        );
      })}

      {avatarSrc && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-[#fbbf24] via-[#f97316] to-[#ec4899] p-[2px] sm:p-[3px] shadow-[0_0_24px_rgba(248,250,252,0.75)]">
            <div className="w-full h-full rounded-full bg-[#050317]/95 flex items-center justify-center overflow-hidden">
              <AssetImage
                src={avatarSrc}
                alt="Avatar"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FACILITY_DESTINATIONS: Partial<Record<MapBuildingId, GameScreen>> = {
  facility_worker_hq: 'WORKERS_HQ',
  facility_boutique: 'AVATAR_WARDROBE',
  facility_vip: 'PRESTIGE_LOUNGE',
  facility_event: 'SOCIAL_HUB',
};

function getBuildingLockReason(building: MapBuilding, gameState: ReturnType<typeof useGame>['gameState']) {
  if (!gameState) {
    return 'Initializing...';
  }
  if (building.requiredPrestige && gameState.prestigePoints < building.requiredPrestige) {
    return `Requires Prestige ${building.requiredPrestige}`;
  }
  if (building.requiredLevel && gameState.level < building.requiredLevel) {
    return `Requires Level ${building.requiredLevel}`;
  }
  return null;
}
