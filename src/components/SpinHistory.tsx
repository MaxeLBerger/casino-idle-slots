import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChartLineUp,
  Coins,
  Flame,
  Gauge,
} from '@phosphor-icons/react'
import { format, formatDistanceToNow } from 'date-fns'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { SpinResult } from '@/types/game.types'

type TimeframeValue = '24h' | '7d' | '30d' | 'all'
type ResultFilterValue = 'all' | 'wins' | 'losses' | 'jackpots'

const HOUR_MS = 1000 * 60 * 60
const DAY_MS = HOUR_MS * 24
const TIMEFRAMES: { value: TimeframeValue; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'all', label: 'All' },
]
const TIMEFRAME_TO_DURATION: Record<TimeframeValue, number | null> = {
  '24h': HOUR_MS * 24,
  '7d': DAY_MS * 7,
  '30d': DAY_MS * 30,
  all: null,
}
const TIMEFRAME_COPY: Record<TimeframeValue, string> = {
  '24h': 'the last 24 hours',
  '7d': 'the last 7 days',
  '30d': 'the last 30 days',
  all: 'your recorded history',
}
const RESULT_FILTERS: { value: ResultFilterValue; label: string }[] = [
  { value: 'all', label: 'All outcomes' },
  { value: 'wins', label: 'Wins only' },
  { value: 'losses', label: 'Losses only' },
  { value: 'jackpots', label: 'Jackpots' },
]
const WIN_TIERS = [
  {
    id: 'ultra',
    label: 'Ultra Win',
    minMultiplier: 50,
    badge: 'bg-fuchsia-500/20 text-fuchsia-200',
  },
  {
    id: 'mega',
    label: 'Mega Win',
    minMultiplier: 20,
    badge: 'bg-cyan-500/20 text-cyan-200',
  },
  {
    id: 'big',
    label: 'Big Win',
    minMultiplier: 5,
    badge: 'bg-amber-500/20 text-amber-200',
  },
] as const

type WinTier = (typeof WIN_TIERS)[number]

const formatFullCurrency = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})
const formatCompactCurrency = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCurrency = (
  value: number,
  options?: { compact?: boolean; withSign?: boolean }
) => {
  const absolute = Math.abs(value)
  const formatter = options?.compact ? formatCompactCurrency : formatFullCurrency
  const formatted = formatter.format(absolute)
  if (!options?.withSign) {
    return formatted
  }
  return `${value >= 0 ? '+' : '-'}${formatted}`
}

const getWinTier = (spin: SpinResult): WinTier | null => {
  if (!spin.isWin) return null
  const ratio = spin.betAmount > 0 ? spin.winAmount / spin.betAmount : spin.multiplier || 0
  if (!ratio) return null
  return WIN_TIERS.find((tier) => ratio >= tier.minMultiplier) || null
}

