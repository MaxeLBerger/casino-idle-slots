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
  | 'SETTINGS';

export interface NavigationState {
  currentScreen: GameScreen;
  previousScreen: GameScreen | null;
  params?: Record<string, any>;
}

export interface NavigationContextType extends NavigationState {
  navigateTo: (screen: GameScreen, params?: Record<string, any>) => void;
  goBack: () => void;
}
