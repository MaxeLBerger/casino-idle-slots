import { useEffect, useState, useRef, useMemo } from 'react'
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
import { PrestigeDialog } from '@/components/PrestigeDialog'
import { SpinHistory } from '@/components/SpinHistory'
import { SpinResult, GameState } from '@/types/game.types'
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
import { useSupabaseGameState, getCurrentUser, type UserInfo, migrateLocalDataToUser } from '@/lib/persistence'
import { signInWithGitHub, signOut, onAuthStateChange } from '@/lib/auth'
import { submitScore, getPlayerRank } from '@/lib/leaderboard'
import { 
  calculatePrestigeReward, 
  calculatePrestigeMultiplier, 
  calculatePrestigeStartingCoins,
  formatPrestigeBonus,
  getPrestigeRank
} from '@/lib/prestige'

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
  { name: 'Classic', rows: 1, reels: 3, prestigeCost: 0, symbols: SYMBOL_SETS[0], idleMultiplier: 1 },
  { name: 'Deluxe', rows: 2, reels: 3, prestigeCost: 5, symbols: SYMBOL_SETS[1], idleMultiplier: 2 },
  { name: 'Premium', rows: 3, reels: 3, prestigeCost: 10, symbols: SYMBOL_SETS[2], idleMultiplier: 5 },
  { name: 'Mega', rows: 3, reels: 4, prestigeCost: 15, symbols: SYMBOL_SETS[3], idleMultiplier: 12 },
  { name: 'Ultimate', rows: 4, reels: 5, prestigeCost: 20, symbols: SYMBOL_SETS[4], idleMultiplier: 30 }
]

const SPIN_COST = 10
const STARTING_COINS = 200
const MAX_OFFLINE_HOURS = 4
const BASE_PRESTIGE_REQUIREMENT = 50000