const chartConfig = {
  net: {
    label: 'Net Win',
    color: 'var(--chart-1)',
  },
}

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
  rtp = 97.5,
}: SpinHistoryProps) {
  const [timeframe, setTimeframe] = useState<TimeframeValue>('7d')
  const [machineFilter, setMachineFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<ResultFilterValue>('all')
  const [selectedSpin, setSelectedSpin] = useState<SpinResult | null>(null)

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => b.timestamp - a.timestamp),
    [history]
  )

  const machineOptions = useMemo(() => {
    const set = new Set<string>()
    sortedHistory.forEach((spin) => {
      if (spin.machineName) {
        set.add(spin.machineName)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [sortedHistory])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0)
    return () => clearTimeout(timer)
  }, [timeframe, sortedHistory])

  const filteredHistory = useMemo(() => {
    const duration = TIMEFRAME_TO_DURATION[timeframe]
    return sortedHistory.filter((spin) => {
      if (duration && now - spin.timestamp > duration) return false
      if (machineFilter !== 'all' && spin.machineName !== machineFilter) return false
      if (resultFilter === 'wins' && !spin.isWin) return false
      if (resultFilter === 'losses' && spin.isWin) return false
      if (resultFilter === 'jackpots' && getWinTier(spin)?.id !== 'ultra') return false
      return true
    })
  }, [sortedHistory, timeframe, machineFilter, resultFilter, now])

  const aggregates = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        total: 0,
        wins: 0,
        betVolume: 0,
        winVolume: 0,
        net: 0,
        bestSpin: null as SpinResult | null,
        hotMachine: null as
          | { name: string; spins: number; wins: number; net: number }
          | null,
      }
    }

    let wins = 0
    let betVolume = 0
    let winVolume = 0
    let net = 0
    let bestSpin: SpinResult | null = null
    const machineMap = new Map<
      string,
      { spins: number; wins: number; net: number }
    >()

    filteredHistory.forEach((spin) => {
      betVolume += spin.betAmount
      winVolume += spin.winAmount
      net += spin.winAmount - spin.betAmount
      if (spin.isWin) wins += 1
      if (!bestSpin || spin.winAmount > bestSpin.winAmount) {
        bestSpin = spin
      }

      const key = spin.machineName || 'Classic Slot'
      const entry = machineMap.get(key) || { spins: 0, wins: 0, net: 0 }
      entry.spins += 1
      if (spin.isWin) entry.wins += 1
      entry.net += spin.winAmount - spin.betAmount
      machineMap.set(key, entry)
    })

    const hotEntry = Array.from(machineMap.entries())
      .sort((a, b) => b[1].net - a[1].net || b[1].wins - a[1].wins)[0]

    return {
      total: filteredHistory.length,
      wins,
      betVolume,
      winVolume,
      net,
      bestSpin,
      hotMachine: hotEntry
        ? { name: hotEntry[0], ...hotEntry[1] }
        : null,
    }
  }, [filteredHistory])

  const actualWinRate = aggregates.total
    ? (aggregates.wins / aggregates.total) * 100
    : 0
  const actualRtp = aggregates.betVolume
    ? (aggregates.winVolume / aggregates.betVolume) * 100
    : 0
  const rtpDelta = actualRtp - rtp

  const timelineData = useMemo(() => {
    if (filteredHistory.length === 0) return []
    const bucketSize = timeframe === '24h' ? HOUR_MS : DAY_MS
    const buckets = new Map<
      number,
      { timestamp: number; label: string; net: number }
    >()

    filteredHistory.forEach((spin) => {
      const bucketTimestamp =
        Math.floor(spin.timestamp / bucketSize) * bucketSize
      const date = new Date(bucketTimestamp)
      const label = timeframe === '24h' ? format(date, 'HH:mm') : format(date, 'MMM d')
      const bucket = buckets.get(bucketTimestamp) || {
        timestamp: bucketTimestamp,
        label,
        net: 0,
      }
      bucket.net += spin.winAmount - spin.betAmount
      buckets.set(bucketTimestamp, bucket)
    })

    return Array.from(buckets.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    )
  }, [filteredHistory, timeframe])

  const recentSpins = filteredHistory.slice(0, 50)

  const resetFilters = () => {
    setMachineFilter('all')
    setResultFilter('all')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Gauge size={18} />}
          label="Win Rate"
          value={aggregates.total ? `${actualWinRate.toFixed(1)}%` : '—'}
          hint={`${aggregates.wins}/${aggregates.total || 0} spins in view`}
        />
        <SummaryCard
          icon={<ChartLineUp size={18} />}
          label="Realized RTP"
          value={aggregates.betVolume ? `${actualRtp.toFixed(1)}%` : '—'}
          pill={
            aggregates.betVolume
              ? `${rtpDelta >= 0 ? '+' : ''}${rtpDelta.toFixed(1)}% vs ${rtp.toFixed(1)}%`
              : undefined
          }
          pillVariant={rtpDelta >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          icon={<Coins size={18} />}
          label="Net Earnings"
          value={formatCurrency(aggregates.net, {
            compact: true,
            withSign: true,
          })}
          hint={`Lifetime earnings`}
          pillVariant={aggregates.net >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          icon={<Flame size={18} />}
          label="Hottest Machine"
          value={aggregates.hotMachine?.name || 'No data yet'}
          hint={
            aggregates.hotMachine
              ? `${(
                  (aggregates.hotMachine.wins /
                    aggregates.hotMachine.spins) *
                  100
                ).toFixed(0)}% win rate`
              : 'Spin to unlock insights'
          }
        />
      </div>

      <Card className="border-white/5 bg-card/40 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Profit Curve</p>
            <p className="text-xs text-muted-foreground">
              Net outcome across {TIMEFRAME_COPY[timeframe]}
            </p>
          </div>
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeframeValue)}>
            <TabsList>
              {TIMEFRAMES.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="p-4">
          <div className="h-[220px] w-full">
            {timelineData.length > 1 ? (
              <ChartContainer config={chartConfig} className="h-full">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-net)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-net)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeOpacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <ChartTooltip
                    cursor={{ stroke: 'var(--color-net)', strokeOpacity: 0.2 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-xs uppercase text-muted-foreground">
                              Net
                            </span>
                            <span className="font-mono text-sm">
                              {formatCurrency(Number(value), { withSign: true })}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="net"
                    stroke="var(--color-net)"
                    strokeWidth={2}
                    fill="url(#netGradient)"
                    fillOpacity={1}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Not enough spins to render a trend yet.
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-white/5 bg-card/40 backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={machineFilter} onValueChange={setMachineFilter}>
              <SelectTrigger size="sm" className="min-w-[160px] text-xs">
                <SelectValue placeholder="All machines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All machines</SelectItem>
                {machineOptions.map((machine) => (
                  <SelectItem key={machine} value={machine}>
                    {machine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={resultFilter}
              onValueChange={(value) => setResultFilter(value as ResultFilterValue)}
            >
              <SelectTrigger size="sm" className="min-w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULT_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" type="button" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {recentSpins.length} spins from {TIMEFRAME_COPY[timeframe]}.
          </p>
        </div>
        <ScrollArea className="h-[360px]">
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {recentSpins.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center text-sm text-muted-foreground"
                >
                  No spins recorded yet. Hit the reels to generate telemetry.
                </motion.div>
              ) : (
                recentSpins.map((spin) => {
                  const tier = getWinTier(spin)
                  return (
                    <motion.button
                      type="button"
                      key={spin.id || `${spin.timestamp}-${spin.betAmount}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => setSelectedSpin(spin)}
                      className="flex w-full items-center justify-between gap-4 bg-white/0 px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-2 rounded-full ${spin.isWin ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]' : 'bg-slate-500'}`}
                        />
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            {spin.machineName || 'Classic Slot'}
                            {tier && (
                              <Badge className={`text-[10px] ${tier.badge}`}>
                                {tier.label}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(spin.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-right font-mono text-sm ${spin.isWin ? 'text-emerald-300' : 'text-muted-foreground'}`}>
                          {formatCurrency(spin.winAmount, {
                            withSign: spin.isWin,
                          })}
                        </div>
                        <ArrowRight size={16} className="text-muted-foreground" />
                      </div>
                    </motion.button>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Card>

      <Drawer
        open={Boolean(selectedSpin)}
        onOpenChange={(open) => {
          if (!open) setSelectedSpin(null)
        }}
        direction="right"
      >
        <DrawerContent className="w-full max-w-lg border-l border-white/5 bg-background/95">
          <DrawerHeader>
            <DrawerTitle className="text-white">
              Spin breakdown
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              {selectedSpin?.machineName || 'Classic Slot'} ·{' '}
              {selectedSpin ? format(selectedSpin.timestamp, 'PPpp') : ''}
            </DrawerDescription>
          </DrawerHeader>
          {selectedSpin && (
            <div className="space-y-4 px-4 pb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <StatPill label="Bet" value={`${formatCurrency(selectedSpin.betAmount)}`} />
                <StatPill label="Win" value={formatCurrency(selectedSpin.winAmount)} highlight={selectedSpin.isWin} />
                <StatPill
                  label="Multiplier"
                  value={`x${(
                    selectedSpin.multiplier ||
                    (selectedSpin.betAmount > 0
                      ? selectedSpin.winAmount / selectedSpin.betAmount
                      : 0)
                  ).toFixed(2)}`}
                />
                <StatPill
                  label="Net"
                  value={formatCurrency(selectedSpin.winAmount - selectedSpin.betAmount, {
                    withSign: true,
                  })}
                  highlight={selectedSpin.winAmount - selectedSpin.betAmount >= 0}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Symbols
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedSpin.symbols?.length ? (
                    selectedSpin.symbols.map((symbol, index) => (
                      <div
                        key={`${symbol}-${index}`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-white"
                      >
                        {symbol}
                      </div>
                    ))
                  ) : (
                    <p className="col-span-3 text-xs text-muted-foreground">
                      Symbols unavailable for this spin.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedSpin.isWin
                    ? 'Win recorded in history and eligible for streak bonuses.'
                    : 'Loss counted toward RTP balancing.'}
                </p>
              </div>
            </div>
          )}
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="secondary" type="button" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

interface SummaryCardProps {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  pill?: string
  pillVariant?: 'positive' | 'negative'
}

function SummaryCard({ icon, label, value, hint, pill, pillVariant }: SummaryCardProps) {
  return (
    <Card className="border-white/5 bg-gradient-to-br from-white/5 to-white/0 p-4 text-white backdrop-blur">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {pill && (
        <div
          className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${pillVariant === 'negative' ? 'bg-rose-500/10 text-rose-200' : 'bg-emerald-500/10 text-emerald-200'}`}
        >
          {pill}
        </div>
      )}
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}

interface StatPillProps {
  label: string
  value: string
  highlight?: boolean
}

function StatPill({ label, value, highlight }: StatPillProps) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-emerald-300' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}