# Planning Guide

A browser-based idle casino slots game where players spin slot machines, accumulate coins, and upgrade their setup to earn passive income while away.

**Experience Qualities**:
1. **Addictive** - The gameplay loop of spinning, earning, and upgrading should create a satisfying dopamine cycle that keeps players engaged
2. **Rewarding** - Visual and audio feedback through animations and celebratory effects make every win feel significant
3. **Polished** - Smooth animations, vibrant colors, and careful attention to detail create a premium casino experience

**Complexity Level**: Light Application (multiple features with basic state)
  - Features include manual slot spinning, idle coin generation, upgrade system, statistics tracking, and persistent game state

## Essential Features

### Manual Slot Spinning
- **Functionality**: Players click a spin button to trigger the slot machine, which randomly generates symbols and awards coins based on matching patterns. Multiple slot machines with different configurations can be unlocked.
- **Purpose**: Provides active engagement and immediate gratification through visual and audio feedback
- **Trigger**: Click on "SPIN" button (costs coins per spin)
- **Progression**: Click spin button → Spin sound plays → Symbols animate → Symbols land one by one with stop sounds → Win calculated → Sound effects play based on win size → Coins added with animation → Confetti and win banner for big wins → Stats updated
- **Success criteria**: Symbols display randomly, matching symbols award appropriate multipliers, coin balance updates correctly, sound effects and animations trigger appropriately

### Idle Coin Generation
- **Functionality**: Automatically generates coins over time even when the player is away, based on upgrade level
- **Purpose**: Creates progression during offline periods and rewards returning players
- **Trigger**: Passive generation starts automatically when upgrades are purchased
- **Progression**: Player purchases idle income upgrade → Coins per second increases → Coins accumulate in background → Player sees accumulated earnings on return
- **Success criteria**: Coins generate accurately based on time elapsed, offline earnings are calculated and displayed on return

### Upgrade System
- **Functionality**: Players spend coins to purchase upgrades that increase spin win multipliers and passive income generation. Sound effects play on successful upgrades.
- **Purpose**: Provides long-term progression goals and strategic depth
- **Trigger**: Click upgrade buttons in the upgrades panel
- **Progression**: View upgrade cost and benefit → Spend coins → Upgrade sound plays → Upgrade level increases → Stats improve → New upgrade tier unlocked
- **Success criteria**: Upgrades persist across sessions, costs scale appropriately, benefits apply correctly to gameplay, audio feedback confirms purchases

### Sound Effects System
- **Functionality**: Web Audio API-generated sound effects play during key game events including spins, reel stops, wins, upgrades, and prestige
- **Purpose**: Enhances feedback and creates an immersive casino atmosphere without external audio files
- **Trigger**: Automatically triggered by game events
- **Progression**: Game event occurs → Appropriate sound synthesized and played → User receives immediate audio feedback
- **Success criteria**: Sounds are pleasant, non-intrusive, contextually appropriate, and work across all browsers

### Win Celebration System
- **Functionality**: Tiered celebration effects based on win size including confetti particles, full-screen win banners, and escalating sound effects
- **Purpose**: Makes wins feel rewarding and creates memorable moments
- **Trigger**: Triggered automatically when a spin results in a win
- **Progression**: Win detected → Win tier calculated (small/big/mega) → Confetti particles spawn → Win banner displays with animation → Sound plays → Effects dismiss after duration
- **Success criteria**: Small wins (5x+ bet) show confetti and simple sound, big wins (20x+ bet) show more confetti and banner, mega wins (50x+ bet) show maximum effects

### Statistics Dashboard
- **Functionality**: Tracks and displays key metrics like total spins, biggest win, total earnings, and current income rate
- **Purpose**: Gives players a sense of progress and achievement
- **Trigger**: Always visible in the interface
- **Progression**: Player actions → Stats update in real-time → Historical bests are preserved
- **Success criteria**: All stats are accurate, persistent, and update immediately

### Prestige/Reset System
- **Functionality**: Players can reset progress for permanent prestige points that unlock new slot machines with different configurations (more rows, reels, and symbols)
- **Purpose**: Extends endgame and adds strategic depth for long-term players
- **Trigger**: Unlock after 100 total spins, activate via button
- **Progression**: Reach 100 spins → Prestige option appears → Confirm reset → Epic sound and confetti play → Keep prestige points → Unlock new slot machines → Start fresh with new machines available
- **Success criteria**: Prestige points persist, game state resets appropriately, new slot machines unlock at correct thresholds, celebration effects play

## Edge Case Handling

- **Insufficient Funds**: Spin button becomes disabled when player lacks coins, with clear visual indication
- **Offline Earnings Cap**: Limit maximum offline earnings to prevent exploitation (e.g., 4 hours max)
- **Upgrade Affordability**: Show upgrade costs clearly and disable purchase buttons when unaffordable
- **First Time Player**: Start with enough coins for several spins to let players learn mechanics
- **Negative Balance Protection**: Never allow coin balance to go negative through validation
- **Save State Corruption**: Implement fallback to default state if saved data is invalid

## Design Direction

The design should feel luxurious and exciting like a premium casino experience - rich golds, deep purples, and vibrant neons against a dark background create energy and sophistication. The interface should be rich rather than minimal, with prominent slot machine visuals, animated coin effects, and satisfying feedback for every interaction.

## Color Selection

Triadic color scheme (gold, purple, cyan) to create a vibrant, energetic casino atmosphere with high visual interest and clear hierarchy.

