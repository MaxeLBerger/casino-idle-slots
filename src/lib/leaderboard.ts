import { getCurrentUser } from './persistence'

export interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string
  score: number
  level: number
  timestamp: number
}

export interface LeaderboardData {
  entries: LeaderboardEntry[]
  lastUpdated: number
}

export type LeaderboardCategory = 'coins' | 'totalSpins' | 'biggestWin' | 'totalEarnings' | 'level' | 'prestigePoints'

const LEADERBOARD_KEYS: Record<LeaderboardCategory, string> = {
  coins: 'leaderboard-coins',
  totalSpins: 'leaderboard-totalSpins',
  biggestWin: 'leaderboard-biggestWin',
  totalEarnings: 'leaderboard-totalEarnings',
  level: 'leaderboard-level',
  prestigePoints: 'leaderboard-prestigePoints'
}

const MAX_LEADERBOARD_SIZE = 100
const CACHE_DURATION = 30000

const leaderboardCache: Record<string, { data: LeaderboardData; timestamp: number }> = {}

export async function getLeaderboard(category: LeaderboardCategory): Promise<LeaderboardEntry[]> {
  const key = LEADERBOARD_KEYS[category]
  const now = Date.now()
  
  if (leaderboardCache[key] && (now - leaderboardCache[key].timestamp) < CACHE_DURATION) {
    return leaderboardCache[key].data.entries
  }
  
  try {
    const data = await window.spark.kv.get<LeaderboardData>(key)
    
    if (data && data.entries) {
      leaderboardCache[key] = { data, timestamp: now }
      return data.entries
    }
    
    return []
  } catch (error) {
    console.error(`[Leaderboard] Error fetching ${category}:`, error)
    return []
  }
}

export async function submitScore(category: LeaderboardCategory, score: number, level: number): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return false
    }
    
    const key = LEADERBOARD_KEYS[category]
    const data = await window.spark.kv.get<LeaderboardData>(key)
    
    const entries = data?.entries || []
    
    const existingIndex = entries.findIndex(e => e.userId === user.id.toString())
    
    if (existingIndex !== -1) {
      if (entries[existingIndex].score >= score) {
        return false
      }
      entries.splice(existingIndex, 1)
    }
    
    const newEntry: LeaderboardEntry = {
      userId: user.id.toString(),
      username: user.login,
      avatarUrl: user.avatarUrl,
      score,
      level,
      timestamp: Date.now()
    }
    
    entries.push(newEntry)
    entries.sort((a, b) => b.score - a.score)
    
    const trimmedEntries = entries.slice(0, MAX_LEADERBOARD_SIZE)
    
    const newData: LeaderboardData = {
      entries: trimmedEntries,
      lastUpdated: Date.now()
    }
    
    await window.spark.kv.set(key, newData)
    
    delete leaderboardCache[key]
    
    return true
  } catch (error) {
    console.error(`[Leaderboard] Error submitting score for ${category}:`, error)
    return false
  }
}

export async function getPlayerRank(category: LeaderboardCategory, userId: string): Promise<number | null> {
  try {
    const entries = await getLeaderboard(category)
    const index = entries.findIndex(e => e.userId === userId)
    return index !== -1 ? index + 1 : null
  } catch (error) {
    console.error(`[Leaderboard] Error getting player rank:`, error)
    return null
  }
}

export function getCategoryLabel(category: LeaderboardCategory): string {
  const labels: Record<LeaderboardCategory, string> = {
    coins: 'Total Coins',
    totalSpins: 'Total Spins',
    biggestWin: 'Biggest Win',
    totalEarnings: 'Total Earnings',
    level: 'Highest Level',
    prestigePoints: 'Prestige Points'
  }
  return labels[category]
}

export function getCategoryIcon(category: LeaderboardCategory): string {
  const icons: Record<LeaderboardCategory, string> = {
    coins: '💰',
    totalSpins: '🎰',
    biggestWin: '💎',
    totalEarnings: '💵',
    level: '⭐',
    prestigePoints: '👑'
  }
  return icons[category]
}

export function formatScore(category: LeaderboardCategory, score: number): string {
  if (category === 'level') {
    return `Level ${score}`
  }
  return score.toLocaleString()
}
