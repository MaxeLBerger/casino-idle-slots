import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Medal, Sparkle, ArrowUp, CloudArrowUp } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
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

export function Leaderboard({ open, onOpenChange, currentUserId, userLevel }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('coins')
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [playerRanks, setPlayerRanks] = useState<Record<string, number | null>>({})

  useEffect(() => {
    if (open) {
      loadLeaderboards()
    }
  }, [open])

  const loadLeaderboards = async () => {
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
  }

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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-3xl font-bold orbitron flex items-center gap-3">
            <Trophy size={32} weight="fill" className="text-primary" />
            Global Leaderboards
          </DialogTitle>
          <DialogDescription>
            Compete with players from around the world
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LeaderboardCategory)} className="px-4 sm:px-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="w-full flex min-w-max sm:grid sm:grid-cols-6 sm:min-w-0 h-auto gap-1 mb-4 bg-muted/50 p-1">
              {CATEGORIES.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="text-xs sm:text-sm px-3 py-2 h-full whitespace-nowrap sm:whitespace-normal leading-tight data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1"
                >
                  <span className="mr-1 text-lg sm:text-base">{getCategoryIcon(category)}</span>
                  <span className="hidden sm:inline">{getCategoryLabel(category)}</span>
                  <span className="sm:hidden">{category === 'coins' ? 'Coins' : category === 'totalSpins' ? 'Spins' : category === 'biggestWin' ? 'Biggest' : category === 'totalEarnings' ? 'Earned' : category === 'level' ? 'Level' : 'Prestige'}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              {currentUserId && playerRanks[category] && (
                <Card className="mb-4 p-4 bg-accent/10 border-accent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy size={24} weight="fill" className="text-accent" />
                      <div>
                        <div className="font-bold">Your Rank</div>
                        <div className="text-sm text-muted-foreground">
                          {getCategoryLabel(category)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg font-bold orbitron">
                        #{playerRanks[category]}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}

              <ScrollArea className="h-[50vh] pr-4">
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
                            <Card className={`p-3 sm:p-4 ${isCurrentUser ? 'border-2 border-accent bg-accent/5' : ''} ${rank <= 3 ? 'shadow-lg' : ''}`}>
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full ${getRankColor(rank)} flex-shrink-0`}>
                                  {rank <= 3 ? (
                                    <div className="scale-75 sm:scale-100">{getRankIcon(rank)}</div>
                                  ) : (
                                    <span className="font-bold text-sm sm:text-base text-foreground">#{rank}</span>
                                  )}
                                </div>
                                
                                <Avatar className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-border">
                                  <AvatarImage src={entry.avatarUrl} alt={entry.username} />
                                  <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="font-bold text-sm sm:text-lg truncate">
                                      {entry.username}
                                    </div>
                                    {isCurrentUser && (
                                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0 h-5">You</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    Level {entry.level}
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-sm sm:text-2xl font-bold orbitron text-primary">
                                    {formatScore(category, entry.score)}
                                  </div>
                                  {rank <= 3 && (
                                    <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs hidden sm:inline-flex">
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
                    <Trophy size={64} weight="light" className="text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">No rankings yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to claim the top spot!
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <Separator className="my-0" />
        
        <div className="p-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CloudArrowUp size={16} weight="fill" />
            <span>Rankings update in real-time</span>
          </div>
          <Button onClick={loadLeaderboards} variant="outline" size="sm">
            <ArrowUp size={16} className="mr-2" />
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
