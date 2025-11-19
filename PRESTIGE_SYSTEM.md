# Prestige System - Implementation Guide

## Overview
The prestige system has been completely redesigned to maximize player dopamine response and create a compelling progression loop. This document explains the implementation details and best practices.

## Core Philosophy

The redesigned prestige system follows these key principles:

1. **Clear Value Proposition**: Players always know exactly what they'll get
2. **Safety First**: Two-click confirmation prevents accidental resets
3. **Immediate Gratification**: Tangible benefits visible immediately after prestige
4. **Long-term Goals**: Milestone system creates aspirational targets
5. **Accelerated Progression**: Multipliers make each run faster than the last

## Technical Implementation

### 1. Prestige Multiplier System

Location: `src/lib/prestige.ts`

```typescript
calculatePrestigeMultiplier(prestigePoints: number): number
```

**Formula:**
- Base: 1 + (prestigePoints × 0.01)
- Plus milestone bonuses:
  - 5 PP: +5%
  - 10 PP: +10%
  - 20 PP: +15%
  - 50 PP: +25%

**Example:**
- 0 PP = 1.00x (no bonus)
- 10 PP = 1.10x base + 0.10 milestone = 1.20x total
- 20 PP = 1.20x base + 0.15 milestone = 1.35x total
- 50 PP = 1.50x base + 0.25 milestone = 1.75x total

**Application:**
The multiplier is applied to:
- All spin winnings (including jackpots)
- Idle income per second
- Offline earnings

### 2. Scaling Prestige Rewards

Location: `src/constants/game.constants.ts`

```typescript
PRESTIGE_CONFIG.EARNINGS_TIERS
```

Prestige points awarded are based on total earnings in current run:

| Total Earnings | Prestige Points | Difficulty |
|---------------|-----------------|------------|
| 10,000        | 1               | Easy       |
| 50,000        | 2               | Medium     |
| 100,000       | 3               | Hard       |
| 250,000       | 5               | Very Hard  |
| 500,000       | 8               | Extreme    |
| 1,000,000     | 12              | Legendary  |

**Benefits:**
- Encourages players to push further before prestiging
- Creates mini-goals within each prestige run
- Rewards patience with exponentially better returns

### 3. Starting Coins Bonus

```typescript
calculatePrestigeStartingCoins(prestigePoints, baseCoins): number
```

**Formula:** baseCoins + (prestigePoints × 100)

**Examples:**
- 0 PP: 200 coins
- 10 PP: 1,200 coins
- 50 PP: 5,200 coins

**Purpose:** Allows players to skip the initial grind and jump straight into meaningful gameplay.

### 4. Prestige Confirmation Dialog

Location: `src/components/PrestigeDialog.tsx`

**Features:**
- Preview of prestige point reward
- Current vs. new multiplier comparison
- Starting coins calculation
- Milestone progress display
- List of what's kept vs. reset
- Two-click confirmation (first click shows warning, second confirms)

**UI Elements:**
- Gradient cards showing gains (green/gold)
- Warning card showing losses (red)
- Progress bar for next milestone
- Animated milestone unlock cards
- Real-time calculations

### 5. Visual Feedback System

**Prestige Button States:**
1. **Locked** (< 10k earnings):
   - Shows progress bar
   - Displays current/required earnings
   - Lock icon

2. **Ready** (≥ 10k earnings):
   - Pulsing "Ready!" badge
   - Shows exact reward preview
   - Shows new multiplier
   - Sparkle icon

**Statistics Display:**
- Prestige bonus multiplier card (when > 0 PP)
- Gradient text showing current multiplier
- Applied to idle income display
- Prominent placement in stats section

**Celebration Sequence:**
1. Prestige sound effect (ascending melody)
2. Ultra-intense confetti (250 particles)
3. Custom prestige banner ("PRESTIGE!" with crown emoji)
4. Toast notification with multiplier info
5. 5-second duration

## Gameplay Flow

### First-Time Player Experience

1. **Start**: 200 coins, 1.00x multiplier
2. **Learning**: Spin, upgrade, understand mechanics
3. **First Prestige**: At 10k earnings
   - Gain 1 PP
   - Get 300 starting coins (200 + 100)
   - See 1.01x multiplier in stats
   - Notice faster progression immediately

### Veteran Player Experience

1. **Late Game**: 50 PP, 1.75x multiplier
2. **New Run**: Start with 5,200 coins
3. **Fast Progress**: All earnings 1.75x higher
4. **Milestones**: Working toward next achievement
5. **Optimization**: Trying to reach 1M earnings for 12 PP

