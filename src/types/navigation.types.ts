export type GameScreen = 
  | 'LOADING'
  | 'CITY_MAP'
  | 'SLOT_MACHINE'
  | 'WORKERS_HQ'
  | 'UPGRADES_LAB'
  | 'PRESTIGE_LOUNGE'
  | 'MAIN_SHOP'
  | 'AVATAR_WARDROBE'
  | 'SOCIAL_HUB'
  | 'SETTINGS'
  | 'ACHIEVEMENTS'
  | 'STATISTICS';

export interface NavigationParams {
  slotMachineIndex?: number;
  workerId?: string;
  shopTab?: 'diamonds' | 'coins' | 'special';
  [key: string]: any;
}

export interface NavigationEntry {
  screen: GameScreen;
  params?: NavigationParams;
}

export interface NavigationState {
  currentScreen: GameScreen;
  history: NavigationEntry[];
  params?: NavigationParams;
}

export interface NavigationContextType extends NavigationState {
  navigateTo: (screen: GameScreen, params?: NavigationParams) => void;
  goBack: () => void;
}
