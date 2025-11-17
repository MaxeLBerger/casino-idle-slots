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

const SYMBOL_SETS = [
  ['🍒', '🍋', '🔔'],
  ['🍒', '🍋', '🔔', '💎', '⭐'],
  ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰'],
  ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰', '💰', '🎁'],
  ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰', '💰', '🎁', '👑', '🔥']
]

const SLOT_MACHINE_CONFIGS = [
  { name: 'Classic', rows: 1, reels: 3, prestigeCost: 0, symbols: SYMBOL_SETS[0] },
  { name: 'Deluxe', rows: 2, reels: 3, prestigeCost: 5, symbols: SYMBOL_SETS[1] },
  { name: 'Premium', rows: 3, reels: 3, prestigeCost: 10, symbols: SYMBOL_SETS[2] },
  { name: 'Mega', rows: 3, reels: 4, prestigeCost: 15, symbols: SYMBOL_SETS[3] },
  { name: 'Ultimate', rows: 4, reels: 5, prestigeCost: 20, symbols: SYMBOL_SETS[4] }
]

const SPIN_COST = 10
const STARTING_COINS = 100
const MAX_OFFLINE_HOURS = 4
const PRESTIGE_SPIN_REQUIREMENT = 100

interface GameState {
  coins: number
  totalSpins: number
  biggestWin: number
  totalEarnings: number
  spinMultiplier: number
  idleIncomePerSecond: number
  spinPowerLevel: number
  idleIncomeLevel: number
  prestigePoints: number
  currentSlotMachine: number
  unlockedSlotMachines: number[]
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
  prestigePoints: 0,
  currentSlotMachine: 0,
  unlockedSlotMachines: [0],
  lastTimestamp: Date.now(),
}

