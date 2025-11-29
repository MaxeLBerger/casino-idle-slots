import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { GameProvider, useGame } from './contexts/GameContext'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'
import { MainLayout } from './components/layout/MainLayout'
import { ScreenRouter } from './components/layout/ScreenRouter'
import { Card } from './components/ui/card'
import { Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

function AppShell() {
  const { gameState, isLoading } = useGame()
  const { currentScreen, navigateTo } = useNavigation()

  useEffect(() => {
    if (!isLoading && gameState && currentScreen === 'LOADING') {
      navigateTo('CITY_MAP')
    }
  }, [isLoading, gameState, currentScreen, navigateTo])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkle size={48} weight="fill" className="text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold orbitron mb-2">Loading Casino...</h2>
          <p className="text-muted-foreground">Initializing game...</p>
        </Card>
      </div>
    )
  }

  if (!gameState) {
    return null
  }

  return (
    <MainLayout>
      <ScreenRouter />
    </MainLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <NavigationProvider>
          <AppShell />
        </NavigationProvider>
      </GameProvider>
    </AuthProvider>
  )
}

export default App