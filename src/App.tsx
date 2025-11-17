import { useEffect, useState, useRef, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, ArrowUp, Lightning, Trophy, Gauge, Sparkle, Lock, Calendar, Medal, CloudArrowUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Confetti, WinBanner } from '@/components/Confetti'
import { UserProfile } from '@/components/UserProfile'
import { Achievements, AchievementNotification } from '@/components/Achievements'
import { DailyChallenges, DailyChallengeCard } from '@/components/DailyChallenges'
import { Leaderboard, LeaderboardButton } from '@/components/Leaderboard'
import { 
  playSpinSound, 
  playReelStopSound, 
  playSmallWinSound, 
  playBigWinSound, 
  playMegaWinSound, 
  playUpgradeSound,
  playPrestigeSound,
  playJackpotSound
} from '@/lib/sounds'
import { generateDailyChallenge, playAchievementSound, ACHIEVEMENTS, Achievement } from '@/lib/achievements'
import { useUserLinkedKV, getCurrentUser, migrateLocalDataToUser, type UserInfo } from '@/lib/persistence'
import { submitScore, getPlayerRank } from '@/lib/leaderboard'

const SYMBOL_SETS = [
  ['🍒', '🍋', '🔔'],
  ['🍒', '🍋', '🔔', '💎', '⭐'],
  ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰'],
  ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰', '💰', '🎁'],
  ['🍒', '🍋', '🔔', '💎', '⭐', '🍀', '🎰', '💰', '🎁', '👑', '🔥']
]

const JACKPOT_SYMBOLS = ['💰', '💎', '👑', '⭐', '🔥']
const ULTRA_JACKPOT_SYMBOLS = ['🌟', '💫', '✨']
const JACKPOT_CHANCE = 0.03
const ULTRA_JACKPOT_CHANCE = 0.005

const SLOT_MACHINE_CONFIGS = [
  { name: 'Classic', rows: 1, reels: 3, prestigeCost: 0, symbols: SYMBOL_SETS[0] },
  { name: 'Deluxe', rows: 2, reels: 3, prestigeCost: 5, symbols: SYMBOL_SETS[1] },
  { name: 'Premium', rows: 3, reels: 3, prestigeCost: 10, symbols: SYMBOL_SETS[2] },
  { name: 'Mega', rows: 3, reels: 4, prestigeCost: 15, symbols: SYMBOL_SETS[3] },
  { name: 'Ultimate', rows: 4, reels: 5, prestigeCost: 20, symbols: SYMBOL_SETS[4] }
]

const SPIN_COST = 10
const STARTING_COINS = 200
const MAX_OFFLINE_HOURS = 4
const PRESTIGE_EARNINGS_REQUIREMENT = 10000

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
  level: number
  experience: number
  totalWins: number
  winStreak: number
  maxWinStreak: number
  totalUpgrades: number
  unlockedAchievements: string[]
  achievementProgress: Record<string, number>
  dailyChallengeDate: string
  dailyChallengeProgress: number
  dailyChallengeCompleted: boolean
  lastLoginDate: string
  loginStreak: number
}

const DEFAULT_STATE: GameState = {
  coins: STARTING_COINS,
  totalSpins: 0,
  biggestWin: 0,
  totalEarnings: 0,
  spinMultiplier: 1,
  idleIncomePerSecond: 1,
  spinPowerLevel: 0,
  idleIncomeLevel: 1,
  prestigePoints: 0,
  currentSlotMachine: 0,
  unlockedSlotMachines: [0],
  lastTimestamp: Date.now(),
  level: 1,
  experience: 0,
  totalWins: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalUpgrades: 0,
  unlockedAchievements: [],
  achievementProgress: {},
  dailyChallengeDate: '',
  dailyChallengeProgress: 0,
  dailyChallengeCompleted: false,
  lastLoginDate: '',
  loginStreak: 0,
}