function App() {
  const [gameState, setGameState] = useKV<GameState>('casino-game-state', DEFAULT_STATE)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showOfflineEarnings, setShowOfflineEarnings] = useState(false)
  const [offlineEarnings, setOfflineEarnings] = useState(0)
  const coinParticleContainer = useRef<HTMLDivElement>(null)

  const currentMachine = SLOT_MACHINE_CONFIGS[gameState?.currentSlotMachine || 0]
  const initialReels = useMemo(() => {
    const machine = SLOT_MACHINE_CONFIGS[gameState?.currentSlotMachine || 0]
    return Array(machine.rows).fill(0).map(() => 
      Array(machine.reels).fill(0).map((_, i) => machine.symbols[i % machine.symbols.length])
    )
  }, [gameState?.currentSlotMachine])
  
  const [reels, setReels] = useState<string[][]>(initialReels)
  const [reelStates, setReelStates] = useState<boolean[][]>(
    Array(currentMachine.rows).fill(0).map(() => Array(currentMachine.reels).fill(false))
  )

  useEffect(() => {
    if (!gameState) return

    const now = Date.now()
    const elapsed = (now - gameState.lastTimestamp) / 1000
    
    if (elapsed > 60 && gameState.idleIncomePerSecond > 0) {
      const maxSeconds = MAX_OFFLINE_HOURS * 3600
      const actualElapsed = Math.min(elapsed, maxSeconds)
      const earnings = Math.floor(actualElapsed * gameState.idleIncomePerSecond)
      
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
          const earnings = Math.floor(prev.idleIncomePerSecond)
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
  }, [gameState?.idleIncomePerSecond])

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

    const machine = SLOT_MACHINE_CONFIGS[gameState.currentSlotMachine]
    setIsSpinning(true)
    
    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins - SPIN_COST,
      }
    })

    const reelStopTimes = Array(machine.reels).fill(0).map((_, i) => 1500 + (i * 500))
    const stoppedReels = Array(machine.reels).fill(false)
    const finalReels = Array(machine.rows).fill(0).map(() =>
      Array(machine.reels).fill(0).map(() => 
        machine.symbols[Math.floor(Math.random() * machine.symbols.length)]
      )
    )

    setReelStates(Array(machine.rows).fill(0).map(() => Array(machine.reels).fill(false)))

    const spinInterval = setInterval(() => {
      setReels(prev => 
        prev.map((row, rowIdx) => 
          row.map((symbol, colIdx) => 
            stoppedReels[colIdx] ? finalReels[rowIdx][colIdx] : 
            machine.symbols[Math.floor(Math.random() * machine.symbols.length)]
          )
        )
      )
    }, 100)

    for (let i = 0; i < machine.reels; i++) {
      await new Promise(resolve => setTimeout(resolve, reelStopTimes[i] - (i > 0 ? reelStopTimes[i - 1] : 0)))
      stoppedReels[i] = true
      setReelStates(prev => 
        prev.map(row => row.map((val, idx) => idx === i ? true : val))
      )
      setReels(prev => 
        prev.map((row, rowIdx) => row.map((symbol, colIdx) => colIdx === i ? finalReels[rowIdx][colIdx] : symbol))
      )
    }

    clearInterval(spinInterval)
    setReels(finalReels)

    let winAmount = 0
    let hasWin = false

    for (let row = 0; row < machine.rows; row++) {
      const rowSymbols = finalReels[row]
      const allMatch = rowSymbols.every(s => s === rowSymbols[0])
      
      if (allMatch) {
        hasWin = true
        const symbolMultiplier = 
          rowSymbols[0] === '💎' ? 100 :
          rowSymbols[0] === '⭐' ? 50 :
          rowSymbols[0] === '👑' ? 150 :
          rowSymbols[0] === '🔥' ? 200 :
          20
        winAmount += Math.floor(symbolMultiplier * gameState.spinMultiplier * machine.reels)
      } else {
        const uniqueSymbols = new Set(rowSymbols)
        if (uniqueSymbols.size === rowSymbols.length - 1) {
          winAmount += Math.floor(5 * gameState.spinMultiplier)
        }
      }
    }

    if (hasWin) {
      createCoinParticles(winAmount)
      toast.success(`🎰 WIN! +${winAmount} coins!`, {
        duration: 3000,
      })
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

  const unlockSlotMachine = (machineIndex: number) => {
    if (!gameState || !gameState.unlockedSlotMachines) return
    
    const machine = SLOT_MACHINE_CONFIGS[machineIndex]
    if (gameState.prestigePoints < machine.prestigeCost) {
      toast.error(`Need ${machine.prestigeCost} prestige points!`)
      return
    }

    if (gameState.unlockedSlotMachines.includes(machineIndex)) {
      toast.error('Already unlocked!')
      return
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        prestigePoints: prev.prestigePoints - machine.prestigeCost,
        unlockedSlotMachines: [...prev.unlockedSlotMachines, machineIndex],
      }
    })

    toast.success(`${machine.name} Slot Machine unlocked!`)
  }

  const switchSlotMachine = (machineIndex: number) => {
    if (!gameState || !gameState.unlockedSlotMachines) return
    
    if (!gameState.unlockedSlotMachines.includes(machineIndex)) {
      toast.error('Slot machine not unlocked!')
      return
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        currentSlotMachine: machineIndex,
      }
    })

    const machine = SLOT_MACHINE_CONFIGS[machineIndex]
    const newReels = Array(machine.rows).fill(0).map(() => 
      Array(machine.reels).fill(0).map((_, i) => machine.symbols[i % machine.symbols.length])
    )
    setReels(newReels)
    setReelStates(Array(machine.rows).fill(0).map(() => Array(machine.reels).fill(false)))

    toast.success(`Switched to ${machine.name}!`)
  }

  const prestige = () => {
    if (!gameState || gameState.totalSpins < PRESTIGE_SPIN_REQUIREMENT) {
      toast.error(`Need at least ${PRESTIGE_SPIN_REQUIREMENT} total spins to prestige!`)
      return
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      const newPrestigePoints = prev.prestigePoints + 1
      return {
        ...DEFAULT_STATE,
        prestigePoints: newPrestigePoints,
        currentSlotMachine: 0,
        unlockedSlotMachines: [0],
        lastTimestamp: Date.now(),
      }
    })

    const machine = SLOT_MACHINE_CONFIGS[0]
    const newReels = Array(machine.rows).fill(0).map(() => 
      Array(machine.reels).fill(0).map((_, i) => machine.symbols[i % machine.symbols.length])
    )
    setReels(newReels)
    setReelStates(Array(machine.rows).fill(0).map(() => Array(machine.reels).fill(false)))

    toast.success('🌟 Prestige! +1 Prestige Point!')
  }

  if (!gameState) return null

  const spinPowerCost = calculateUpgradeCost(gameState.spinPowerLevel, 50)
  const idleIncomeCost = calculateUpgradeCost(gameState.idleIncomeLevel, 100)
  const canPrestige = gameState.totalSpins >= PRESTIGE_SPIN_REQUIREMENT

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
          <div className="flex items-center justify-center gap-4 mt-2">
            {gameState.prestigePoints > 0 && (
              <Badge className="bg-accent text-accent-foreground">
                <Trophy size={16} weight="fill" className="mr-1" />
                {gameState.prestigePoints} Prestige Points
              </Badge>
            )}
            <Badge className="bg-secondary text-secondary-foreground">
              <Sparkle size={16} weight="fill" className="mr-1" />
              {currentMachine.name} ({currentMachine.rows}x{currentMachine.reels})
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-secondary/30 border-2 border-primary/20 shadow-xl shadow-primary/10 relative overflow-hidden">
              <div ref={coinParticleContainer} className="absolute inset-0 pointer-events-none" />
              
              <div className="flex flex-col gap-2 mb-8">
                {reels.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-2 md:gap-4">
                    {row.map((symbol, colIndex) => (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        animate={
                          reelStates[rowIndex][colIndex] 
                            ? { 
                                scale: 1,
                                y: 0,
                              }
                            : { 
                                scale: 0.95,
                                y: [0, -10, 0],
                              }
                        }
                        transition={
                          reelStates[rowIndex][colIndex]
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
                        className={`bg-muted rounded-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center border-4 shadow-lg relative overflow-hidden ${
                          reelStates[rowIndex][colIndex] && isSpinning
                            ? 'border-primary glow-pulse'
                            : 'border-primary/30'
                        }`}
                      >
                        <motion.span 
                          className="text-3xl md:text-5xl relative z-10"
                          animate={reelStates[rowIndex][colIndex] && isSpinning ? {
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
                    {gameState.idleIncomePerSecond.toFixed(1)}
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
                        {gameState.idleIncomePerSecond.toFixed(1)}/s
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
                  Reset progress for +1 Prestige Point
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
                      Prestige ({PRESTIGE_SPIN_REQUIREMENT} spins)
                    </>
                  ) : (
                    <>
                      <Lock size={20} className="mr-2" />
                      Locked ({gameState.totalSpins}/{PRESTIGE_SPIN_REQUIREMENT} spins)
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border">
              <div className="flex items-center gap-2 mb-4">
                <Sparkle size={24} weight="fill" className="text-primary" />
                <h2 className="text-2xl font-bold">Slot Machines</h2>
              </div>
              <div className="space-y-3">
                {SLOT_MACHINE_CONFIGS.map((machine, index) => {
                  const isUnlocked = gameState?.unlockedSlotMachines?.includes(index) ?? false
                  const isCurrent = gameState?.currentSlotMachine === index
                  const canAfford = (gameState?.prestigePoints ?? 0) >= machine.prestigeCost
                  
                  return (
                    <Card key={index} className={`p-4 ${isCurrent ? 'border-primary border-2' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{machine.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {machine.rows}x{machine.reels} • {machine.symbols.length} symbols
                          </p>
                        </div>
                        {isCurrent && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {machine.symbols.slice(0, 8).map((symbol, i) => (
                          <span key={i} className="text-xl">{symbol}</span>
                        ))}
                        {machine.symbols.length > 8 && <span className="text-muted-foreground">...</span>}
                      </div>
                      {isUnlocked ? (
                        <Button
                          size="sm"
                          onClick={() => switchSlotMachine(index)}
                          disabled={isCurrent}
                          className="w-full"
                          variant={isCurrent ? "secondary" : "default"}
                        >
                          {isCurrent ? 'Active' : 'Switch'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => unlockSlotMachine(index)}
                          disabled={!canAfford}
                          className="w-full"
                          variant="outline"
                        >
                          <Lock size={16} className="mr-2" />
                          Unlock ({machine.prestigeCost} PP)
                        </Button>
                      )}
                    </Card>
                  )
                })}
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