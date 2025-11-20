import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Coins, Trophy, TrendUp, ChartBar, ArrowRight } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { SpinResult } from '@/types/game.types'

interface SpinHistoryProps {
  history: SpinResult[]
  totalSpins: number
  totalWins: number
  biggestWin: number
  totalEarnings: number
  rtp?: number
}

export function SpinHistory({ 
  history, 
  totalSpins, 
  totalWins, 
  biggestWin, 
  totalEarnings,
  rtp = 97.5 // Default theoretical RTP if not calculated
}: SpinHistoryProps) {
  const recentSpins = history.slice(0, 50) // Show last 50 spins

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card/30">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Clock size={18} className="text-muted-foreground" />
            Recent Activity
          </h3>
          <Badge variant="outline" className="text-xs">
            Last 50 Spins
          </Badge>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="divide-y divide-border/50">
            {recentSpins.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No spins recorded yet. Start playing to see your history!
              </div>
            ) : (
              recentSpins.map((spin, index) => (
                <div key={spin.id || spin.timestamp} className="p-3 flex items-center justify-between hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${spin.isWin ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`} />
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {spin.machineName || 'Classic Slot'}
                        {spin.isWin && (spin.multiplier || 0) > 1 && (
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            {spin.multiplier}x
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(spin.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold font-mono ${spin.isWin ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {spin.isWin ? '+' : ''}{spin.winAmount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}