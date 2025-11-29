import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase, isDemoMode } from './supabase'
import { getCurrentUser, type UserInfo } from './auth'

export type { UserInfo }

// Demo mode: Use localStorage-only persistence (imported from old Spark version)
// This allows the app to work without Supabase configuration
// Full features (cloud sync, leaderboard) require Supabase setup

const SAVE_DEBOUNCE_MS = 1000
const AUTO_SAVE_INTERVAL_MS = 30000

export function useSupabaseGameState<T extends Record<string, any>>(
  defaultValue: T
): [
  value: T,
  setValue: (newValue: T | ((prev: T) => T)) => void,
  deleteValue: () => Promise<void>,
  isLoading: boolean,
  userId: string | null,
  saveImmediately: () => Promise<boolean>,
  lastSaveTime: number
] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now())
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentValueRef = useRef<T>(defaultValue)
  const isInitializedRef = useRef(false)
  const isSavingRef = useRef(false)

  const saveToSupabase = useCallback(async (data: T, uid: string): Promise<boolean> => {
    // Demo mode: skip Supabase save
    if (isDemoMode) {
      return true
    }

    if (isSavingRef.current) return false
    isSavingRef.current = true

    try {
      const gameStateData = {
        user_id: uid,
        coins: data.coins || 0,
        diamonds: data.diamonds || 0,
        level: data.level || 1,
        experience: data.experience || 0,
        prestige_points: data.prestigePoints || 0,
        prestige_level: data.prestigeLevel || 0,
        prestige_rank: data.prestigeRank || 'bronze',
        unlocked_slot_machines: data.unlockedSlotMachines || [0],
        upgrades: {
          spinPowerLevel: data.spinPowerLevel || 0,
          idleIncomeLevel: data.idleIncomeLevel || 0,
          spinMultiplier: data.spinMultiplier || 1,
          idleIncomePerSecond: data.idleIncomePerSecond || 1
        },
        achievements: data.unlockedAchievements || [],
        statistics: {
          totalSpins: data.totalSpins || 0,
          biggestWin: data.biggestWin || 0,
          // Save cumulative total for Leaderboard compatibility
          totalEarnings: (data.totalEarnings || 0) + (data.lifetimeEarnings || 0),
          // Save separate fields for state restoration
          currentRunEarnings: data.totalEarnings || 0,
          lifetimeEarnings: data.lifetimeEarnings || 0,
          lifetimeSpins: data.lifetimeSpins || 0,
          lifetimeWins: data.lifetimeWins || 0,
          lifetimeBiggestWin: data.lifetimeBiggestWin || 0,
          totalWins: data.totalWins || 0,
          winStreak: data.winStreak || 0,
          maxWinStreak: data.maxWinStreak || 0,
          totalUpgrades: data.totalUpgrades || 0,
          currentSlotMachine: data.currentSlotMachine || 0
        },
        daily_challenges: [{
          date: data.dailyChallengeDate || new Date().toISOString().split('T')[0],
          progress: data.dailyChallengeProgress || 0,
          completed: data.dailyChallengeCompleted || false
        }],
        event_token_balances: data.eventTokenBalances || {},
        preferences: data.preferences || {},
        workers: data.workers || [],
        spin_history: (data.spinHistory || []).slice(0, 50), // Optimistic save batching: only sync tail window
        avatar: { id: data.avatarId || 'male' },
        last_daily_reset: data.dailyChallengeDate || null,
        last_login_date: data.lastLoginDate || new Date().toISOString().split('T')[0],
        login_streak: data.loginStreak || 1,
        last_spin_at: data.spinHistory?.[0]?.timestamp ? new Date(data.spinHistory[0].timestamp).toISOString() : null
      }

      const { error } = await supabase!
        .from('game_states')
        .upsert(gameStateData, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('[Persistence] Error saving to Supabase:', error)
        return false
      }

      setLastSaveTime(Date.now())
      return true
    } catch (error) {
      console.error('[Persistence] Exception while saving:', error)
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [])

  const loadFromSupabase = useCallback(async (uid: string): Promise<T | null> => {
    // Demo mode: return null (will use localStorage)
    if (isDemoMode) {
      return null
    }

    try {
      const { data, error} = await supabase!
        .from('game_states')
        .select('*')
        .eq('user_id', uid)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('[Persistence] Error loading from Supabase:', error)
        return null
      }

      if (!data) return null

      const gameState: T = {
        ...defaultValue,
        coins: data.coins,
        diamonds: data.diamonds || 0,
        level: data.level,
        experience: data.experience,
        prestigePoints: data.prestige_points,
        prestigeLevel: data.prestige_level || 0,
        prestigeRank: data.prestige_rank || 'bronze',
        unlockedSlotMachines: data.unlocked_slot_machines || data.slots_unlocked || [0],
        spinPowerLevel: data.upgrades?.spinPowerLevel || 0,
        idleIncomeLevel: data.upgrades?.idleIncomeLevel || 0,
        spinMultiplier: data.upgrades?.spinMultiplier || 1,
        idleIncomePerSecond: data.upgrades?.idleIncomePerSecond || 1,
        unlockedAchievements: data.achievements || [],
        totalSpins: data.statistics?.totalSpins || 0,
        biggestWin: data.statistics?.biggestWin || 0,
        // Restore current run earnings from specific field, fallback to totalEarnings if missing (legacy support)
        // If currentRunEarnings is present, totalEarnings in DB is the cumulative total (Lifetime + Current)
        totalEarnings: data.statistics?.currentRunEarnings ?? data.statistics?.totalEarnings ?? 0,
        lifetimeEarnings: data.statistics?.lifetimeEarnings || 0,
        lifetimeSpins: data.statistics?.lifetimeSpins ?? data.statistics?.totalSpins ?? 0,
        lifetimeWins: data.statistics?.lifetimeWins ?? data.statistics?.totalWins ?? 0,
        lifetimeBiggestWin: data.statistics?.lifetimeBiggestWin ?? data.statistics?.biggestWin ?? 0,
        totalWins: data.statistics?.totalWins || 0,
        winStreak: data.statistics?.winStreak || 0,
        maxWinStreak: data.statistics?.maxWinStreak || 0,
        totalUpgrades: data.statistics?.totalUpgrades || 0,
        currentSlotMachine: data.statistics?.currentSlotMachine || 0,
        dailyChallengeDate: data.daily_challenges?.[0]?.date || new Date().toISOString().split('T')[0],
        dailyChallengeProgress: data.daily_challenges?.[0]?.progress || 0,
        dailyChallengeCompleted: data.daily_challenges?.[0]?.completed || false,
        eventTokenBalances: data.event_token_balances || {},
        preferences: data.preferences || defaultValue.preferences,
        workers: data.workers || [],
        spinHistory: data.spin_history || [],
        avatarId: data.avatar?.id || 'male',
        lastLoginDate: data.last_login_date,
        loginStreak: data.login_streak,
        lastTimestamp: Date.now()
      } as T

      return gameState
    } catch (error) {
      console.error('[Persistence] Exception while loading:', error)
      return null
    }
  }, [defaultValue])

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      if (isInitializedRef.current) return

      try {
        const user = await getCurrentUser()
        if (!mounted) return

        const uid = user?.id || null
        setUserId(uid)

        if (uid) {
          const savedState = await loadFromSupabase(uid)
          if (savedState && mounted) {
            setValue(savedState)
            currentValueRef.current = savedState
          } else if (mounted) {
            setValue(defaultValue)
            currentValueRef.current = defaultValue
          }
        } else {
          if (mounted) {
            setValue(defaultValue)
            currentValueRef.current = defaultValue
          }
        }

        isInitializedRef.current = true
      } catch (error) {
        console.error('[Persistence] Initialization error:', error)
        if (mounted) {
          setValue(defaultValue)
          currentValueRef.current = defaultValue
        }
        isInitializedRef.current = true
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current)
    }
  }, [defaultValue, loadFromSupabase])

  useEffect(() => {
    if (!userId || !isInitializedRef.current) return

    autoSaveIntervalRef.current = setInterval(() => {
      if (currentValueRef.current) {
        saveToSupabase(currentValueRef.current, userId)
      }
    }, AUTO_SAVE_INTERVAL_MS)

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }
  }, [userId, saveToSupabase])

  const setValueAndPersist = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const valueToSet = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev)
        : newValue

      currentValueRef.current = valueToSet

      if (isInitializedRef.current && userId) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveToSupabase(valueToSet, userId)
        }, SAVE_DEBOUNCE_MS)
      }

      return valueToSet
    })
  }, [userId, saveToSupabase])

  const deleteValue = useCallback(async () => {
    if (!userId) return

    // Demo mode: just clear localStorage
    if (isDemoMode) {
      localStorage.removeItem('casinoIdleSlots')
      setValue(defaultValue)
      return
    }

    try {
      await supabase!
        .from('game_states')
        .delete()
        .eq('user_id', userId)

      setValue(defaultValue)
      currentValueRef.current = defaultValue
    } catch (error) {
      console.error('[Persistence] Error deleting data:', error)
    }
  }, [userId, defaultValue])

  const saveImmediately = useCallback(async (): Promise<boolean> => {
    if (!userId || !isInitializedRef.current) return false

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    return await saveToSupabase(currentValueRef.current, userId)
  }, [userId, saveToSupabase])

  return [value, setValueAndPersist, deleteValue, isLoading, userId, saveImmediately, lastSaveTime]
}

export async function migrateLocalDataToUser(): Promise<boolean> {
  console.log('[Persistence] Migration not needed for Supabase')
  return false
}

export { getCurrentUser }
