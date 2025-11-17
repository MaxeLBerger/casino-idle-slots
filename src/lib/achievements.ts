export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: number
  rewardCoins: number
  rewardPrestige?: number
  category: 'spins' | 'wins' | 'earnings' | 'upgrades' | 'prestige' | 'special'
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-spin',
    title: 'First Spin',
    description: 'Spin the slot machine for the first time',
    icon: '🎰',
    requirement: 1,
    rewardCoins: 50,
    category: 'spins'
  },
  {
    id: 'spin-master',
    title: 'Spin Master',
    description: 'Complete 50 spins',
    icon: '⚡',
    requirement: 50,
    rewardCoins: 500,
    category: 'spins'
  },
  {
    id: 'spin-legend',
    title: 'Spin Legend',
    description: 'Complete 500 spins',
    icon: '🌟',
    requirement: 500,
    rewardCoins: 5000,
    rewardPrestige: 1,
    category: 'spins'
  },
  {
    id: 'first-win',
    title: 'First Win',
    description: 'Win your first jackpot',
    icon: '🎉',
    requirement: 1,
    rewardCoins: 100,
    category: 'wins'
  },
  {
    id: 'big-winner',
    title: 'Big Winner',
    description: 'Win 1000 coins in a single spin',
    icon: '💰',
    requirement: 1000,
    rewardCoins: 500,
    category: 'wins'
  },
  {
    id: 'mega-winner',
    title: 'Mega Winner',
    description: 'Win 5000 coins in a single spin',
    icon: '💎',
    requirement: 5000,
    rewardCoins: 2500,
    rewardPrestige: 1,
    category: 'wins'
  },
  {
    id: 'jackpot-hunter',
    title: 'Jackpot Hunter',
    description: 'Hit a jackpot with matching special symbols',
    icon: '💰',
    requirement: 1,
    rewardCoins: 5000,
    rewardPrestige: 2,
    category: 'wins'
  },
  {
    id: 'jackpot-legend',
    title: 'Jackpot Legend',
    description: 'Win 10000 coins in a single spin',
    icon: '👑',
    requirement: 10000,
    rewardCoins: 10000,
    rewardPrestige: 3,
    category: 'wins'
  },
  {
    id: 'millionaire',
    title: 'Millionaire',
    description: 'Earn a total of 1,000,000 coins',
    icon: '🏆',
    requirement: 1000000,
    rewardCoins: 10000,
    rewardPrestige: 2,
    category: 'earnings'
  },
  {
    id: 'upgrade-beginner',
    title: 'Upgrade Beginner',
    description: 'Purchase your first upgrade',
    icon: '⬆️',
    requirement: 1,
    rewardCoins: 100,
    category: 'upgrades'
  },
  {
    id: 'upgrade-expert',
    title: 'Upgrade Expert',
    description: 'Reach level 10 in any upgrade',
    icon: '🔥',
    requirement: 10,
    rewardCoins: 1000,
    category: 'upgrades'
  },
  {
    id: 'prestige-first',
    title: 'Prestige Master',
    description: 'Prestige for the first time',
    icon: '👑',
    requirement: 1,
    rewardCoins: 1000,
    category: 'prestige'
  },
  {
    id: 'prestige-veteran',
    title: 'Prestige Veteran',
    description: 'Reach 10 prestige points',
    icon: '🌠',
    requirement: 10,
    rewardCoins: 5000,
    rewardPrestige: 2,
    category: 'prestige'
  },
  {
    id: 'lucky-streak',
    title: 'Lucky Streak',
    description: 'Win 5 times in a row',
    icon: '🍀',
    requirement: 5,
    rewardCoins: 1000,
    category: 'special'
  },
  {
    id: 'dedicated-player',
    title: 'Dedicated Player',
    description: 'Play for 7 consecutive days',
    icon: '📅',
    requirement: 7,
    rewardCoins: 2000,
    rewardPrestige: 1,
    category: 'special'
  }
]

export interface DailyChallenge {
  id: string
  title: string
  description: string
  icon: string
  type: 'spins' | 'wins' | 'earnings' | 'bigWin'
  target: number
  reward: number
  rewardPrestige?: number
}

export function generateDailyChallenge(date: string): DailyChallenge {
  const seed = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (seed * 9301 + 49297) % 233280 / 233280
  
  const challenges: Omit<DailyChallenge, 'id'>[] = [
    {
      title: 'Spin Frenzy',
      description: 'Complete 20 spins',
      icon: '🎰',
      type: 'spins',
      target: 20,
      reward: 500
    },
    {
      title: 'Win Streak',
      description: 'Win 5 times',
      icon: '🎯',
      type: 'wins',
      target: 5,
      reward: 800
    },
    {
      title: 'Coin Collector',
      description: 'Earn 5000 coins',
      icon: '💰',
      type: 'earnings',
      target: 5000,
      reward: 1000
    },
    {
      title: 'Big Win Challenge',
      description: 'Win 1000 coins in a single spin',
      icon: '💎',
      type: 'bigWin',
      target: 1000,
      reward: 1500,
      rewardPrestige: 1
    },
    {
      title: 'Spin Master',
      description: 'Complete 50 spins',
      icon: '⚡',
      type: 'spins',
      target: 50,
      reward: 2000,
      rewardPrestige: 1
    },
    {
      title: 'Lucky Day',
      description: 'Win 10 times',
      icon: '🍀',
      type: 'wins',
      target: 10,
      reward: 1500
    },
    {
      title: 'Fortune Seeker',
      description: 'Earn 10000 coins',
      icon: '🌟',
      type: 'earnings',
      target: 10000,
      reward: 2500,
      rewardPrestige: 1
    }
  ]
  
  const selectedChallenge = challenges[Math.floor(random * challenges.length)]
  
  return {
    id: `daily-${date}`,
    ...selectedChallenge
  }
}

let achievementAudioContext: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  
  if (!achievementAudioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        achievementAudioContext = new AudioContextClass()
      }
    } catch (error) {
      console.warn('Failed to create AudioContext:', error)
      return null
    }
  }
  
  return achievementAudioContext
}

export function playAchievementSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const notes = [659.25, 783.99, 1046.50, 1318.51]
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1)
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.3)
    
    oscillator.start(ctx.currentTime + index * 0.1)
    oscillator.stop(ctx.currentTime + index * 0.1 + 0.3)
  })
}
