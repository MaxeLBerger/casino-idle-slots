import { useMemo } from 'react';
import { MAP_BUILDINGS, MAP_CONFIG } from '@/constants/map.constants';
import { GameState } from '@/types/game.types';
import { SlotMachineConfig } from '@/types/slot.types';
import { Lock } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';

interface MapViewProps {
	gameState: GameState | null;
	slotMachines: SlotMachineConfig[];
	onSelectCasino: (index: number) => void;
	onClose?: () => void;
}

// Utility: Determine if a building is locked
const isBuildingLocked = (b: typeof MAP_BUILDINGS[number], gameState: GameState | null) => {
	if (!gameState) return true;
	if (b.requiredPrestige && gameState.prestigePoints < b.requiredPrestige) return true;
	if (b.requiredLevel && gameState.level < b.requiredLevel) return true;
	return false;
};

export function MapView({ gameState, slotMachines, onSelectCasino, onClose }: MapViewProps) {
	const buildings = useMemo(() => MAP_BUILDINGS, []);
	const eventTokenIcon = CURRENCY_ICON_ASSETS.eventTokenDragonJade;

	const handleBuildingClick = (b: typeof MAP_BUILDINGS[number]) => {
		const locked = isBuildingLocked(b, gameState);
		if (locked) {
			toast.error('Locked');
			return;
		}
		if (b.type === 'casino' && typeof b.slotMachineIndex === 'number') {
			onSelectCasino(b.slotMachineIndex);
			toast.success(`Entered ${b.name}`);
		} else {
			toast.info(b.name, { description: b.description });
		}
	};

	return (
		<div className="relative w-full h-full min-h-[70vh] md:min-h-[600px] rounded-xl overflow-hidden border border-primary/20 shadow-2xl bg-black/60">
			{/* Background */}
			<img 
				src={`/assets/buildings/${MAP_CONFIG.backgroundAsset}`} 
				alt="Map Background" 
				className="absolute inset-0 w-full h-full object-cover opacity-40" 
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background/80" />

			{/* Header */}
			<div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
				<h2 className="text-xl md:text-2xl font-bold tracking-wide">Casino City Map</h2>
				{onClose && (
					<Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
				)}
			</div>

			{/* Buildings Layer */}
			<div className="absolute inset-0">
				{buildings.map(b => {
					const locked = isBuildingLocked(b, gameState);
					const isActive = b.type === 'casino' && gameState?.currentSlotMachine === b.slotMachineIndex;
					return (
						<button
							key={b.id}
							onClick={() => handleBuildingClick(b)}
							style={{
								position: 'absolute',
								left: `${b.position.x}%`,
								top: `${b.position.y}%`,
								transform: `translate(-50%, -50%) scale(${b.scale || 1})`,
							}}
							className={`group cursor-pointer transition-all duration-300 relative flex flex-col items-center ${
								locked ? 'opacity-40 grayscale' : 'opacity-100'
							} ${isActive ? 'ring-4 ring-primary rounded-xl' : ''}`}
						>
							<div className="relative w-28 h-20 md:w-36 md:h-24 flex items-center justify-center">
								<img
									src={`/assets/buildings/${b.assetName}`}
									alt={b.name}
									className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
									loading="lazy"
								/>
								{locked && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
										<Lock size={32} className="text-primary" />
									</div>
								)}
								{isActive && !locked && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded shadow">Active</div>
								)}
							</div>
							<div className="mt-1 text-[10px] md:text-xs font-medium tracking-wide text-center w-32 pointer-events-none">
								{b.name}
							</div>
						</button>
					);
				})}
			</div>

			{/* Legend / Info */}
			<div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 space-y-2 bg-background/70 backdrop-blur-sm">
				<div className="flex flex-wrap gap-2 text-[11px] md:text-xs text-muted-foreground">
					<span><span className="inline-block w-2 h-2 bg-primary rounded-full mr-1" /> Active</span>
					<span><span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1" /> Locked</span>
					<span>Tap building to enter or view</span>
					{eventTokenIcon && (
						<span className="inline-flex items-center gap-1">
							<img
								src={eventTokenIcon}
								alt="Event Token"
								className="w-4 h-4 object-contain"
								loading="lazy"
							/>
							<span>Event Plaza rewards Event Tokens</span>
						</span>
					)}
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
					{buildings.filter(b => b.type === 'casino').map(b => (
						<Card key={`legend-${b.id}`} className={`p-2 flex flex-col gap-1 ${gameState?.currentSlotMachine === b.slotMachineIndex ? 'border-primary' : ''}`}>
							<div className="text-[10px] md:text-xs font-semibold truncate">{b.name}</div>
							<div className="text-[9px] md:text-[10px] text-muted-foreground truncate">Prestige {b.requiredPrestige || 0}</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

export default MapView;
