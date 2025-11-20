import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Lock, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ACHIEVEMENTS, Achievement } from '@/lib/achievements'

interface AchievementsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unlockedAchievements: string[]
  achievementProgress: Record<string, number>
  onClaim: (achievementId: string) => void
}

export function Achievements({
  open,
  onOpenChange,
  unlockedAchievements,
  achievementProgress,
  onClaim
}: AchievementsProps) {
  const getAchievementsByCategory = (category: Achievement['category']) => {
    return ACHIEVEMENTS.filter(a => a.category === category)
  }

  const getUnlockedCountByCategory = (category: Achievement['category']) => {
    return ACHIEVEMENTS.filter(a => a.category === category && unlockedAchievements.includes(a.id)).length
  }

  const isUnlocked = (achievementId: string) => unlockedAchievements.includes(achievementId)
  const getProgress = (achievementId: string) => achievementProgress[achievementId] || 0

  const renderAchievement = (achievement: Achievement) => {
    const unlocked = isUnlocked(achievement.id)
    const progress = getProgress(achievement.id)
    const progressPercent = Math.min((progress / achievement.requirement) * 100, 100)
    const canClaim = progress >= achievement.requirement && !unlocked

    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className={`p-4 relative overflow-hidden h-full flex flex-col ${unlocked ? 'border-primary' : canClaim ? 'border-accent' : ''}`}>
          {unlocked && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-primary-foreground">
                <Check size={14} weight="bold" className="mr-1" />
                Unlocked
              </Badge>
            </div>
          )}
          
          <div className="flex gap-4 flex-1">
            <div className={`text-4xl flex-shrink-0 ${!unlocked && !canClaim ? 'grayscale opacity-50' : ''}`}>
              {achievement.icon}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-lg leading-tight">{achievement.title}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 flex-1">
                {achievement.description}
              </p>
              
              {!unlocked && (
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{progress} / {achievement.requirement}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  +{achievement.rewardCoins} 💰
                </Badge>
                {achievement.rewardPrestige && (
                  <Badge variant="secondary" className="text-xs">
                    +{achievement.rewardPrestige} 🏆
                  </Badge>
                )}
              </div>

              {canClaim && (
                <Button
                  onClick={() => onClaim(achievement.id)}
                  size="sm"
                  className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Trophy size={16} weight="fill" className="mr-2" />
                  Claim Reward
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  const categories: { value: Achievement['category']; label: string; icon: string }[] = [
    { value: 'spins', label: 'Spins', icon: '🎰' },
    { value: 'wins', label: 'Wins', icon: '🎉' },
    { value: 'earnings', label: 'Earnings', icon: '💰' },
    { value: 'upgrades', label: 'Upgrades', icon: '⬆️' },
    { value: 'prestige', label: 'Prestige', icon: '👑' },
    { value: 'special', label: 'Special', icon: '✨' }
  ]

  const totalAchievements = ACHIEVEMENTS.length
  const unlockedCount = unlockedAchievements.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Trophy size={28} weight="fill" className="text-primary" />
            Achievements
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>Unlocked {unlockedCount} of {totalAchievements}</span>
            <Progress value={(unlockedCount / totalAchievements) * 100} className="h-2 w-32" />
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="spins" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-6 mb-4">
            {categories.map(cat => {
              const count = getUnlockedCountByCategory(cat.value)
              return (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs relative">
                  <span className="mr-1">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] border border-border bg-background shadow-sm"
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            {categories.map(cat => (
              <TabsContent key={cat.value} value={cat.value} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                    {getAchievementsByCategory(cat.value).map(achievement => 
                      renderAchievement(achievement)
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface AchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  if (!achievement) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.8 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
    >
      <Card className="p-4 bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg text-primary-foreground">Achievement Unlocked!</h3>
                <p className="text-sm text-primary-foreground/90 font-semibold">{achievement.title}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-primary-foreground hover:bg-white/20 h-6 w-6 p-0"
              >
                <X size={16} />
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/80 mt-1">{achievement.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-white/20 text-primary-foreground text-xs">
                +{achievement.rewardCoins} 💰
              </Badge>
              {achievement.rewardPrestige && (
                <Badge className="bg-white/20 text-primary-foreground text-xs">
                  +{achievement.rewardPrestige} 🏆
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
