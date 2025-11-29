import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { GameScreen, NavigationContextType, NavigationEntry, NavigationParams } from '../types/navigation.types';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('LOADING');
  const [history, setHistory] = useState<NavigationEntry[]>([]);
  const [params, setParams] = useState<NavigationParams | undefined>(undefined);

  const navigateTo = useCallback((screen: GameScreen, newParams?: NavigationParams) => {
    setHistory((prev) => [...prev, { screen: currentScreen, params }]);
    setCurrentScreen(screen);
    setParams(newParams);
  }, [currentScreen, params]);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) {
        // If no history, default to CITY_MAP if not already there
        if (currentScreen !== 'CITY_MAP') {
          setCurrentScreen('CITY_MAP');
          setParams(undefined);
        }
        return prev;
      }

      const newHistory = [...prev];
      const previousEntry = newHistory.pop();
      
      if (previousEntry) {
        setCurrentScreen(previousEntry.screen);
        setParams(previousEntry.params);
      }
      
      return newHistory;
    });
  }, [currentScreen]);

  return (
    <NavigationContext.Provider value={{ currentScreen, history, params, navigateTo, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