- **Primary Color**: Rich Gold (oklch(0.75 0.15 85)) - Communicates wealth, winning, and premium quality; used for coins, highlights, and success states
- **Secondary Colors**: 
  - Deep Purple (oklch(0.45 0.18 300)) - Adds luxury and sophistication; used for backgrounds and cards
  - Electric Cyan (oklch(0.70 0.15 210)) - Creates excitement and modernity; used for accents and interactive elements
- **Accent Color**: Vibrant Neon Pink (oklch(0.65 0.25 350)) - Grabs attention for CTAs, jackpots, and celebration effects
- **Foreground/Background Pairings**:
  - Background (Deep Purple-Black oklch(0.15 0.08 300)): Gold text (oklch(0.95 0.05 85)) - Ratio 11.2:1 ✓
  - Card (Purple oklch(0.25 0.12 300)): White text (oklch(0.98 0 0)) - Ratio 12.5:1 ✓
  - Primary (Rich Gold oklch(0.75 0.15 85)): Black text (oklch(0.15 0 0)) - Ratio 9.8:1 ✓
  - Secondary (Deep Purple oklch(0.45 0.18 300)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Accent (Neon Pink oklch(0.65 0.25 350)): White text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓
  - Muted (Dark Purple oklch(0.30 0.10 300)): Light Gray text (oklch(0.75 0.02 300)) - Ratio 4.9:1 ✓

## Font Selection

Typography should feel bold, modern, and energetic with strong visual hierarchy - perfect for casino excitement while maintaining clarity.

- **Typographic Hierarchy**:
  - H1 (Game Title): Orbitron Bold/48px/tight letter-spacing (0.05em) - Futuristic casino marquee feel
  - H2 (Section Headers): Orbitron SemiBold/28px/normal letter-spacing
  - H3 (Stats Labels): Orbitron Medium/20px/normal letter-spacing
  - Body (Descriptions): Inter Regular/16px/1.5 line-height - Clean readability for upgrade descriptions
  - Numbers (Coins/Stats): Orbitron Bold/24px/tabular-nums - Monospaced for aligned number updates
  - Buttons: Inter Bold/18px/uppercase/wide letter-spacing (0.1em)

## Animations

Animations should be energetic and celebratory, balancing frequent micro-interactions with explosive moments of delight during big wins - motion reinforces the excitement of gambling and rewards.

- **Purposeful Meaning**: 
  - Slot reel spins create anticipation with sequential stopping animations
  - Coin counter animations emphasize earnings with spring physics
  - Confetti particle effects celebrate wins with varying intensity
  - Win banners with scale and shake animations for big wins
  - Sound effects synchronized with visual feedback
  - Smooth transitions maintain energy throughout
  
- **Hierarchy of Movement**:
  1. Slot machine reels (primary focus) - Fast animation with sequential reveal and stop sounds
  2. Win celebrations - Full-screen confetti and animated banners for big wins
  3. Coin animations - Numbers count up with spring physics, particle bursts on wins
  4. Upgrade purchases - Satisfying scale effects and sound on button press
  5. Background ambient effects - Subtle pulsing glows for enhanced reels

## Component Selection

- **Components**:
  - Card: Central slot machine display and upgrade panels with gradient backgrounds and glowing borders
  - Button: Large, prominent spin button with hover lift and active press states; upgrade buttons with disabled states
  - Progress: Visual bars showing upgrade levels and prestige progress
  - Badge: Display multipliers, level indicators, and status effects
  - Separator: Divide sections between stats, slots, and upgrades
  - Tabs: Organize upgrades into categories (spin power, idle income, prestige)
  - Dialog: Display offline earnings, prestige confirmation, and game instructions
  - Sonner Toast: Quick feedback for purchases, insufficient funds, achievements

- **Customizations**:
  - Slot Machine Component: Custom multi-reel display with symbol emojis (🍒🍋🔔💎⭐🍀🎰💰🎁👑🔥) and smooth animation
  - Coin Counter: Animated number display with particle effects using framer-motion
  - Upgrade Card: Progress bar showing current level, cost, and benefit with glow on hover
  - Stat Display: Large numbers with labels in grid layout
  - Confetti System: Dynamic particle effects with varying intensity (low/medium/high/mega)
  - Win Banner: Full-screen animated banner showing win amount and type with emoji and gradients

- **States**:
  - Spin Button: Default (glowing gold), Hover (lifted with stronger glow), Active (pressed down), Disabled (grayed out with locked icon), Spinning (animated with progress)
  - Upgrade Buttons: Affordable (cyan glow), Unaffordable (muted/disabled), Hover (scale up), Active (scale down with purchase animation)
  - Slot Reels: Idle (static symbols), Spinning (heavy blur), Landing (scale bounce effect)

- **Icon Selection**:
  - Coins: Use from phosphor-icons for currency displays throughout
  - ArrowUp: Upgrade level increases
  - Lightning: Idle income and passive generation
  - Trophy: Achievements and biggest wins
  - Gauge: Statistics and metrics
  - Sparkle: Big wins and jackpots
  - Lock/LockOpen: Locked vs unlocked upgrades

- **Spacing**:
  - Page padding: p-6 (24px)
  - Card padding: p-6 to p-8 (24-32px)
  - Section gaps: gap-8 (32px) for major sections, gap-4 (16px) within sections
  - Button spacing: py-6 px-8 for primary spin button, py-3 px-6 for secondary buttons
  - Grid gaps: gap-4 for stat grids, gap-6 for upgrade cards

- **Mobile**:
  - Stack layout vertically: slot machine → stats → upgrades
  - Reduce slot machine size and font scales (H1 36px, H2 24px)
  - Full-width spin button at bottom with fixed position for easy thumb access
  - Collapse upgrade descriptions, show only titles and costs
  - Single column stat grid
  - Reduce spacing (p-4, gap-4 becomes gap-3)