const DEFAULT_STATE: GameState = {
  coins: STARTING_COINS,
  totalSpins: 0,
  biggestWin: 0,
  totalEarnings: 0,
  lifetimeEarnings: 0,
  lifetimeSpins: 0,
  lifetimeWins: 0,
  lifetimeBiggestWin: 0,
  spinHistory: [],
  spinMultiplier: 1,
  idleIncomePerSecond: 1,
  spinPowerLevel: 0,
  idleIncomeLevel: 1,
  prestigePoints: 0,
  totalPrestigeEarned: 0,
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
  const [gameState, setGameState, , isLoadingGameState, gameStateUserId, saveGameStateImmediately, lastSaveTime] = useSupabaseGameState<GameState>(DEFAULT_STATE)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
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
  const [winBannerType, setWinBannerType] = useState<'small' | 'big' | 'mega' | 'jackpot' | 'ultra' | 'prestige'>('small')
  const [showAchievements, setShowAchievements] = useState(false)
  const [showDailyChallenge, setShowDailyChallenge] = useState(false)
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [topRank, setTopRank] = useState<number | null>(null)
  const [lastSpinWin, setLastSpinWin] = useState<number | null>(null)
  const [hasMigratedData, setHasMigratedData] = useState(false)
  const [showDataMigrationDialog, setShowDataMigrationDialog] = useState(false)
  const [showPrestigeDialog, setShowPrestigeDialog] = useState(false)

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

    const unsubscribe = onAuthStateChange(async (user) => {
      if (mounted) {
        if (user) {
          const userInfo = await getCurrentUser()
          setCurrentUser(userInfo)
        } else {
          setCurrentUser(null)
        }
      }
    })

    return () => {
      mounted = false
      unsubscribe()
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
      const prestigeMultiplier = calculatePrestigeMultiplier(gameState.prestigePoints || 0)
      const machineMultiplier = SLOT_MACHINE_CONFIGS[gameState.currentSlotMachine].idleMultiplier || 1
      const earnings = Math.floor(actualElapsed * gameState.idleIncomePerSecond * prestigeMultiplier * machineMultiplier)
      
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
          const prestigeMultiplier = calculatePrestigeMultiplier(prev.prestigePoints || 0)
          const machineMultiplier = SLOT_MACHINE_CONFIGS[prev.currentSlotMachine].idleMultiplier || 1
          const earnings = Math.floor(prev.idleIncomePerSecond * prestigeMultiplier * machineMultiplier)
          return {
            ...prev,
            coins: prev.coins + earnings,
            totalEarnings: prev.totalEarnings + earnings,
            lastTimestamp: Date.now(),
          }
        })
        const prestigeMultiplier = calculatePrestigeMultiplier(gameState.prestigePoints || 0)
        const machineMultiplier = SLOT_MACHINE_CONFIGS[gameState.currentSlotMachine].idleMultiplier || 1
        updateDailyChallengeProgress('earnings', Math.floor(gameState.idleIncomePerSecond * prestigeMultiplier * machineMultiplier))
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

    // Apply prestige multiplier to all winnings
    const prestigeMultiplier = calculatePrestigeMultiplier(gameState.prestigePoints || 0)
    winAmount = Math.floor(winAmount * prestigeMultiplier)

    const profit = winAmount - SPIN_COST
    setLastSpinWin(winAmount)

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
    
    // Lifetime stats
    const newLifetimeSpins = (gameState?.lifetimeSpins || 0) + 1
    const newLifetimeWins = (gameState?.lifetimeWins || 0) + (hasWin ? 1 : 0)
    const newLifetimeBiggestWin = Math.max(gameState?.lifetimeBiggestWin || 0, winAmount)

    const spinResult: SpinResult = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      betAmount: SPIN_COST,
      winAmount: winAmount,
      isWin: hasWin,
      symbols: finalReels.flat()
    }

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      
      const newHistory = [spinResult, ...(prev.spinHistory || [])].slice(0, 50)
      
      return {
        ...prev,
        coins: prev.coins + winAmount,
        totalSpins: newTotalSpins,
        biggestWin: Math.max(prev.biggestWin, winAmount),
        totalEarnings: newTotalEarnings,
        totalWins: newTotalWins,
        winStreak: newWinStreak,
        maxWinStreak: newMaxWinStreak,
        spinHistory: newHistory,
        lifetimeSpins: newLifetimeSpins,
        lifetimeWins: newLifetimeWins,
        lifetimeBiggestWin: newLifetimeBiggestWin,
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
    return Math.floor(base * Math.pow(1.6, level))
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
        idleIncomePerSecond: prev.idleIncomePerSecond + 5,
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
        // Prestige points are not spent, just required
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

  const getPrestigeRequirement = (points: number) => {
    return BASE_PRESTIGE_REQUIREMENT + (points * 10000)
  }

  const openPrestigeDialog = () => {
    if (!gameState) return
    const requirement = getPrestigeRequirement(gameState.prestigePoints || 0)
    
    if (gameState.totalEarnings < requirement) {
      toast.error(`Need at least ${requirement.toLocaleString()} total earnings to prestige!`)
      return
    }
    setShowPrestigeDialog(true)
  }

  const confirmPrestige = () => {
    if (!gameState) return

    const prestigeReward = calculatePrestigeReward(gameState.totalEarnings)
    const newPrestigePoints = (gameState.prestigePoints || 0) + prestigeReward
    const newTotalPrestigeEarned = (gameState.totalPrestigeEarned || 0) + prestigeReward
    const newStartingCoins = calculatePrestigeStartingCoins(newPrestigePoints, STARTING_COINS)
    const newLifetimeEarnings = (gameState.lifetimeEarnings || 0) + gameState.totalEarnings

    setGameState(prev => {
      if (!prev) return DEFAULT_STATE
      return {
        ...DEFAULT_STATE,
        coins: newStartingCoins,
        prestigePoints: newPrestigePoints,
        totalPrestigeEarned: newTotalPrestigeEarned,
        lifetimeEarnings: newLifetimeEarnings,
        lifetimeSpins: prev.lifetimeSpins || 0,
        lifetimeWins: prev.lifetimeWins || 0,
        lifetimeBiggestWin: prev.lifetimeBiggestWin || 0,
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

    // Epic prestige celebration sequence
    playPrestigeSound()
    setConfettiIntensity('ultra')
    setShowConfetti(true)
    
    // Show prestige banner
    setWinBannerAmount(prestigeReward)
    setWinBannerType('prestige')
    setShowWinBanner(true)
    
    const multiplier = calculatePrestigeMultiplier(newPrestigePoints)
    toast.success(`🌟 Prestige! +${prestigeReward} Prestige Points!`, {
      description: `${multiplier.toFixed(2)}x multiplier bonus activated!`,
      duration: 6000,
    })
    
    setTimeout(() => {
      setShowConfetti(false)
      setShowWinBanner(false)
    }, 5000)
    
    addExperience(100)
    checkAchievement('prestige-first', newPrestigePoints)
    checkAchievement('prestige-veteran', newPrestigePoints)
    checkAchievement('prestige-champion', newPrestigePoints)
    checkAchievement('prestige-legend', newPrestigePoints)
    checkAchievement('prestige-god', newPrestigePoints)
  }

  const handleLogin = async () => {
    const success = await signInWithGitHub()
    if (!success) {
      toast.error('Failed to sign in with GitHub')
    }
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentUser(null)
    toast.success('Logged out successfully')
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
  const prestigeRequirement = getPrestigeRequirement(effectiveGameState.prestigePoints || 0)
  const canPrestige = effectiveGameState.totalEarnings >= prestigeRequirement

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <Confetti active={showConfetti} intensity={confettiIntensity} />
      <WinBanner show={showWinBanner} amount={winBannerAmount} type={winBannerType} />
      <AchievementNotification achievement={achievementNotification} onClose={() => setAchievementNotification(null)} />
      
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-8 px-2 sm:px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-primary tracking-tight drop-shadow-lg">
              🎰 CASINO IDLE SLOTS
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 sm:gap-2"
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
              className="md:hidden px-2 sm:px-3"
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
              lifetimeSpins={effectiveGameState.lifetimeSpins || 0}
              lifetimeWins={effectiveGameState.lifetimeWins || 0}
              lifetimeBiggestWin={effectiveGameState.lifetimeBiggestWin || 0}
              lifetimeEarnings={(effectiveGameState.lifetimeEarnings || 0) + (effectiveGameState.totalEarnings || 0)}
              lastSaveTime={lastSaveTime}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onManualSave={saveGameStateImmediately}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start px-0 sm:px-4">
          
          {/* LEFT COLUMN - Progression */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <Card className="p-5 bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUp size={24} weight="fill" className="text-accent" />
                <h2 className="text-xl font-bold">Upgrades</h2>
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
            </Card>

            <Card className="p-5 bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={24} weight="fill" className="text-accent" />
                <h2 className="text-xl font-bold">Daily Challenge</h2>
              </div>
              <DailyChallengeCard
                dailyChallenge={dailyChallenge}
                challengeProgress={effectiveGameState.dailyChallengeProgress || 0}
                challengeCompleted={effectiveGameState.dailyChallengeCompleted || false}
                onClick={() => setShowDailyChallenge(true)}
              />
            </Card>
          </div>

          {/* CENTER COLUMN - The Game */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="relative bg-card/90 border-primary/20 shadow-md p-4 flex flex-col items-center justify-center h-full overflow-hidden group hover:border-primary/40 transition-all">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Coins size={12} weight="fill" className="text-primary" />
                    Balance
                  </div>
                  <div className="text-xl md:text-3xl font-black orbitron tabular-nums text-primary">
                    {effectiveGameState.coins.toLocaleString()}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="relative bg-card/90 border-green-500/20 shadow-md p-4 flex flex-col items-center justify-center h-full overflow-hidden group hover:border-green-500/40 transition-all">
                  <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Sparkle size={12} weight="fill" className="text-green-500" />
                    Last Spin
                  </div>
                  <div className="text-xl md:text-3xl font-black orbitron tabular-nums text-green-500">
                    {lastSpinWin !== null ? `+${lastSpinWin.toLocaleString()}` : '---'}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="relative bg-card/90 border-accent/20 shadow-md p-4 flex flex-col items-center justify-center h-full overflow-hidden group hover:border-accent/40 transition-all">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Trophy size={12} weight="fill" className="text-accent" />
                    Level {effectiveGameState.level || 1}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${((effectiveGameState.experience || 0) / calculateLevelProgress(effectiveGameState.level || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {effectiveGameState.experience || 0} / {calculateLevelProgress(effectiveGameState.level || 1)} XP
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* SLOT MACHINE */}
            <Card className="p-8 md:p-12 bg-gradient-to-b from-card via-background to-card border-primary/30 shadow-2xl relative overflow-hidden ring-1 ring-primary/10">
              <div ref={coinParticleContainer} className="absolute inset-0 pointer-events-none" />
              
              <div className="flex flex-col gap-4 mb-10">
                {reels.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-3 md:gap-6">
                    {row.map((symbol, colIndex) => (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        animate={
                          reelStates[rowIndex][colIndex] 
                            ? { scale: 1, y: 0 }
                            : { scale: 0.95, y: [0, -15, 0] }
                        }
                        transition={
                          reelStates[rowIndex][colIndex]
                            ? { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                            : { duration: 0.1, y: { duration: 0.3, repeat: Infinity, ease: 'linear' } }
                        }
                        className={`bg-muted/50 rounded-2xl w-20 h-20 md:w-32 md:h-32 flex items-center justify-center border-4 shadow-inner relative overflow-hidden ${
                          reelStates[rowIndex][colIndex] && isSpinning
                            ? 'border-primary glow-pulse'
                            : ULTRA_JACKPOT_SYMBOLS.includes(symbol) && reelStates[rowIndex][colIndex]
                            ? 'border-cyan-400 shadow-cyan-400/50 shadow-lg'
                            : JACKPOT_SYMBOLS.includes(symbol) && reelStates[rowIndex][colIndex]
                            ? 'border-yellow-500 shadow-yellow-500/50 shadow-lg'
                            : 'border-border'
                        }`}
                      >
                        <motion.span 
                          className={`text-4xl md:text-6xl relative z-10 select-none ${
                            ULTRA_JACKPOT_SYMBOLS.includes(symbol) ? 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]' :
                            JACKPOT_SYMBOLS.includes(symbol) ? 'drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]' : ''
                          }`}
                          animate={reelStates[rowIndex][colIndex] && isSpinning ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, -5, 5, 0]
                          } : {}}
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
                className="w-full py-8 md:py-10 text-2xl md:text-4xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSpinning ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⚡
                  </motion.span>
                ) : (
                  <div className="flex flex-col items-center leading-none gap-2">
                    <div className="flex items-center gap-3">
                      <Sparkle size={32} weight="fill" />
                      SPIN
                      <Sparkle size={32} weight="fill" />
                    </div>
                    <span className="text-sm md:text-base font-normal opacity-80 tracking-normal">
                      Cost: {SPIN_COST} Coins
                    </span>
                  </div>
                )}
              </Button>
            </Card>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {effectiveGameState.prestigePoints > 0 && (
                <Badge className="bg-accent/10 text-accent border-accent/20 px-3 py-1.5">
                  <Trophy size={14} weight="fill" className="mr-1.5" />
                  {effectiveGameState.prestigePoints} Prestige
                </Badge>
              )}
              <Badge className="bg-secondary/50 text-foreground border-border px-3 py-1.5">
                <Sparkle size={14} weight="fill" className="mr-1.5 text-primary" />
                {currentMachine.name} ({currentMachine.rows}x{currentMachine.reels})
              </Badge>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-3 py-1.5">
                💰 Jackpot 2x
              </Badge>
              <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 px-3 py-1.5">
                ✨ Ultra 3x
              </Badge>
            </div>

          </div>

          {/* RIGHT COLUMN - Meta & Stats */}
          <div className="lg:col-span-3 space-y-6 order-3 lg:order-3">
            
            <Card className="p-5 bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Gauge size={24} weight="fill" className="text-accent" />
                <h2 className="text-xl font-bold">Statistics</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Spins</div>
                  <div className="text-lg font-bold orbitron tabular-nums">{effectiveGameState.totalSpins}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Biggest Win</div>
                  <div className="text-lg font-bold orbitron tabular-nums text-green-500">{effectiveGameState.biggestWin}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-center col-span-2">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Earned</div>
                  <div className="text-lg font-bold orbitron tabular-nums text-accent">
                    {((effectiveGameState.totalEarnings || 0) + (effectiveGameState.lifetimeEarnings || 0)).toLocaleString()}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Idle/Sec</div>
                  <div className="text-lg font-bold orbitron tabular-nums text-yellow-500">
                    {(effectiveGameState.idleIncomePerSecond * calculatePrestigeMultiplier(effectiveGameState.prestigePoints || 0)).toFixed(1)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-center">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Win Rate</div>
                  <div className="text-lg font-bold orbitron tabular-nums text-blue-400">
                    {effectiveGameState.totalSpins > 0 ? ((effectiveGameState.totalWins / effectiveGameState.totalSpins) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Sparkle size={24} weight="fill" className="text-primary" />
                <h2 className="text-xl font-bold">Machines</h2>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {SLOT_MACHINE_CONFIGS.map((machine, index) => {
                  const isUnlocked = effectiveGameState?.unlockedSlotMachines?.includes(index) ?? false
                  const isCurrent = effectiveGameState?.currentSlotMachine === index
                  const canAfford = (effectiveGameState?.prestigePoints ?? 0) >= machine.prestigeCost
                  
                  return (
                    <div key={index} className={`p-3 rounded-lg border ${isCurrent ? 'bg-primary/10 border-primary' : 'bg-muted/20 border-border'} transition-all`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">{machine.name}</span>
                        {isCurrent && <Badge className="h-5 text-[10px]">Active</Badge>}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{machine.rows}x{machine.reels}</span>
                        {isUnlocked ? (
                          <Button
                            size="sm"
                            variant={isCurrent ? "ghost" : "secondary"}
                            className="h-7 text-xs"
                            onClick={() => switchSlotMachine(index)}
                            disabled={isCurrent}
                          >
                            {isCurrent ? 'Selected' : 'Select'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => unlockSlotMachine(index)}
                            disabled={!canAfford}
                          >
                            Unlock ({machine.prestigeCost} PP)
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-5 bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} weight="fill" className="text-primary" />
                <h3 className="font-bold">Prestige</h3>
                {canPrestige && (
                  <Badge className="ml-auto bg-gradient-to-r from-primary to-accent text-white animate-pulse">
                    Ready!
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rank:</span>
                  <span className={`font-bold ${getPrestigeRank(effectiveGameState.prestigePoints || 0).color}`}>
                    {getPrestigeRank(effectiveGameState.prestigePoints || 0).name}
                  </span>
                </div>
                {canPrestige ? (
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Reward:</span>
                      <span className="font-bold text-primary">
                        +{calculatePrestigeReward(effectiveGameState.totalEarnings)} PP
                      </span>
                    </div>
                  </div>
                ) : (
                  <Progress 
                    value={(effectiveGameState.totalEarnings / prestigeRequirement) * 100} 
                    className="h-2"
                  />
                )}
                <Button
                  onClick={openPrestigeDialog}
                  disabled={!canPrestige}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  {canPrestige ? 'Prestige Now' : `Locked (${Math.floor((effectiveGameState.totalEarnings / prestigeRequirement) * 100)}%)`}
                </Button>
              </div>
            </Card>

            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <SpinHistory 
                history={effectiveGameState.spinHistory || []}
                totalSpins={effectiveGameState.totalSpins}
                totalWins={effectiveGameState.totalWins}
                biggestWin={effectiveGameState.biggestWin}
                totalEarnings={(effectiveGameState.totalEarnings || 0) + (effectiveGameState.lifetimeEarnings || 0)}
                rtp={effectiveGameState.totalSpins > 0 ? (effectiveGameState.totalEarnings / (effectiveGameState.totalSpins * SPIN_COST)) * 100 : undefined}
              />
            </div>
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

      <PrestigeDialog
        open={showPrestigeDialog}
        onOpenChange={setShowPrestigeDialog}
        currentPrestigePoints={effectiveGameState.prestigePoints || 0}
        totalEarnings={effectiveGameState.totalEarnings || 0}
        currentCoins={effectiveGameState.coins || 0}
        level={effectiveGameState.level || 1}
        onConfirm={confirmPrestige}
      />
    </div>
  )
}

export default App