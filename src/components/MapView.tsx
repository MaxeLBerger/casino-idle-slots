import { useMemo } from 'react';
import { MAP_BUILDINGS, MAP_CONFIG } from '@/constants/map.constants';
import { GameState } from '@/types/game.types';
import { SlotMachineConfig } from '@/types/slot.types';
import { Lock } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CURRENCY_ICON_ASSETS } from '@/constants/economy.constants';
import { AssetImage } from '@/components/ui/asset-image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber, getAssetPath } from '@/lib/utils';

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

export function MapView({ gameState, onSelectCasino, onClose }: MapViewProps) {
	const buildings = useMemo(() => MAP_BUILDINGS, []);
	const eventTokenIcon = CURRENCY_ICON_ASSETS.eventTokenDragonJade;

	const handleBuildingClick = (b: typeof MAP_BUILDINGS[number]) => {
		const locked = isBuildingLocked(b, gameState);
		if (locked) {
			return;
		}
		if (b.type === 'casino' && typeof b.slotMachineIndex === 'number') {
			onSelectCasino(b.slotMachineIndex);
		} else {
			// Non-casino facilities don't trigger toasts anymore; future inline panel can go here.
		}
	};

	return (
		<div className="relative w-full h-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[600px] rounded-xl overflow-hidden border border-primary/20 shadow-2xl bg-black/60">
			{/* Background */}
			<AssetImage 
				src={MAP_CONFIG.backgroundAsset}
				alt="Map Background" 
				className="absolute inset-0 w-full h-full object-cover opacity-40" 
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background/80" />

			{/* Header */}
			<div className="absolute top-0 left-0 right-0 p-2 sm:p-4 flex items-center justify-between z-20">
				<h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-wide">Casino City Map</h2>
				{onClose && (
					<Button size="sm" variant="secondary" onClick={onClose} className="text-xs sm:text-sm">Close</Button>
				)}
			</div>

			{/* Buildings Layer - Scrollable on mobile */}
			<div className="absolute inset-0 pt-12 pb-28 sm:pb-36 overflow-auto">
				<div className="relative w-full h-full min-h-[400px] sm:min-h-[500px]">
					<TooltipProvider>
						{buildings.map(b => {
							const locked = isBuildingLocked(b, gameState);
							const isActive = b.type === 'casino' && gameState?.currentSlotMachine === b.slotMachineIndex;
							
							// Adjust scale for mobile - smaller buildings
							const mobileScale = (b.scale || 1) * 0.7;
							const desktopScale = b.scale || 1;
							
							return (
								<Tooltip key={b.id}>
									<TooltipTrigger asChild>
										<button
											onClick={() => handleBuildingClick(b)}
											style={{
												position: 'absolute',
												left: `${b.position.x}%`,
												top: `${b.position.y}%`,
												transform: `translate(-50%, -50%)`,
											}}
											className={`group cursor-pointer transition-all duration-300 relative flex flex-col items-center hover:scale-105 active:scale-95 ${
												locked ? 'opacity-50 grayscale' : 'opacity-100'
											} ${isActive ? 'ring-2 sm:ring-4 ring-primary rounded-xl z-10' : ''}`}
										>
											<div 
												className="relative flex items-center justify-center"
												style={{
													width: `${64 * mobileScale}px`,
													height: `${48 * mobileScale}px`,
												}}
											>
												{/* Use CSS for responsive sizing */}
												<AssetImage
													src={b.assetName}
													alt={b.name}
													className="w-16 h-12 sm:w-24 sm:h-16 md:w-32 md:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
													style={{
														transform: `scale(${mobileScale})`,
													}}
													loading="lazy"
												/>
												{locked && (
													<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
														<Lock size={20} className="text-primary sm:w-6 sm:h-6 md:w-8 md:h-8" weight="bold" />
													</div>
												)}
												{isActive && !locked && (
													<div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-xs bg-primary text-primary-foreground rounded shadow font-semibold whitespace-nowrap">
														Active
													</div>
												)}
											</div>
											<div className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] md:text-xs font-medium tracking-wide text-center w-16 sm:w-24 md:w-32 pointer-events-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-1">
												{b.name}
											</div>
										</button>
									</TooltipTrigger>
									<TooltipContent side="top" className="max-w-[200px]">
										<div className="text-center">
											<p className="font-bold text-sm">{b.name}</p>
											<p className="text-xs text-muted-foreground">{b.description}</p>
											{locked ? (
												<div className="text-xs text-red-400 mt-1">
													{b.requiredPrestige ? `Requires ${formatNumber(b.requiredPrestige)} Prestige` : ''}
													{b.requiredLevel ? `Requires Level ${b.requiredLevel}` : ''}
												</div>
											) : (
												<div className="text-xs text-green-400 mt-1">✓ Unlocked - Tap to enter</div>
											)}
										</div>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</TooltipProvider>
				</div>
			</div>

			{/* Legend / Info - Fixed at bottom */}
			<div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 bg-background/80 backdrop-blur-sm border-t border-primary/10">
				<div className="flex flex-wrap gap-1.5 sm:gap-2 text-[9px] sm:text-[11px] md:text-xs text-muted-foreground">
					<span className="inline-flex items-center gap-1">
						<span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full" /> 
						Active
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full" /> 
						Locked
					</span>
					<span className="hidden sm:inline">Tap building to enter</span>
					{eventTokenIcon && (
						<span className="inline-flex items-center gap-1">
							<AssetImage
								src={eventTokenIcon}
								alt="Event Token"
								className="w-3 h-3 sm:w-4 sm:h-4 object-contain icon-blend"
								loading="lazy"
							/>
							<span className="hidden md:inline">Event Plaza rewards Event Tokens</span>
						</span>
					)}
				</div>
				{/* Casino cards grid - responsive */}
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-2">
					{buildings.filter(b => b.type === 'casino').map(b => {
						const locked = isBuildingLocked(b, gameState);
						return (
							<Card 
								key={`legend-${b.id}`} 
								className={`p-1 sm:p-1.5 md:p-2 flex flex-col gap-0.5 cursor-pointer transition-all hover:bg-primary/10 ${
									gameState?.currentSlotMachine === b.slotMachineIndex ? 'border-primary bg-primary/5' : ''
								} ${locked ? 'opacity-50' : ''}`}
								onClick={() => !locked && b.slotMachineIndex !== undefined && onSelectCasino(b.slotMachineIndex)}
							>
								<div className="text-[8px] sm:text-[10px] md:text-xs font-semibold truncate flex items-center gap-1">
									{locked && <Lock size={10} className="flex-shrink-0" />}
									<span className="truncate">{b.name}</span>
								</div>
								<div className="text-[7px] sm:text-[9px] md:text-[10px] text-muted-foreground truncate">
									P{b.requiredPrestige || 0}
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default MapView;
