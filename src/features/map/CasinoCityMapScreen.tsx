import { MAP_BUILDINGS, MAP_CONFIG } from '@/constants/map.constants';
import { AVATAR_ASSETS } from '@/constants/avatar.constants';
import { AvatarId } from '@/types';

interface CityMapViewProps {
  avatarId?: AvatarId;
}

export function CityMapView({ avatarId = 'highRoller' }: CityMapViewProps) {
  const avatarSrc = AVATAR_ASSETS[avatarId];

  return (
    <div
      className="relative w-full max-w-md mx-auto aspect-[9/16] rounded-3xl overflow-hidden border border-[#312556] bg-[#02010d] shadow-[0_0_40px_rgba(0,0,0,0.85)]"
      style={{
        backgroundImage: `url(${MAP_CONFIG.backgroundAsset})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {MAP_BUILDINGS.map((building) => (
        <button
          key={building.id}
          type="button"
          className="absolute"
          style={{
            left: `${building.position.x}%`,
            top: `${building.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src={building.assetName}
            alt={building.name}
            className="w-16 h-16 object-contain drop-shadow-[0_0_16px_rgba(0,0,0,0.9)]"
            loading="lazy"
          />
        </button>
      ))}

      {avatarSrc && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#fbbf24] via-[#f97316] to-[#ec4899] p-[3px] shadow-[0_0_24px_rgba(248,250,252,0.75)]">
            <div className="w-full h-full rounded-full bg-[#050317]/95 flex items-center justify-center overflow-hidden">
              <img
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
