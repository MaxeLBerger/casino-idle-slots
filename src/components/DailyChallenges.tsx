import { motion } from 'framer-motion'
import { Calendar, Trophy, Check, Clock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DailyChallenge } from '@/lib/achievements'

interface DailyChallengesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dailyChallenge: DailyChallenge | null
  challengeProgress: number
  challengeCompleted: boolean
  onClaim: () => void
  timeUntilReset: string
}

export function DailyChallenges({
  open,
  onOpenChange,
  dailyChallenge,
  challengeProgress,
  challengeCompleted,
  onClaim,
  timeUntilReset
}: DailyChallengesProps) {
  if (!dailyChallenge) return null

  const progressPercent = Math.min((challengeProgress / dailyChallenge.target) * 100, 100)
  const canClaim = challengeProgress >= dailyChallenge.target && !challengeCompleted

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar size={28} weight="fill" className="text-accent" />
            Daily Challenge
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Clock size={16} />
            Resets in {timeUntilReset}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className={`p-6 relative overflow-hidden ${challengeCompleted ? 'border-primary' : canClaim ? 'border-accent' : 'border-border'}`}>
            {challengeCompleted && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-primary-foreground">
                  <Check size={14} weight="bold" className="mr-1" />
                  Completed
                </Badge>
              </div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">{dailyChallenge.icon}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold orbitron mb-1">{dailyChallenge.title}</h3>
                <p className="text-muted-foreground">{dailyChallenge.description}</p>
              </div>
            </div>

            {!challengeCompleted && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Progress</span>
                  <span className="text-muted-foreground tabular-nums">
                    {challengeProgress} / {dailyChallenge.target}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary">
                <Trophy size={16} weight="fill" className="mr-1" />
                +{dailyChallenge.reward} Coins
              </Badge>
              {dailyChallenge.rewardPrestige && (
                <Badge className="bg-accent/20 text-accent">
                  <Trophy size={16} weight="fill" className="mr-1" />
                  +{dailyChallenge.rewardPrestige} Prestige
                </Badge>
              )}
            </div>

            {canClaim && (
              <Button
                onClick={onClaim}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Trophy size={20} weight="fill" className="mr-2" />
                Claim Reward
              </Button>
            )}

            {challengeCompleted && (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow for a new challenge!
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar size={18} weight="fill" />
              About Daily Challenges
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Complete challenges to earn bonus rewards</li>
              <li>• New challenge available every 24 hours</li>
              <li>• Challenges reset at midnight UTC</li>
              <li>• Progress is tracked automatically</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface DailyChallengeCardProps {
  dailyChallenge: DailyChallenge | null
  challengeProgress: number
  challengeCompleted: boolean
  onClick: () => void
}

export function DailyChallengeCard({
  dailyChallenge,
  challengeProgress,
  challengeCompleted,
  onClick
}: DailyChallengeCardProps) {
  if (!dailyChallenge) return null

  const progressPercent = Math.min((challengeProgress / dailyChallenge.target) * 100, 100)
  const canClaim = challengeProgress >= dailyChallenge.target && !challengeCompleted

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`p-4 cursor-pointer transition-colors hover:bg-accent/10 ${challengeCompleted ? 'border-primary' : canClaim ? 'border-accent' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">{dailyChallenge.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm truncate">{dailyChallenge.title}</h3>
              {challengeCompleted && (
                <Badge variant="default" className="text-xs">
                  <Check size={12} weight="bold" />
                </Badge>
              )}
              {canClaim && (
                <Badge className="bg-accent text-accent-foreground text-xs">
                  Claim!
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {dailyChallenge.description}
            </p>
          </div>
        </div>

        {!challengeCompleted && (
          <>
            <Progress value={progressPercent} className="h-2 mb-2" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground tabular-nums">
                {challengeProgress} / {dailyChallenge.target}
              </span>
              <Badge variant="secondary" className="text-xs">
                +{dailyChallenge.reward} 💰
              </Badge>
            </div>
          </>
        )}

        {challengeCompleted && (
          <div className="text-center py-1">
            <Badge className="bg-primary text-primary-foreground">
              Completed! 🎉
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
