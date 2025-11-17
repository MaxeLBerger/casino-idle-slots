import { useEffect, useState, useRef, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, ArrowUp, Lightning, Trophy, Gauge, Sparkle, Lock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰']
const SPIN_COST = 10
const STARTING_COINS = 100
const MAX_OFFLINE_HOURS = 4

interface GameState {
  coins: number
  totalSpins: number
  biggestWin: number
  totalEarnings: number
  spinMultiplier: number
  idleIncomePerSecond: number
  spinPowerLevel: number
  idleIncomeLevel: number
  prestigeLevel: number
  prestigeMultiplier: number
  lastTimestamp: number
}

const DEFAULT_STATE: GameState = {
  coins: STARTING_COINS,
  totalSpins: 0,
  biggestWin: 0,
  totalEarnings: 0,
  spinMultiplier: 1,
  idleIncomePerSecond: 0,
  spinPowerLevel: 0,
  idleIncomeLevel: 0,
  prestigeLevel: 0,
  prestigeMultiplier: 1,
  lastTimestamp: Date.now(),
}

function App() {
  const [gameState, setGameState] = useKV<GameState>('casino-game-state', DEFAULT_STATE)
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState<string[]>([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
  const [reelStates, setReelStates] = useState<boolean[]>([false, false, false])
  const [showOfflineEarnings, setShowOfflineEarnings] = useState(false)
  const [offlineEarnings, setOfflineEarnings] = useState(0)
  const coinParticleContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gameState) return

    const now = Date.now()
    const elapsed = (now - gameState.lastTimestamp) / 1000
    
    if (elapsed > 60 && gameState.idleIncomePerSecond > 0) {
      const maxSeconds = MAX_OFFLINE_HOURS * 3600
      const actualElapsed = Math.min(elapsed, maxSeconds)
      const earnings = Math.floor(actualElapsed * gameState.idleIncomePerSecond * gameState.prestigeMultiplier)
      
      if (earnings > 0) {
        setOfflineEarnings(earnings)
        setShowOfflineEarnings(true)
        setGameState(prev => {
          if (!prev) return DEFAULT_STATE
          return {
            ...prev,
            coins: prev.coins + earnings,
            totalEarnings: prev.totalEarnings + earnings,
            lastTimestamp: now,
          }
        })
      }
    }

    const interval = setInterval(() => {
      if (gameState.idleIncomePerSecond > 0) {
        setGameState(prev => {
          if (!prev) return DEFAULT_STATE
          const earnings = Math.floor(prev.idleIncomePerSecond * prev.prestigeMultiplier)
          return {
            ...prev,
            coins: prev.coins + earnings,
            totalEarnings: prev.totalEarnings + earnings,
            lastTimestamp: Date.now(),
          }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState?.idleIncomePerSecond, gameState?.prestigeMultiplier])

  const createCoinParticles = (amount: number) => {
    if (!coinParticleContainer.current) return
    
    const container = coinParticleContainer.current
    const particleCount = Math.min(Math.floor(amount / 10) + 1, 15)
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'coin-particle float-animation'
      particle.textContent = '💰'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = '50%'
      container.appendChild(particle)
      
      setTimeout(() => particle.remove(), 1500)
    }
  }

  const spin = async () => {
    if (!gameState || isSpinning || gameState.coins < SPIN_COST) {
      if (gameState && gameState.coins < SPIN_COST) {
        toast.error('Not enough coins to spin!')
      }
      return
    }

    setIsSpinning(true)
    
    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins - SPIN_COST,
      }
    })

    const reelStopTimes = [1500, 2000, 2500]
    const blurInterval = 50
    const stoppedReels = [false, false, false]
    const finalReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ]

    setReelStates([false, false, false])

    const blurTimer = setInterval(() => {
      setReels(prev => prev.map((symbol, index) => 
        stoppedReels[index] ? symbol : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ))
    }, blurInterval)

    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, reelStopTimes[i] - (i > 0 ? reelStopTimes[i - 1] : 0)))
      stoppedReels[i] = true
      setReelStates(prev => prev.map((val, idx) => idx === i ? true : val))
      setReels(prev => prev.map((symbol, index) => index === i ? finalReels[i] : symbol))
    }

    clearInterval(blurTimer)
    setReels(finalReels)

    let winAmount = 0
    const allMatch = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]
    const twoMatch = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]

    if (allMatch) {
      const symbolMultiplier = finalReels[0] === '💎' ? 100 : finalReels[0] === '⭐' ? 50 : 20
      winAmount = Math.floor(symbolMultiplier * gameState.spinMultiplier * gameState.prestigeMultiplier)
      createCoinParticles(winAmount)
      toast.success(`🎰 JACKPOT! +${winAmount} coins!`, {
        duration: 3000,
      })
    } else if (twoMatch) {
      winAmount = Math.floor(5 * gameState.spinMultiplier * gameState.prestigeMultiplier)
      toast.success(`🎉 Match! +${winAmount} coins!`)
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins + winAmount,
        totalSpins: prev.totalSpins + 1,
        biggestWin: Math.max(prev.biggestWin, winAmount),
        totalEarnings: prev.totalEarnings + winAmount,
      }
    })

    setIsSpinning(false)
  }

  const calculateUpgradeCost = (level: number, base: number = 50) => {
    return Math.floor(base * Math.pow(1.5, level))
  }

  const upgradeSpinPower = () => {
    if (!gameState) return
    
    const cost = calculateUpgradeCost(gameState.spinPowerLevel, 50)
    if (gameState.coins < cost) {
      toast.error('Not enough coins!')
      return
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins - cost,
        spinPowerLevel: prev.spinPowerLevel + 1,
        spinMultiplier: prev.spinMultiplier + 0.5,
      }
    })

    toast.success('Spin Power upgraded!')
  }

  const upgradeIdleIncome = () => {
    if (!gameState) return
    
    const cost = calculateUpgradeCost(gameState.idleIncomeLevel, 100)
    if (gameState.coins < cost) {
      toast.error('Not enough coins!')
      return
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins - cost,
        idleIncomeLevel: prev.idleIncomeLevel + 1,
        idleIncomePerSecond: prev.idleIncomePerSecond + 1,
      }
    })

    toast.success('Idle Income upgraded!')
  }

  const prestige = () => {
    if (!gameState || gameState.totalSpins < 100) {
      toast.error('Need at least 100 total spins to prestige!')
      return
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...DEFAULT_STATE,
        prestigeLevel: prev.prestigeLevel + 1,
        prestigeMultiplier: prev.prestigeMultiplier + 0.25,
        lastTimestamp: Date.now(),
      }
    })

    toast.success('🌟 Prestige! +25% permanent multiplier!')
  }

  if (!gameState) return null

  const spinPowerCost = calculateUpgradeCost(gameState.spinPowerLevel, 50)
  const idleIncomeCost = calculateUpgradeCost(gameState.idleIncomeLevel, 100)
  const canPrestige = gameState.totalSpins >= 100

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight mb-2">
            🎰 CASINO IDLE SLOTS
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold orbitron">
            <Coins size={32} weight="fill" className="text-primary" />
            <motion.span
              key={gameState.coins}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="tabular-nums"
            >
              {gameState.coins.toLocaleString()}
            </motion.span>
          </div>
          {gameState.prestigeLevel > 0 && (
            <Badge className="mt-2 bg-accent text-accent-foreground">
              <Sparkle size={16} weight="fill" className="mr-1" />
              Prestige Level {gameState.prestigeLevel} ({(gameState.prestigeMultiplier * 100).toFixed(0)}% Multiplier)
            </Badge>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-secondary/30 border-2 border-primary/20 shadow-xl shadow-primary/10 relative overflow-hidden">
              <div ref={coinParticleContainer} className="absolute inset-0 pointer-events-none" />
              
              <div className="flex justify-center gap-4 md:gap-8 mb-8">
                {reels.map((symbol, index) => (
                  <motion.div
                    key={index}
                    animate={
                      reelStates[index] 
                        ? { 
                            filter: 'blur(0px)', 
                            scale: 1,
                            y: 0,
                          }
                        : { 
                            filter: 'blur(8px)', 
                            scale: 0.95,
                            y: [0, -10, 0],
                          }
                    }
                    transition={
                      reelStates[index]
                        ? { 
                            duration: 0.4,
                            ease: [0.34, 1.56, 0.64, 1],
                          }
                        : {
                            duration: 0.1,
                            y: {
                              duration: 0.3,
                              repeat: Infinity,
                              ease: 'linear'
                            }
                          }
                    }
                    className={`bg-muted rounded-xl w-24 h-24 md:w-32 md:h-32 flex items-center justify-center border-4 shadow-lg relative overflow-hidden ${
                      reelStates[index] && isSpinning
                        ? 'border-primary glow-pulse'
                        : 'border-primary/30'
                    }`}
                  >
                    {!reelStates[index] && isSpinning && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent"
                        animate={{ y: ['100%', '-100%'] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                    )}
                    <motion.span 
                      className="slot-symbol relative z-10"
                      animate={reelStates[index] && isSpinning ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 5, 0]
                      } : {}}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      {symbol}
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={spin}
                disabled={isSpinning || gameState.coins < SPIN_COST}
                className="w-full py-6 md:py-8 text-xl md:text-2xl font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-50"
              >
                {isSpinning ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⚡
                  </motion.span>
                ) : (
                  <>
                    <Sparkle size={24} weight="fill" className="mr-2" />
                    SPIN ({SPIN_COST} coins)
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-6 bg-card/50 border-border">
              <div className="flex items-center gap-2 mb-4">
                <Gauge size={24} weight="fill" className="text-accent" />
                <h2 className="text-2xl font-bold">Statistics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-primary tabular-nums">
                    {gameState.totalSpins}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-primary tabular-nums">
                    {gameState.biggestWin}
                  </div>
                  <div className="text-sm text-muted-foreground">Biggest Win</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-primary tabular-nums">
                    {gameState.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-accent tabular-nums">
                    {(gameState.idleIncomePerSecond * gameState.prestigeMultiplier).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Coins/Second</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card/50 border-border">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUp size={24} weight="fill" className="text-accent" />
                <h2 className="text-2xl font-bold">Upgrades</h2>
              </div>

              <Tabs defaultValue="spin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="spin">Spin Power</TabsTrigger>
                  <TabsTrigger value="idle">Idle Income</TabsTrigger>
                </TabsList>

                <TabsContent value="spin" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Level {gameState.spinPowerLevel}</span>
                      <Badge variant="secondary">{gameState.spinMultiplier}x Multiplier</Badge>
                    </div>
                    <Progress value={(gameState.spinPowerLevel % 10) * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Increases winnings from spins by 0.5x
                    </p>
                    <Button
                      onClick={upgradeSpinPower}
                      disabled={gameState.coins < spinPowerCost}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Coins size={20} className="mr-2" />
                      Upgrade ({spinPowerCost.toLocaleString()})
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="idle" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Level {gameState.idleIncomeLevel}</span>
                      <Badge variant="secondary">
                        <Lightning size={16} weight="fill" className="mr-1" />
                        {(gameState.idleIncomePerSecond * gameState.prestigeMultiplier).toFixed(1)}/s
                      </Badge>
                    </div>
                    <Progress value={(gameState.idleIncomeLevel % 10) * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Earn coins passively, even when offline
                    </p>
                    <Button
                      onClick={upgradeIdleIncome}
                      disabled={gameState.coins < idleIncomeCost}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Coins size={20} className="mr-2" />
                      Upgrade ({idleIncomeCost.toLocaleString()})
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={20} weight="fill" className="text-primary" />
                  <h3 className="font-bold">Prestige</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reset progress for +25% permanent multiplier
                </p>
                <Button
                  onClick={prestige}
                  disabled={!canPrestige}
                  variant="destructive"
                  className="w-full"
                >
                  {canPrestige ? (
                    <>
                      <Sparkle size={20} weight="fill" className="mr-2" />
                      Prestige (100 spins)
                    </>
                  ) : (
                    <>
                      <Lock size={20} className="mr-2" />
                      Locked ({gameState.totalSpins}/100 spins)
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showOfflineEarnings} onOpenChange={setShowOfflineEarnings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Coins size={32} weight="fill" className="text-primary" />
              Welcome Back!
            </DialogTitle>
            <DialogDescription className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="text-5xl font-bold orbitron text-primary mb-4"
              >
                +{offlineEarnings.toLocaleString()}
              </motion.div>
              <p className="text-lg">
                You earned coins while you were away!
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowOfflineEarnings(false)} className="w-full">
            Collect Earnings
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App