import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, SignOut, Trophy, Sparkle, Coins, Lightning, FloppyDisk, Check, Crown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { getPrestigeRank } from '@/lib/prestige'

interface UserProfileProps {
  isLoggedIn: boolean
  username: string
  avatarUrl?: string
  level: number
  experience: number
  experienceToNextLevel: number
  coins: number
  prestigePoints: number
  totalSpins: number
  lifetimeSpins: number
  lifetimeWins: number
  lifetimeBiggestWin: number
  lifetimeEarnings: number
  lastSaveTime?: number
  onLogin: () => void
  onLogout: () => void
  onManualSave?: () => Promise<boolean>
}

export function UserProfile({
  isLoggedIn,
  username,
  avatarUrl,
  level,
  experience,
  experienceToNextLevel,
  coins,
  prestigePoints,
  totalSpins,
  lifetimeSpins,
  lifetimeWins,
  lifetimeBiggestWin,
  lifetimeEarnings,
  lastSaveTime,
  onLogin,
  onLogout,
  onManualSave
}: UserProfileProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const handleManualSave = async () => {
    if (!onManualSave) return
    
    setIsSaving(true)
    const success = await onManualSave()
    setIsSaving(false)
    
    if (success) {
      setJustSaved(true)
      toast.success('Progress saved successfully!', {
        icon: '💾'
      })
      setTimeout(() => setJustSaved(false), 2000)
    } else {
      toast.error('Failed to save progress')
    }
  }

  const [timeSinceSave, setTimeSinceSave] = useState<string>('Never')

  useEffect(() => {
    const updateTime = () => {
      if (!lastSaveTime) {
        setTimeSinceSave('Never')
        return
      }
      const seconds = Math.floor((Date.now() - lastSaveTime) / 1000)
      if (seconds < 60) {
        setTimeSinceSave(`${seconds}s ago`)
        return
      }
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) {
        setTimeSinceSave(`${minutes}m ago`)
        return
      }
      const hours = Math.floor(minutes / 60)
      setTimeSinceSave(`${hours}h ago`)
    }

    updateTime()
    const interval = setInterval(updateTime, 10000)
    return () => clearInterval(interval)
  }, [lastSaveTime])

  const getTimeSinceLastSave = () => timeSinceSave

  if (!isLoggedIn) {
    return (
      <Button
        onClick={onLogin}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <User size={20} weight="fill" className="mr-2" />
        <span className="hidden sm:inline">Login with GitHub</span>
        <span className="sm:hidden">Login</span>
      </Button>
    )
  }

  const progressPercent = (experience / experienceToNextLevel) * 100
  const prestigeRank = getPrestigeRank(prestigePoints)

  return (
    <>
      <Button
        onClick={() => setShowProfile(true)}
        variant="ghost"
        className="flex items-center gap-2 hover:bg-accent/20"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-bold">{username}</span>
          <span className={`text-xs ${prestigeRank.color}`}>{prestigeRank.name}</span>
        </div>
      </Button>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-md p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <User size={24} weight="fill" className="text-primary sm:w-7 sm:h-7" />
              Player Profile
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Your casino stats and progress</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="flex flex-col items-center py-2 sm:py-4">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4 border-4 border-primary/20">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="text-2xl">{username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">{username}</h2>
              <Badge variant="outline" className={`mb-4 sm:mb-6 ${prestigeRank.color} border-current`}>
                <Crown size={14} weight="fill" className="mr-1" />
                {prestigeRank.name} Rank
              </Badge>
            </div>

            <Card className="p-3 sm:p-4 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-semibold">Experience</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {experience} / {experienceToNextLevel}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2 sm:h-3" />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                {experienceToNextLevel - experience} XP to Level {level + 1}
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 bg-card border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={16} weight="fill" className="text-primary sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">Coins</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold orbitron tabular-nums truncate">
                  {coins.toLocaleString()}
                </div>
              </Card>

              <Card className="p-3 sm:p-4 bg-card border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} weight="fill" className="text-accent sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">Prestige</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold orbitron tabular-nums truncate">
                  {prestigePoints}
                </div>
              </Card>

              <Card className="p-3 sm:p-4 bg-card border-secondary/20 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lightning size={16} weight="fill" className="text-secondary sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">Current Run Spins</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold orbitron tabular-nums truncate">
                  {totalSpins.toLocaleString()}
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkle size={16} weight="fill" />
                Lifetime Statistics
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Card className="p-2 sm:p-3 bg-muted/30">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Spins</div>
                  <div className="text-sm sm:text-lg font-bold orbitron tabular-nums truncate">{lifetimeSpins.toLocaleString()}</div>
                </Card>
                <Card className="p-2 sm:p-3 bg-muted/30">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Wins</div>
                  <div className="text-sm sm:text-lg font-bold orbitron tabular-nums truncate">{lifetimeWins.toLocaleString()}</div>
                </Card>
                <Card className="p-2 sm:p-3 bg-muted/30">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Biggest Win</div>
                  <div className="text-sm sm:text-lg font-bold orbitron tabular-nums text-yellow-500 truncate">{lifetimeBiggestWin.toLocaleString()}</div>
                </Card>
                <Card className="p-2 sm:p-3 bg-muted/30">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Earnings</div>
                  <div className="text-sm sm:text-lg font-bold orbitron tabular-nums text-primary truncate">{lifetimeEarnings.toLocaleString()}</div>
                </Card>
              </div>
            </div>

            {onManualSave && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold mb-1">Game Progress</div>
                    <div className="text-xs text-muted-foreground">
                      Last saved: {getTimeSinceLastSave()}
                    </div>
                  </div>
                  {justSaved && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <Check size={24} weight="bold" />
                    </motion.div>
                  )}
                </div>
                <Button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <FloppyDisk size={20} weight="fill" className="mr-2" />
                    </motion.div>
                  ) : (
                    <FloppyDisk size={20} weight="fill" className="mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Progress'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Auto-saves on every action & page close
                </p>
              </Card>
            )}

            <Button
              onClick={onLogout}
              variant="destructive"
              className="w-full"
            >
              <SignOut size={20} className="mr-2" />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
