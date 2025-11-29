import { supabase, isDemoMode } from './supabase'

export interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string
  score: number
  level: number
  timestamp: number
}

// Demo mode: Return empty leaderboard
const DEMO_LEADERBOARD: LeaderboardEntry[] = []

export interface LeaderboardData {
  entries: LeaderboardEntry[]
  lastUpdated: number
}

export type LeaderboardCategory = 'coins' | 'totalSpins' | 'biggestWin' | 'totalEarnings' | 'level' | 'prestigePoints' | 'diamonds'

const CATEGORY_TO_FIELD: Record<LeaderboardCategory, string> = {
  coins: 'coins',
  totalSpins: 'total_spins',
  biggestWin: 'biggest_win',
  totalEarnings: 'total_earnings',
  level: 'level',
  prestigePoints: 'prestige_points',
  diamonds: 'diamonds'
}

const MAX_LEADERBOARD_SIZE = 100
const CACHE_DURATION = 30000

const leaderboardCache: Record<string, { data: LeaderboardEntry[]; timestamp: number }> = {}

export async function getLeaderboard(category: LeaderboardCategory): Promise<LeaderboardEntry[]> {
  // Demo mode: return empty leaderboard
  if (isDemoMode) {
    console.log('[Leaderboard] Demo mode - leaderboard unavailable')
    return DEMO_LEADERBOARD
  }

  const now = Date.now()
  
  if (leaderboardCache[category] && (now - leaderboardCache[category].timestamp) < CACHE_DURATION) {
    return leaderboardCache[category].data
  }
  
  try {
    let query = supabase!
      .from('leaderboard')
      .select('*')
      .limit(MAX_LEADERBOARD_SIZE)

    const orderField = CATEGORY_TO_FIELD[category]
    query = query.order(orderField, { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error(`[Leaderboard] Error fetching ${category}:`, error)
      return []
    }

    if (!data) return []

    const entries: LeaderboardEntry[] = data.map((row: any) => {
      let score = 0
      
      if (category === 'coins') score = row.coins || 0
      else if (category === 'level') score = row.level || 0
      else if (category === 'prestigePoints') score = row.prestige_points || 0
      else if (category === 'diamonds') score = row.diamonds || 0
      else if (category === 'totalSpins') score = row.total_spins || 0
      else if (category === 'biggestWin') score = row.biggest_win || 0
      else if (category === 'totalEarnings') score = row.total_earnings || 0

      return {
        userId: row.id,
        username: row.username || row.display_name || 'Anonymous',
        avatarUrl: row.avatar || '',
        score,
        level: row.level || 1,
        timestamp: new Date(row.updated_at).getTime()
      }
    })

    entries.sort((a, b) => b.score - a.score)

    leaderboardCache[category] = { data: entries, timestamp: now }
    
    return entries
  } catch (error) {
    console.error(`[Leaderboard] Error fetching ${category}:`, error)
    return []
  }
}

export async function submitScore(): Promise<boolean> {
  return true
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
    coins: 'Current Coins',
    totalSpins: 'Lifetime Spins',
    biggestWin: 'Lifetime Biggest Win',
    totalEarnings: 'Lifetime Earnings',
    level: 'Highest Level',
    prestigePoints: 'Prestige Points',
    diamonds: 'Diamonds'
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
    prestigePoints: '👑',
    diamonds: '💠'
  }
  return icons[category]
}

export function formatScore(category: LeaderboardCategory, score: number): string {
  if (category === 'level') {
    return `Level ${score}`
  }
  return score.toLocaleString()
}
