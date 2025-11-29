import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Medal, Sparkle, ArrowUp, CloudArrowUp } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  getLeaderboard, 
  LeaderboardEntry, 
  LeaderboardCategory,
  getCategoryLabel,
  getCategoryIcon,
  formatScore,
  getPlayerRank
} from '@/lib/leaderboard'

interface LeaderboardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string | null
  userLevel: number
}

const CATEGORIES: LeaderboardCategory[] = ['coins', 'totalSpins', 'biggestWin', 'totalEarnings', 'level', 'prestigePoints']

export function Leaderboard({ open, onOpenChange, currentUserId }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('coins')
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [playerRanks, setPlayerRanks] = useState<Record<string, number | null>>({})

  const loadLeaderboards = useCallback(async () => {
    setIsLoading(true)
    try {
      const data: Record<string, LeaderboardEntry[]> = {}
      const ranks: Record<string, number | null> = {}
      
      for (const category of CATEGORIES) {
        const entries = await getLeaderboard(category)
        data[category] = entries
        
        if (currentUserId) {
          const rank = await getPlayerRank(category, currentUserId)
          ranks[category] = rank
        }
      }
      
      setLeaderboardData(data)
      setPlayerRanks(ranks)
    } catch (error) {
      console.error('[Leaderboard] Error loading leaderboards:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} weight="fill" className="text-yellow-400" />
    if (rank === 2) return <Medal size={24} weight="fill" className="text-gray-400" />
    if (rank === 3) return <Medal size={24} weight="fill" className="text-orange-600" />
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500'
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600'
    return 'bg-muted'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0 block">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 space-y-1 text-left">
          <DialogTitle className="text-lg sm:text-3xl font-bold orbitron flex items-center gap-2 sm:gap-3">
            <Trophy size={20} weight="fill" className="text-primary sm:w-8 sm:h-8 flex-shrink-0" />
            <span>Global Leaderboards</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Compete with players from around the world
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LeaderboardCategory)} className="px-3 sm:px-6 pb-6">
          <div className="mb-4">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LeaderboardCategory)}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="font-medium">{getCategoryLabel(category)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {CATEGORIES.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              {currentUserId && playerRanks[category] && (
                <Card className="mb-3 sm:mb-4 p-3 sm:p-4 bg-accent/10 border-accent flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-accent/20 rounded-full">
                        <Trophy size={16} weight="fill" className="text-accent sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-base">Your Rank</div>
                        <div className="text-[10px] sm:text-sm text-muted-foreground">
                          {getCategoryLabel(category)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm sm:text-lg font-bold orbitron px-2 sm:px-3 py-0.5 sm:py-1">
                      #{playerRanks[category]}
                    </Badge>
                  </div>
                </Card>
              )}

              <div className="pr-2 sm:pr-4 -mr-2 sm:-mr-4">
                <div className="pr-2 sm:pr-4 pb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkle size={32} weight="fill" className="text-primary" />
                    </motion.div>
                  </div>
                ) : leaderboardData[category]?.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {leaderboardData[category].map((entry, index) => {
                        const rank = index + 1
                        const isCurrentUser = entry.userId === currentUserId
                        
                        return (
                          <motion.div
                            key={entry.userId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Card className={`p-2 sm:p-4 ${isCurrentUser ? 'border-2 border-accent bg-accent/5' : ''} ${rank <= 3 ? 'shadow-lg' : ''}`}>
                              <div className="flex items-center gap-2 sm:gap-4">
                                {/* Rank */}
                                <div className={`flex items-center justify-center w-6 h-6 sm:w-12 sm:h-12 rounded-full ${getRankColor(rank)} flex-shrink-0 shadow-sm`}>
                                  {rank <= 3 ? (
                                    <div className="scale-75 sm:scale-100">{getRankIcon(rank)}</div>
                                  ) : (
                                    <span className="font-bold text-xs sm:text-base text-foreground">#{rank}</span>
                                  )}
                                </div>
                                
                                {/* Avatar */}
                                <Avatar className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-border hidden xs:block">
                                  <AvatarImage src={entry.avatarUrl} alt={entry.username} />
                                  <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="font-bold text-xs sm:text-lg truncate leading-tight">
                                      {entry.username}
                                    </div>
                                    {isCurrentUser && (
                                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0 h-4 sm:h-5 flex items-center">You</Badge>
                                    )}
                                  </div>
                                  {category !== 'level' && (
                                    <div className="text-[10px] sm:text-sm text-muted-foreground truncate">
                                      Level {entry.level}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Score */}
                                <div className="text-right pl-1 sm:pl-2">
                                  <div className="text-xs sm:text-2xl font-bold orbitron text-primary whitespace-nowrap">
                                    {formatScore(category, entry.score)}
                                  </div>
                                  {rank <= 3 && (
                                    <Badge variant="outline" className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs hidden sm:inline-flex">
                                      Top {rank}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy size={48} weight="light" className="text-muted-foreground mb-4 sm:w-16 sm:h-16" />
                    <p className="text-base sm:text-lg font-semibold mb-2">No rankings yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Be the first to claim the top spot!
                    </p>
                  </div>
                )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Separator className="my-0" />
        
        <div className="p-3 sm:p-6 pt-2 sm:pt-4 flex items-center justify-between bg-background z-10">
          <div className="flex items-center gap-2 text-[10px] sm:text-sm text-muted-foreground">
            <CloudArrowUp size={14} weight="fill" className="sm:w-4 sm:h-4" />
            <span>Rankings update in real-time</span>
          </div>
          <Button onClick={loadLeaderboards} variant="outline" size="sm" className="h-7 sm:h-9 text-xs sm:text-sm">
            <ArrowUp size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
            Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface LeaderboardButtonProps {
  onClick: () => void
  playerRank: number | null
}

export function LeaderboardButton({ onClick, playerRank }: LeaderboardButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="relative"
    >
      <Trophy size={20} weight="fill" className="mr-2" />
      <span className="hidden md:inline">Leaderboard</span>
      {playerRank && playerRank <= 10 && (
        <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0">
          #{playerRank}
        </Badge>
      )}
    </Button>
  )
}