function App() {
  const [gameState, setGameState, , isLoadingGameState, gameStateUserId, saveGameStateImmediately, lastSaveTime] = useUserLinkedKV<GameState>('casino-game-state', DEFAULT_STATE)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [showDataMigrationDialog, setShowDataMigrationDialog] = useState(false)
  const [hasMigratedData, setHasMigratedData] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now())
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showOfflineEarnings, setShowOfflineEarnings] = useState(false)
  const [offlineEarnings, setOfflineEarnings] = useState(0)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const coinParticleContainer = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiIntensity, setConfettiIntensity] = useState<'low' | 'medium' | 'high' | 'mega' | 'jackpot' | 'ultra'>('medium')
  const [showWinBanner, setShowWinBanner] = useState(false)
  const [winBannerAmount, setWinBannerAmount] = useState(0)
  const [winBannerType, setWinBannerType] = useState<'small' | 'big' | 'mega' | 'jackpot' | 'ultra'>('small')
  const [showAchievements, setShowAchievements] = useState(false)
  const [showDailyChallenge, setShowDailyChallenge] = useState(false)
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [topRank, setTopRank] = useState<number | null>(null)
  const [lastSpinProfit, setLastSpinProfit] = useState<number | null>(null)
  const [showProfitLabel, setShowProfitLabel] = useState(false)
  const [coinChange, setCoinChange] = useState<{amount: number, isPositive: boolean} | null>(null)
  const prevCoinsRef = useRef<number>(STARTING_COINS)

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

  const getTodayString = () => new Date().toISOString().split('T')[0]
  const dailyChallenge = useMemo(() => generateDailyChallenge(getTodayString()), [])

  const hasInitializedUser = useRef(false)

  useEffect(() => {
    let mounted = true

    const initializeUser = async () => {
      if (hasInitializedUser.current) return
      hasInitializedUser.current = true
      
      try {
        const user = await getCurrentUser()
        if (mounted) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('[App] Error initializing user:', error)
        if (mounted) {
          setCurrentUser(null)
        }
      }
    }

    initializeUser()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoadingGameState) {
        setLoadingTimeout(true)
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [isLoadingGameState])

  useEffect(() => {
    if (!isLoadingGameState && gameState) {
      // Game state loaded successfully
    }
  }, [isLoadingGameState, gameState, gameStateUserId, currentUser])

  useEffect(() => {
    const currentCoins = gameState?.coins || 0
    if (currentCoins !== prevCoinsRef.current) {
      const change = currentCoins - prevCoinsRef.current
      if (Math.abs(change) >= 1 && prevCoinsRef.current > 0) {
        setCoinChange({ amount: Math.abs(change), isPositive: change > 0 })
        setTimeout(() => setCoinChange(null), 2000)
      }
      prevCoinsRef.current = currentCoins
    }
  }, [gameState?.coins])

  useEffect(() => {
    if (isLoadingGameState) return

    const checkDataMigration = async () => {
      if (currentUser && !hasMigratedData && gameStateUserId) {
        const migrated = await migrateLocalDataToUser('casino-game-state', currentUser.id.toString())
        if (migrated) {
          setShowDataMigrationDialog(true)
          setHasMigratedData(true)
          toast.success('Your progress has been linked to your GitHub account!')
        }
      }
    }

    checkDataMigration()
  }, [currentUser, isLoadingGameState, hasMigratedData, gameStateUserId])

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (currentUser && gameState) {
        setLastSyncTime(Date.now())
      }
    }, 60000)

    return () => clearInterval(syncInterval)
  }, [currentUser, gameState])

  useEffect(() => {
    if (!currentUser || !gameState || isLoadingGameState) return
    
    const updateLeaderboards = async () => {
      try {
        await Promise.all([
          submitScore('coins', gameState.coins, gameState.level),
          submitScore('totalSpins', gameState.totalSpins, gameState.level),
          submitScore('biggestWin', gameState.biggestWin, gameState.level),
          submitScore('totalEarnings', gameState.totalEarnings, gameState.level),
          submitScore('level', gameState.level, gameState.level),
          submitScore('prestigePoints', gameState.prestigePoints, gameState.level)
        ])
        
        const ranks = await Promise.all([
          getPlayerRank('coins', currentUser.id.toString()),
          getPlayerRank('totalSpins', currentUser.id.toString()),
          getPlayerRank('biggestWin', currentUser.id.toString()),
          getPlayerRank('totalEarnings', currentUser.id.toString()),
          getPlayerRank('level', currentUser.id.toString()),
          getPlayerRank('prestigePoints', currentUser.id.toString())
        ])
        
        const validRanks = ranks.filter((r): r is number => r !== null)
        if (validRanks.length > 0) {
          setTopRank(Math.min(...validRanks))
        }
      } catch (error) {
        console.error('[App] Error updating leaderboards:', error)
      }
    }
    
    const debounceTimer = setTimeout(() => {
      updateLeaderboards()
    }, 2000)
    
    return () => clearTimeout(debounceTimer)
  }, [currentUser, gameState?.coins, gameState?.totalSpins, gameState?.biggestWin, gameState?.totalEarnings, gameState?.level, gameState?.prestigePoints, isLoadingGameState])
  
  const getTimeUntilReset = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateLevelProgress = (level: number) => {
    return level * 100
  }

  const addExperience = (amount: number) => {
    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      const newExp = prev.experience + amount
      const expNeeded = calculateLevelProgress(prev.level)
      
      if (newExp >= expNeeded) {
        const newLevel = prev.level + 1
        toast.success(`🌟 Level Up! You are now level ${newLevel}!`)
        return {
          ...prev,
          level: newLevel,
          experience: newExp - expNeeded,
          coins: prev.coins + (newLevel * 100)
        }
      }
      
      return {
        ...prev,
        experience: newExp
      }
    })
  }

  const checkAchievement = (achievementId: string, currentValue: number) => {
    if (!gameState) return
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return
    
    const isUnlocked = gameState.unlockedAchievements?.includes(achievementId)
    if (isUnlocked) return
    
    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        achievementProgress: {
          ...prev.achievementProgress,
          [achievementId]: Math.max(prev.achievementProgress?.[achievementId] || 0, currentValue)
        }
      }
    })
  }

  const unlockAchievement = (achievementId: string) => {
    if (!gameState) return
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return
    
    const isAlreadyUnlocked = gameState.unlockedAchievements?.includes(achievementId)
    if (isAlreadyUnlocked) return
    
    playAchievementSound()
    setAchievementNotification(achievement)
    
    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins + achievement.rewardCoins,
        prestigePoints: prev.prestigePoints + (achievement.rewardPrestige || 0),
        unlockedAchievements: [...(prev.unlockedAchievements || []), achievementId]
      }
    })
    
    setTimeout(() => setAchievementNotification(null), 5000)
    addExperience(50)
  }

  const updateDailyChallengeProgress = (type: string, value: number) => {
    if (!gameState || !dailyChallenge || gameState.dailyChallengeCompleted) return
    
    const today = getTodayString()
    if (gameState.dailyChallengeDate !== today) {
      setGameState(prev => {
        if (!prev) return DEFAULT_STATE
        return {
          ...prev,
          dailyChallengeDate: today,
          dailyChallengeProgress: 0,
          dailyChallengeCompleted: false
        }
      })
    }
    
    if (dailyChallenge.type === type) {
      setGameState(prev => {
        if (!prev) return DEFAULT_STATE
        const newProgress = type === 'bigWin' ? Math.max(prev.dailyChallengeProgress, value) : prev.dailyChallengeProgress + value
        return {
          ...prev,
          dailyChallengeProgress: newProgress
        }
      })
    }
  }

  useEffect(() => {
    if (!gameState) return

    const today = getTodayString()
    if (gameState.dailyChallengeDate !== today) {
      setGameState(prev => {
        if (!prev) return DEFAULT_STATE
        return {
          ...prev,
          dailyChallengeDate: today,
          dailyChallengeProgress: 0,
          dailyChallengeCompleted: false
        }
      })
    }

    if (gameState.lastLoginDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split('T')[0]
      
      const newStreak = gameState.lastLoginDate === yesterdayString ? gameState.loginStreak + 1 : 1
      
      setGameState(prev => {
        if (!prev) return DEFAULT_STATE
        return {
          ...prev,
          lastLoginDate: today,
          loginStreak: newStreak
        }
      })
      
      if (newStreak > 1) {
        toast.success(`🔥 ${newStreak} day login streak!`)
      }
      
      checkAchievement('dedicated-player', newStreak)
    }

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
        updateDailyChallengeProgress('earnings', Math.floor(gameState.idleIncomePerSecond))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState?.idleIncomePerSecond, gameState?.lastLoginDate])

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
    
    playSpinSound()
    
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
      Array(machine.reels).fill(0).map(() => {
        const ultraRoll = Math.random()
        if (ultraRoll < ULTRA_JACKPOT_CHANCE) {
          return ULTRA_JACKPOT_SYMBOLS[Math.floor(Math.random() * ULTRA_JACKPOT_SYMBOLS.length)]
        }
        
        const shouldBeJackpot = Math.random() < JACKPOT_CHANCE
        if (shouldBeJackpot && JACKPOT_SYMBOLS.some(s => machine.symbols.includes(s))) {
          const availableJackpots = JACKPOT_SYMBOLS.filter(s => machine.symbols.includes(s))
          return availableJackpots[Math.floor(Math.random() * availableJackpots.length)]
        }
        return machine.symbols[Math.floor(Math.random() * machine.symbols.length)]
      })
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
      playReelStopSound()
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
    let isJackpot = false
    let isUltraJackpot = false

    for (let row = 0; row < machine.rows; row++) {
      const rowSymbols = finalReels[row]
      const allMatch = rowSymbols.every(s => s === rowSymbols[0])
      
      if (allMatch) {
        hasWin = true
        const symbol = rowSymbols[0]
        const isJackpotSymbol = JACKPOT_SYMBOLS.includes(symbol)
        const isUltraSymbol = ULTRA_JACKPOT_SYMBOLS.includes(symbol)
        
        let symbolMultiplier = 20
        if (symbol === '💎') symbolMultiplier = 100
        else if (symbol === '⭐') symbolMultiplier = 50
        else if (symbol === '👑') symbolMultiplier = 150
        else if (symbol === '🔥') symbolMultiplier = 200
        else if (symbol === '💰') {
          symbolMultiplier = 300
          isJackpot = true
        }
        else if (symbol === '🌟') {
          symbolMultiplier = 500
          isUltraJackpot = true
        }
        else if (symbol === '💫') {
          symbolMultiplier = 750
          isUltraJackpot = true
        }
        else if (symbol === '✨') {
          symbolMultiplier = 1000
          isUltraJackpot = true
        }
        
        if (isJackpotSymbol && allMatch) {
          symbolMultiplier *= 2
        }
        
        if (isUltraSymbol && allMatch) {
          symbolMultiplier *= 3
        }
        
        winAmount += Math.floor(symbolMultiplier * gameState.spinMultiplier * machine.reels)
      } else {
        const uniqueSymbols = new Set(rowSymbols)
        if (uniqueSymbols.size === rowSymbols.length - 1) {
          winAmount += Math.floor(5 * gameState.spinMultiplier)
        }
        
        const jackpotCount = rowSymbols.filter(s => JACKPOT_SYMBOLS.includes(s)).length
        if (jackpotCount >= 2) {
          const jackpotBonus = Math.floor(50 * jackpotCount * gameState.spinMultiplier)
          winAmount += jackpotBonus
          hasWin = true
        }
        
        const ultraCount = rowSymbols.filter(s => ULTRA_JACKPOT_SYMBOLS.includes(s)).length
        if (ultraCount >= 2) {
          const ultraBonus = Math.floor(200 * ultraCount * gameState.spinMultiplier)
          winAmount += ultraBonus
          hasWin = true
          isUltraJackpot = true
        }
      }
    }

    const profit = winAmount - SPIN_COST
    setLastSpinProfit(profit)
    setShowProfitLabel(true)
    setTimeout(() => setShowProfitLabel(false), 3000)

    if (hasWin) {
      createCoinParticles(winAmount)
      
      const spinCost = SPIN_COST
      if (isUltraJackpot) {
        playJackpotSound()
        setConfettiIntensity('ultra')
        setShowConfetti(true)
        setWinBannerType('ultra')
        setWinBannerAmount(winAmount)
        setShowWinBanner(true)
        setTimeout(() => {
          setShowConfetti(false)
          setShowWinBanner(false)
        }, 5000)
      } else if (isJackpot || winAmount >= spinCost * 100) {
        playJackpotSound()
        setConfettiIntensity('jackpot')
        setShowConfetti(true)
        setWinBannerType('jackpot')
        setWinBannerAmount(winAmount)
        setShowWinBanner(true)
        setTimeout(() => {
          setShowConfetti(false)
          setShowWinBanner(false)
        }, 4000)
      } else if (winAmount >= spinCost * 50) {
        playMegaWinSound()
        setConfettiIntensity('mega')
        setShowConfetti(true)
        setWinBannerType('mega')
        setWinBannerAmount(winAmount)
        setShowWinBanner(true)
        setTimeout(() => {
          setShowConfetti(false)
          setShowWinBanner(false)
        }, 3000)
      } else if (winAmount >= spinCost * 20) {
        playBigWinSound()
        setConfettiIntensity('high')
        setShowConfetti(true)
        setWinBannerType('big')
        setWinBannerAmount(winAmount)
        setShowWinBanner(true)
        setTimeout(() => {
          setShowConfetti(false)
          setShowWinBanner(false)
        }, 2500)
      } else if (winAmount >= spinCost * 5) {
        playSmallWinSound()
        setConfettiIntensity('medium')
        setShowConfetti(true)
        setWinBannerType('small')
        setWinBannerAmount(winAmount)
        setShowWinBanner(true)
        setTimeout(() => {
          setShowConfetti(false)
          setShowWinBanner(false)
        }, 2000)
      } else {
        playSmallWinSound()
        setConfettiIntensity('low')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1500)
      }
      
      updateDailyChallengeProgress('wins', 1)
      checkAchievement('big-winner', winAmount)
      checkAchievement('jackpot-legend', winAmount)
      checkAchievement('ultra-jackpot-master', winAmount)
      checkAchievement('cosmic-fortune', winAmount)
      
      if (isJackpot || isUltraJackpot) {
        checkAchievement('jackpot-hunter', 1)
      }
    }

    const newTotalSpins = (gameState?.totalSpins || 0) + 1
    const newTotalWins = (gameState?.totalWins || 0) + (hasWin ? 1 : 0)
    const newWinStreak = hasWin ? (gameState?.winStreak || 0) + 1 : 0
    const newMaxWinStreak = Math.max(newWinStreak, gameState?.maxWinStreak || 0)
    const newTotalEarnings = (gameState?.totalEarnings || 0) + winAmount

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins + winAmount,
        totalSpins: newTotalSpins,
        biggestWin: Math.max(prev.biggestWin, winAmount),
        totalEarnings: newTotalEarnings,
        totalWins: newTotalWins,
        winStreak: newWinStreak,
        maxWinStreak: newMaxWinStreak,
      }
    })

    updateDailyChallengeProgress('spins', 1)
    updateDailyChallengeProgress('earnings', winAmount)
    updateDailyChallengeProgress('bigWin', winAmount)
    
    checkAchievement('first-spin', newTotalSpins)
    checkAchievement('spin-master', newTotalSpins)
    checkAchievement('spin-legend', newTotalSpins)
    checkAchievement('first-win', newTotalWins)
    checkAchievement('millionaire', newTotalEarnings)
    checkAchievement('lucky-streak', newWinStreak)
    
    addExperience(hasWin ? 10 : 2)

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

    const newLevel = gameState.spinPowerLevel + 1
    const newTotalUpgrades = (gameState.totalUpgrades || 0) + 1

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins - cost,
        spinPowerLevel: newLevel,
        spinMultiplier: prev.spinMultiplier + 0.5,
        totalUpgrades: newTotalUpgrades,
      }
    })

    playUpgradeSound()
    toast.success('Spin Power upgraded!')
    addExperience(5)
    
    checkAchievement('upgrade-beginner', newTotalUpgrades)
    checkAchievement('upgrade-expert', newLevel)
  }

  const upgradeIdleIncome = () => {
    if (!gameState) return
    
    const cost = calculateUpgradeCost(gameState.idleIncomeLevel, 100)
    if (gameState.coins < cost) {
      toast.error('Not enough coins!')
      return
    }

    const newLevel = gameState.idleIncomeLevel + 1
    const newTotalUpgrades = (gameState.totalUpgrades || 0) + 1

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins - cost,
        idleIncomeLevel: newLevel,
        idleIncomePerSecond: prev.idleIncomePerSecond + 1,
        totalUpgrades: newTotalUpgrades,
      }
    })

    playUpgradeSound()
    toast.success('Idle Income upgraded!')
    addExperience(5)
    
    checkAchievement('upgrade-beginner', newTotalUpgrades)
    checkAchievement('upgrade-expert', newLevel)
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

    playUpgradeSound()
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
    if (!gameState || gameState.totalEarnings < PRESTIGE_EARNINGS_REQUIREMENT) {
      toast.error(`Need at least ${PRESTIGE_EARNINGS_REQUIREMENT.toLocaleString()} total earnings to prestige!`)
      return
    }

    const newPrestigePoints = (gameState.prestigePoints || 0) + 1

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...DEFAULT_STATE,
        prestigePoints: newPrestigePoints,
        currentSlotMachine: 0,
        unlockedSlotMachines: [0],
        lastTimestamp: Date.now(),
        level: prev.level,
        experience: prev.experience,
        unlockedAchievements: prev.unlockedAchievements || [],
        achievementProgress: prev.achievementProgress || {},
        dailyChallengeDate: prev.dailyChallengeDate,
        dailyChallengeProgress: prev.dailyChallengeProgress,
        dailyChallengeCompleted: prev.dailyChallengeCompleted,
        lastLoginDate: prev.lastLoginDate,
        loginStreak: prev.loginStreak,
      }
    })

    const machine = SLOT_MACHINE_CONFIGS[0]
    const newReels = Array(machine.rows).fill(0).map(() => 
      Array(machine.reels).fill(0).map((_, i) => machine.symbols[i % machine.symbols.length])
    )
    setReels(newReels)
    setReelStates(Array(machine.rows).fill(0).map(() => Array(machine.reels).fill(false)))

    playPrestigeSound()
    setConfettiIntensity('mega')
    setShowConfetti(true)
    toast.success('🌟 Prestige! +1 Prestige Point!')
    setTimeout(() => setShowConfetti(false), 4000)
    
    addExperience(100)
    checkAchievement('prestige-first', newPrestigePoints)
    checkAchievement('prestige-veteran', newPrestigePoints)
  }

  const handleLogin = async () => {
    toast.info('Reloading to authenticate...')
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleLogout = () => {
    toast.info('Logging out...')
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const claimDailyChallenge = () => {
    if (!gameState || !dailyChallenge) return
    
    if (gameState.dailyChallengeProgress < dailyChallenge.target) {
      toast.error('Challenge not completed yet!')
      return
    }
    
    if (gameState.dailyChallengeCompleted) {
      toast.error('Already claimed!')
      return
    }
    
    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...prev,
        coins: prev.coins + dailyChallenge.reward,
        prestigePoints: prev.prestigePoints + (dailyChallenge.rewardPrestige || 0),
        dailyChallengeCompleted: true,
      }
    })
    
    playAchievementSound()
    setConfettiIntensity('medium')
    setShowConfetti(true)
    toast.success(`🎉 Challenge complete! +${dailyChallenge.reward} coins!`)
    setTimeout(() => setShowConfetti(false), 2000)
    addExperience(50)
  }

  const claimAchievement = (achievementId: string) => {
    if (!gameState) return
    
    const progress = gameState.achievementProgress?.[achievementId] || 0
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    
    if (!achievement || progress < achievement.requirement) {
      toast.error('Achievement not completed!')
      return
    }
    
    unlockAchievement(achievementId)
  }

  if (isLoadingGameState && !loadingTimeout) {
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
          <p className="text-muted-foreground">
            {currentUser ? `Loading your progress, ${currentUser.login}...` : 'Initializing game...'}
          </p>
        </Card>
      </div>
    )
  }

  if (!gameState && !loadingTimeout) return null

  const effectiveGameState = gameState || DEFAULT_STATE
  const spinPowerCost = calculateUpgradeCost(effectiveGameState.spinPowerLevel, 50)
  const idleIncomeCost = calculateUpgradeCost(effectiveGameState.idleIncomeLevel, 100)
  const canPrestige = effectiveGameState.totalEarnings >= PRESTIGE_EARNINGS_REQUIREMENT

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <Confetti active={showConfetti} intensity={confettiIntensity} />
      <WinBanner show={showWinBanner} amount={winBannerAmount} type={winBannerType} />
      <AnimatePresence>
        {achievementNotification && (
          <AchievementNotification
            achievement={achievementNotification}
            onClose={() => setAchievementNotification(null)}
          />
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
              🎰 CASINO IDLE SLOTS
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <LeaderboardButton
              onClick={() => setShowLeaderboard(true)}
              playerRank={topRank}
            />
            <Button
              onClick={() => setShowAchievements(true)}
              variant="outline"
              size="sm"
              className="hidden md:flex"
            >
              <Trophy size={20} weight="fill" className="mr-2" />
              Achievements
            </Button>
            <Button
              onClick={() => setShowAchievements(true)}
              variant="outline"
              size="sm"
              className="md:hidden"
            >
              <Trophy size={20} weight="fill" />
            </Button>
            <UserProfile
              isLoggedIn={currentUser !== null}
              username={currentUser?.login || ''}
              avatarUrl={currentUser?.avatarUrl}
              level={effectiveGameState.level || 1}
              experience={effectiveGameState.experience || 0}
              experienceToNextLevel={calculateLevelProgress(effectiveGameState.level || 1)}
              coins={effectiveGameState.coins}
              prestigePoints={effectiveGameState.prestigePoints}
              totalSpins={effectiveGameState.totalSpins}
              lastSaveTime={lastSaveTime}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onManualSave={saveGameStateImmediately}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="relative inline-block mb-4"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-xl opacity-40 animate-pulse" />
            <Card className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-2 border-primary/50 shadow-2xl shadow-primary/30 px-8 py-6 backdrop-blur-sm overflow-visible">
              <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-black orbitron relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Coins size={48} weight="fill" className="text-primary drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
                </motion.div>
                <motion.span
                  key={effectiveGameState.coins}
                  initial={{ scale: 1.3, color: "rgb(255, 215, 0)" }}
                  animate={{ scale: 1, color: "inherit" }}
                  transition={{ duration: 0.3 }}
                  className="tabular-nums bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl"
                  style={{
                    textShadow: "0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.3)"
                  }}
                >
                  {effectiveGameState.coins.toLocaleString()}
                </motion.span>
                <AnimatePresence>
                  {coinChange && (
                    <motion.span
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: 1, y: -40, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5 }}
                      className={`absolute right-0 top-0 font-bold text-2xl tabular-nums ${
                        coinChange.isPositive ? 'text-green-400' : 'text-red-400'
                      }`}
                      style={{
                        textShadow: coinChange.isPositive 
                          ? "0 0 20px rgba(34, 197, 94, 0.8)" 
                          : "0 0 20px rgba(239, 68, 68, 0.8)"
                      }}
                    >
                      {coinChange.isPositive ? '+' : '-'}{coinChange.amount.toLocaleString()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {currentUser && !isLoadingGameState && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex justify-center"
                >
                  <Badge variant="outline" className="text-xs bg-accent/30 border-accent shadow-lg shadow-accent/20">
                    <CloudArrowUp size={14} weight="fill" className="mr-1" />
                    Cloud Synced
                  </Badge>
                </motion.div>
              )}
            </Card>
          </motion.div>
          
          <AnimatePresence>
            {showProfitLabel && lastSpinProfit !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="mb-4"
              >
                <Badge 
                  className={`text-xl md:text-2xl px-6 py-3 font-black orbitron shadow-2xl ${
                    lastSpinProfit > 0 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-green-500/50' 
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400 shadow-red-500/50'
                  }`}
                  style={{
                    filter: lastSpinProfit > 0 
                      ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8))' 
                      : 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))'
                  }}
                >
                  {lastSpinProfit > 0 ? '🎉 +' : '💸 '}
                  {lastSpinProfit.toLocaleString()}
                  {lastSpinProfit > 0 ? ' PROFIT!' : ' LOSS'}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          
          {currentUser && (
            <motion.div 
              className="max-w-md mx-auto mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur-md" />
                <Card className="relative bg-gradient-to-br from-card/80 to-secondary/30 border border-primary/30 p-4 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkle size={20} weight="fill" className="text-primary" />
                      </motion.div>
                      <span className="font-bold text-lg orbitron bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        LEVEL {effectiveGameState.level || 1}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-semibold tabular-nums">
                      {effectiveGameState.experience || 0} / {calculateLevelProgress(effectiveGameState.level || 1)} XP
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-primary/20">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((effectiveGameState.experience || 0) / calculateLevelProgress(effectiveGameState.level || 1)) * 100}%`,
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{ 
                        width: { duration: 0.5 },
                        backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                      }}
                      style={{
                        backgroundSize: "200% 200%",
                        boxShadow: "0 0 20px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full" />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {effectiveGameState.prestigePoints > 0 && (
              <Badge className="bg-accent text-accent-foreground">
                <Trophy size={16} weight="fill" className="mr-1" />
                {effectiveGameState.prestigePoints} Prestige Points
              </Badge>
            )}
            <Badge className="bg-secondary text-secondary-foreground">
              <Sparkle size={16} weight="fill" className="mr-1" />
              {currentMachine.name} ({currentMachine.rows}x{currentMachine.reels})
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-200">
              💰 Jackpot symbols give 2x multiplier!
            </Badge>
            <Badge className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-400/50 text-cyan-200">
              ✨ Ultra-Jackpot symbols give 3x multiplier!
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
                            : ULTRA_JACKPOT_SYMBOLS.includes(symbol) && reelStates[rowIndex][colIndex]
                            ? 'border-cyan-400 shadow-cyan-400/80 shadow-2xl'
                            : JACKPOT_SYMBOLS.includes(symbol) && reelStates[rowIndex][colIndex]
                            ? 'border-yellow-500 shadow-yellow-500/50'
                            : 'border-primary/30'
                        }`}
                      >
                        {ULTRA_JACKPOT_SYMBOLS.includes(symbol) && reelStates[rowIndex][colIndex] && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl"
                          />
                        )}
                        {JACKPOT_SYMBOLS.includes(symbol) && reelStates[rowIndex][colIndex] && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-400/20 rounded-xl"
                          />
                        )}
                        <motion.span 
                          className={`text-3xl md:text-5xl relative z-10 ${
                            ULTRA_JACKPOT_SYMBOLS.includes(symbol) ? 'drop-shadow-[0_0_12px_rgba(34,211,238,1)]' :
                            JACKPOT_SYMBOLS.includes(symbol) ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : ''
                          }`}
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
                disabled={isSpinning || effectiveGameState.coins < SPIN_COST}
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
                    {effectiveGameState.totalSpins}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-primary tabular-nums">
                    {effectiveGameState.biggestWin}
                  </div>
                  <div className="text-sm text-muted-foreground">Biggest Win</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-primary tabular-nums">
                    {effectiveGameState.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold orbitron text-accent tabular-nums">
                    {effectiveGameState.idleIncomePerSecond.toFixed(1)}
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
                      <span className="font-semibold">Level {effectiveGameState.spinPowerLevel}</span>
                      <Badge variant="secondary">{effectiveGameState.spinMultiplier}x Multiplier</Badge>
                    </div>
                    <Progress value={(effectiveGameState.spinPowerLevel % 10) * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Increases winnings from spins by 0.5x
                    </p>
                    <Button
                      onClick={upgradeSpinPower}
                      disabled={effectiveGameState.coins < spinPowerCost}
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
                      <span className="font-semibold">Level {effectiveGameState.idleIncomeLevel}</span>
                      <Badge variant="secondary">
                        <Lightning size={16} weight="fill" className="mr-1" />
                        {effectiveGameState.idleIncomePerSecond.toFixed(1)}/s
                      </Badge>
                    </div>
                    <Progress value={(effectiveGameState.idleIncomeLevel % 10) * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Earn coins passively, even when offline
                    </p>
                    <Button
                      onClick={upgradeIdleIncome}
                      disabled={effectiveGameState.coins < idleIncomeCost}
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
                      Prestige ({PRESTIGE_EARNINGS_REQUIREMENT.toLocaleString()} earned)
                    </>
                  ) : (
                    <>
                      <Lock size={20} className="mr-2" />
                      Locked ({effectiveGameState.totalEarnings.toLocaleString()}/{PRESTIGE_EARNINGS_REQUIREMENT.toLocaleString()} earned)
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={24} weight="fill" className="text-accent" />
                <h2 className="text-2xl font-bold">Daily Challenge</h2>
              </div>
              <DailyChallengeCard
                dailyChallenge={dailyChallenge}
                challengeProgress={effectiveGameState.dailyChallengeProgress || 0}
                challengeCompleted={effectiveGameState.dailyChallengeCompleted || false}
                onClick={() => setShowDailyChallenge(true)}
              />
            </Card>

            <Card className="p-6 bg-card/50 border-border">
              <div className="flex items-center gap-2 mb-4">
                <Sparkle size={24} weight="fill" className="text-primary" />
                <h2 className="text-2xl font-bold">Slot Machines</h2>
              </div>
              <div className="space-y-3">
                {SLOT_MACHINE_CONFIGS.map((machine, index) => {
                  const isUnlocked = effectiveGameState?.unlockedSlotMachines?.includes(index) ?? false
                  const isCurrent = effectiveGameState?.currentSlotMachine === index
                  const canAfford = (effectiveGameState?.prestigePoints ?? 0) >= machine.prestigeCost
                  
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

      <Dialog open={showDataMigrationDialog} onOpenChange={setShowDataMigrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CloudArrowUp size={32} weight="fill" className="text-accent" />
              Progress Linked to GitHub!
            </DialogTitle>
            <DialogDescription className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-4"
              >
                <div className="text-6xl mb-4">✅</div>
              </motion.div>
              <p className="text-lg mb-3">
                Your local progress has been successfully linked to your GitHub account!
              </p>
              <p className="text-sm text-muted-foreground">
                Your coins, level, achievements, and all progress are now saved to the cloud. 
                You can access your game from any device by logging in with GitHub.
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowDataMigrationDialog(false)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Sparkle size={20} weight="fill" className="mr-2" />
            Continue Playing
          </Button>
        </DialogContent>
      </Dialog>

      <Achievements
        open={showAchievements}
        onOpenChange={setShowAchievements}
        unlockedAchievements={effectiveGameState.unlockedAchievements || []}
        achievementProgress={effectiveGameState.achievementProgress || {}}
        onClaim={claimAchievement}
      />

      <DailyChallenges
        open={showDailyChallenge}
        onOpenChange={setShowDailyChallenge}
        dailyChallenge={dailyChallenge}
        challengeProgress={effectiveGameState.dailyChallengeProgress || 0}
        challengeCompleted={effectiveGameState.dailyChallengeCompleted || false}
        onClaim={claimDailyChallenge}
        timeUntilReset={getTimeUntilReset()}
      />

      <Leaderboard
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
        currentUserId={currentUser?.id.toString() || null}
        userLevel={effectiveGameState.level || 1}
      />
    </div>
  )
}

export default App