## Achievement System

Location: `src/lib/achievements.ts`

### Prestige Achievements

1. **Prestige Master** (1 PP)
   - Reward: 1,000 coins
   - "Prestige for the first time"

2. **Prestige Veteran** (10 PP)
   - Reward: 5,000 coins + 2 PP
   - "Reach 10 prestige points"

3. **Prestige Champion** (20 PP)
   - Reward: 10,000 coins + 3 PP
   - "Reach 20 prestige points"

4. **Prestige Legend** (50 PP)
   - Reward: 50,000 coins + 10 PP
   - "Reach 50 prestige points"

5. **Prestige God** (100 PP)
   - Reward: 100,000 coins + 25 PP
   - "Reach 100 prestige points"

**Note:** Achievement rewards include prestige points, creating a positive feedback loop.

## Dopamine Trigger Analysis

### Anticipation Phase
- Progress bar fills → creates anticipation
- Preview shows exact rewards → builds excitement
- "Ready!" badge pulses → signals opportunity

### Decision Phase
- Confirmation dialog → gives player control
- Detailed preview → removes uncertainty
- Two-click safety → prevents regret

### Reward Phase
- Epic celebration → validates decision
- Immediate benefits → tangible gains
- Visible multiplier → ongoing satisfaction

### Progression Phase
- Faster earnings → competence feeling
- Milestone targets → creates goals
- Achievement unlocks → surprise rewards

## Best Practices for Future Development

### Adding New Prestige Features

1. **Always preview**: Show players what they'll get before committing
2. **Clear math**: Make formulas transparent and understandable
3. **Immediate feedback**: Benefits should be visible right away
4. **Long-term goals**: Create aspirational milestones
5. **Celebration**: Big moments deserve big celebrations

### Balancing Guidelines

1. **Early Game**: Should feel rewarding, not grindy
   - First prestige at 10k is achievable in ~10-15 minutes
   - 1 PP provides noticeable but not overpowered boost

2. **Mid Game**: Should have clear progression path
   - Each prestige tier roughly doubles previous requirement
   - Multiplier benefits are meaningful but not game-breaking

3. **Late Game**: Should be challenging but fair
   - 1M earnings for 12 PP is aspirational
   - Milestone bonuses provide substantial power spikes

### Testing Checklist

- [ ] Prestige button shows correct calculations
- [ ] Dialog displays accurate preview
- [ ] Multiplier applies to all earnings
- [ ] Starting coins calculation correct
- [ ] Achievements unlock at right thresholds
- [ ] Celebration plays properly
- [ ] State persistence works
- [ ] Two-click confirmation functions
- [ ] Progress bar updates in real-time
- [ ] Milestone unlocks display correctly

## Migration Notes

### Backward Compatibility

The system automatically handles old save data:
- `lifetimeEarnings`: defaults to 0 if missing
- `totalPrestigeEarned`: defaults to 0 if missing
- Existing `prestigePoints` are preserved
- Old prestige points get retroactive multipliers

### Data Structure

```typescript
interface GameState {
  // Existing
  prestigePoints: number          // Current prestige points
  
  // New
  totalPrestigeEarned?: number    // Lifetime prestige points earned
  lifetimeEarnings?: number       // Total earnings across all prestiges
}
```

## Performance Considerations

- Multiplier calculations are cached where possible
- Dialog only renders when open
- Confetti particles are cleaned up after animation
- Progress calculations use memoization

## Future Enhancements (Not Implemented)

Potential additions for future iterations:

1. **Prestige Perks**: Spend prestige points on permanent upgrades
2. **Prestige Challenges**: Special conditions for bonus points
3. **Prestige Leaderboard**: Compete on total prestige earned
4. **Prestige Skins**: Unlock visual customizations
5. **Prestige Speed Run**: Track fastest time to prestige
6. **Auto-Prestige**: Optional automation at specific thresholds

## Conclusion

This prestige system is designed to be:
- **Rewarding**: Clear, immediate benefits
- **Engaging**: Multiple progression paths
- **Balanced**: Meaningful but not overpowered
- **Satisfying**: Epic celebrations and feedback
- **Aspirational**: Long-term goals to chase

The implementation follows game design best practices for idle/incremental games while maintaining the slot machine casino theme. All code is well-documented, type-safe, and maintainable.
