import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkle, ArrowRight, Warning, Crown, Lightning, Coins } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  calculatePrestigeReward,
  calculatePrestigeMultiplier,
  calculatePrestigeStartingCoins,
  getNextMilestone,
  getUnlockedMilestones,
  formatPrestigeBonus,
  getPrestigeRank,
} from '@/lib/prestige'

interface PrestigeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPrestigePoints: number
  totalEarnings: number
  currentCoins: number
  level: number
  onConfirm: () => void
}

export function PrestigeDialog({
  open,
  onOpenChange,
  currentPrestigePoints,
  totalEarnings,
  currentCoins,
  level,
  onConfirm,
}: PrestigeDialogProps) {
  const [confirming, setConfirming] = useState(false)

  const prestigeReward = calculatePrestigeReward(totalEarnings)
  const newPrestigeTotal = currentPrestigePoints + prestigeReward
  const currentMultiplier = calculatePrestigeMultiplier(currentPrestigePoints)
  const newMultiplier = calculatePrestigeMultiplier(newPrestigeTotal)
  const newStartingCoins = calculatePrestigeStartingCoins(newPrestigeTotal, 200)
  
  const nextMilestone = getNextMilestone(newPrestigeTotal)
  const unlockedMilestones = getUnlockedMilestones(newPrestigeTotal)
  const newlyUnlockedMilestones = unlockedMilestones.filter(
    m => m.points > currentPrestigePoints && m.points <= newPrestigeTotal
  )
  
  const currentRank = getPrestigeRank(currentPrestigePoints)
  const newRank = getPrestigeRank(newPrestigeTotal)

  const handleConfirm = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    onConfirm()
    setConfirming(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setConfirming(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy size={28} weight="fill" className="text-primary" />
            Prestige Confirmation
          </DialogTitle>
          <DialogDescription>
            Review what you'll gain and lose before prestiging
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prestige Reward */}
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkle size={20} weight="fill" className="text-primary" />
                  Prestige Reward
                </h3>
                <p className="text-sm text-muted-foreground">Based on your earnings</p>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-right"
              >
                <div className="text-4xl font-bold text-primary">+{prestigeReward}</div>
                <div className="text-sm text-muted-foreground">Prestige Points</div>
              </motion.div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Total Prestige Points:</span>
              <span className={`font-bold ${currentRank.color}`}>{currentPrestigePoints}</span>
              <ArrowRight size={16} weight="bold" />
              <span className={`font-bold ${newRank.color}`}>{newPrestigeTotal}</span>
            </div>
            {newRank.name !== currentRank.name && (
              <div className="mt-2 p-2 bg-background/50 rounded flex items-center justify-center gap-2">
                <Crown size={16} weight="fill" className={newRank.color} />
                <span className="text-sm font-bold">Rank Up: <span className={newRank.color}>{newRank.name}</span></span>
              </div>
            )}
          </Card>

          {/* Multiplier Boost & Starting Bonus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 bg-card/50 border-border">
              <h3 className="text-base font-bold flex items-center gap-2 mb-2">
                <Lightning size={18} weight="fill" className="text-accent" />
                Multiplier Boost
              </h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-bold">{currentMultiplier.toFixed(2)}x</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New:</span>
                  <span className="font-bold text-accent">{newMultiplier.toFixed(2)}x</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bonus:</span>
                  <span className="font-bold text-green-500">
                    +{((newMultiplier - currentMultiplier) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border">
              <h3 className="text-base font-bold flex items-center gap-2 mb-2">
                <Coins size={18} weight="fill" className="text-primary" />
                Fresh Start
              </h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coins:</span>
                  <span className="font-bold text-primary">{newStartingCoins.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Multiplier:</span>
                  <span className="font-bold text-accent">{formatPrestigeBonus(newPrestigeTotal)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* New Milestones */}
          {newlyUnlockedMilestones.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/10 border-accent/50">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Crown size={20} weight="fill" className="text-accent" />
                New Milestones Unlocked!
              </h3>
              <div className="space-y-2">
                {newlyUnlockedMilestones.map((milestone) => (
                  <motion.div
                    key={milestone.points}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                  >
                    <Badge className="bg-accent text-white">{milestone.points} PP</Badge>
                    <div className="flex-1">
                      <div className="font-semibold">{milestone.bonus}</div>
                      <div className="text-xs text-muted-foreground">
                        +{(milestone.multiplier * 100).toFixed(0)}% permanent bonus
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Next Milestone Progress */}
          {nextMilestone && (
            <Card className="p-4 bg-card/50 border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Next Milestone</span>
                <span className="text-sm text-muted-foreground">
                  {newPrestigeTotal}/{nextMilestone.points} PP
                </span>
              </div>
              <Progress 
                value={(newPrestigeTotal / nextMilestone.points) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">{nextMilestone.bonus}</p>
            </Card>
          )}

          {/* What You'll Lose */}
          <Card className="p-6 bg-destructive/10 border-destructive/50">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-destructive">
              <Warning size={20} weight="fill" />
              What You'll Reset
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Coins:</span>
                <span className="font-mono">{currentCoins.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">All Upgrades:</span>
                <span>Reset to 0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Slot Machines:</span>
                <span>Back to Classic</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-green-500">
                <span>Level & XP:</span>
                <span className="font-bold">✓ Kept (Level {level})</span>
              </div>
              <div className="flex items-center justify-between text-green-500">
                <span>Achievements:</span>
                <span className="font-bold">✓ Kept</span>
              </div>
            </div>
          </Card>

          {/* Confirmation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <AnimatePresence mode="wait">
              {!confirming ? (
                <motion.div
                  key="first-click"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    onClick={handleConfirm}
                  >
                    <Trophy size={20} weight="fill" className="mr-2" />
                    Prestige Now
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm-click"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex-1"
                >
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleConfirm}
                  >
                    <Warning size={20} weight="fill" className="mr-2" />
                    Confirm Reset
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
