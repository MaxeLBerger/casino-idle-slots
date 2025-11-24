import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameScreen, NavigationContextType } from '../types/navigation.types';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('LOADING');
  const [previousScreen, setPreviousScreen] = useState<GameScreen | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(undefined);

  const navigateTo = (screen: GameScreen, newParams?: Record<string, any>) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    setParams(newParams);
  };

  const goBack = () => {
    if (previousScreen) {
      const temp = currentScreen;
      setCurrentScreen(previousScreen);
      setPreviousScreen(null); // Or handle history stack if needed
      // Optional: setPreviousScreen(temp) if we want forward navigation? No.
    } else {
      // Default fallback if no history
      setCurrentScreen('CITY_MAP');
    }
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, previousScreen, params, navigateTo, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
