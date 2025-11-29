# 🎰 CasinoIdleSlots - Architecture Documentation

## Overview

CasinoIdleSlots is a browser-based idle casino game built with React and TypeScript. The game features slot machines, a city map, workers, prestige system, and various progression mechanics.

**Live URL:** https://maximilianhaak.de/CasinoIdleSlots/

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS 4** | Styling |
| **Framer Motion** | Animations |
| **Radix UI** | Accessible UI Components |
| **Phosphor Icons** | Icon Library |
| **Supabase** | Backend (Auth, DB, Leaderboard) |

---

## 📁 Project Structure

```
CasinoIdleSlots/
├── public/                    # Static assets
│   ├── assets/
│   │   ├── actions/          # Action button icons
│   │   ├── avatars/          # Player avatar images
│   │   ├── buildings/        # Casino building images
│   │   ├── ranks/            # Prestige rank icons
│   │   ├── slots/            # Slot machine symbols
│   │   └── ui_items/         # UI icons & elements
│   └── favicon.png
│
├── src/
│   ├── App.tsx               # Main app component with providers
│   ├── main.tsx              # Entry point
│   │
│   ├── components/           # Shared UI components
│   │   ├── layout/           # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── ScreenRouter.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── overlays/         # Modal & overlay components
│   │   ├── ui/               # Base UI components (shadcn/ui style)
│   │   │   ├── asset-image.tsx   # Image wrapper with base path handling
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... 
│   │   └── *.tsx             # Feature-specific components
│   │
│   ├── constants/            # Game configuration & asset paths
│   │   ├── asset.constants.ts    # Slot symbol assets
│   │   ├── avatar.constants.ts   # Avatar configurations
│   │   ├── economy.constants.ts  # Currency & economy settings
│   │   ├── game.constants.ts     # Core game config
│   │   ├── map.constants.ts      # City map buildings
│   │   ├── slot.constants.ts     # Slot machine configs
│   │   ├── ui.constants.ts       # UI icon paths
│   │   └── workers.constants.ts  # Worker system config
│   │
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx       # Supabase authentication
│   │   ├── GameContext.tsx       # Game state management
│   │   └── NavigationContext.tsx # Screen navigation
│   │
│   ├── features/             # Feature-based modules
│   │   ├── avatar/           # Avatar customization
│   │   ├── map/              # City map & building navigation
│   │   ├── prestige/         # Prestige system
│   │   ├── settings/         # Game settings
│   │   ├── shop/             # In-game shop
│   │   ├── slot-machine/     # Core slot machine gameplay
│   │   ├── social/           # Social features
│   │   ├── upgrades/         # Upgrade system
│   │   └── workers/          # Worker management
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── use-mobile.ts         # Mobile detection
│   │   └── useSlotMachine.ts     # Slot machine logic
│   │
│   ├── lib/                  # Utility libraries
│   │   ├── achievements.ts       # Achievement system
│   │   ├── auth.ts               # Auth utilities
│   │   ├── leaderboard.ts        # Leaderboard logic
│   │   ├── persistence.ts        # LocalStorage persistence
│   │   ├── prestige.ts           # Prestige calculations
│   │   ├── sounds.ts             # Sound effects
│   │   ├── supabase.ts           # Supabase client
│   │   └── utils.ts              # General utilities
│   │
│   ├── styles/               # CSS styles
│   ├── types/                # TypeScript type definitions
│   │   ├── game.types.ts         # Core game types
│   │   ├── slot.types.ts         # Slot machine types
│   │   ├── map.types.ts          # Map & building types
│   │   └── user.types.ts         # User/auth types
│   │
│   ├── index.css             # Global styles
│   └── main.css              # Tailwind imports
│
├── packages/                 # Monorepo packages
│   └── casino-mcp-server/    # MCP Server for AI assistance
│
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

---

## 🔄 Architecture Patterns

### 1. Context-Based State Management

The app uses React Context for global state:

```
App
├── AuthProvider        → Handles Supabase authentication
│   ├── GameProvider    → Manages game state & persistence
│   │   └── NavigationProvider → Screen navigation state
│   │       └── AppShell → Main app content
```

### 2. Feature-Based Organization

Each feature is self-contained in `/src/features/`:
- Own screens/components
- Feature-specific logic
- Clear boundaries between features

### 3. Asset Path Resolution

For production deployment at `/CasinoIdleSlots/`, we use:
- `getAssetPath()` utility in `src/lib/utils.ts`
- `AssetImage` component wrapper for all images
- Vite's `base` config for correct path resolution

---

## 🎮 Core Game Systems

### Game State (`GameContext`)

```typescript
interface GameState {
  // Currency
  coins: number;
  prestigePoints: number;
  diamonds: number;
  
  // Progress
  level: number;
  experience: number;
  totalSpins: number;
  totalWins: number;
  
  // Upgrades
  spinPowerLevel: number;
  idleIncomeLevel: number;
  // ...
  
  // Slot Machines
  currentSlotMachine: number;
  unlockedSlotMachines: number[];
  
  // Achievements
  unlockedAchievements: string[];
}
```

### Navigation System

Screens are defined as:
```typescript
type GameScreen =
  | 'LOADING'
  | 'CITY_MAP'
  | 'SLOT_MACHINE'
  | 'SHOP'
  | 'WORKERS_HQ'
  | 'PRESTIGE_LOUNGE'
  // ...
```

### Slot Machine System

- Multiple tiers: Classic → Sapphire → Emerald → Royal → Celestial
- Symbol assets per tier in `SLOT_SYMBOL_ASSETS`
- Configurable bet options & payouts
- Win tier system: small → big → mega → jackpot → ultra

---

## 🎨 UI Component System

Based on shadcn/ui patterns with Radix UI primitives:
- `Button`, `Card`, `Dialog`, `Tabs`, etc.
- Tailwind-based styling with CSS variables
- Dark theme optimized for casino aesthetic

### Custom Components

| Component | Purpose |
|-----------|---------|
| `AssetImage` | Image wrapper with base path handling |
| `BackButton` | Navigation back button |
| `SpinResultOverlay` | Win celebration overlay |
| `MapView` | Isometric city map renderer |

---

## 🔧 Build & Deployment

### Development
```bash
npm run dev          # Start dev server (localhost:5173)
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

### Production Build
```bash
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build
```

### Deployment

Deployed via GitHub Pages through portfolio repository:
1. Build outputs to `/dist`
2. Portfolio's GitHub Actions copies to `gh-pages` branch
3. Live at `https://maximilianhaak.de/CasinoIdleSlots/`

**Important:** Vite `base` config must be `/CasinoIdleSlots/` for production.

---

## 📦 Key Dependencies

### Core
- `react` / `react-dom` - UI framework
- `typescript` - Type safety
- `vite` - Build tool

### UI
- `@radix-ui/*` - Accessible primitives
- `framer-motion` - Animations
- `@phosphor-icons/react` - Icons
- `tailwindcss` - Styling

### Data & Auth
- `@supabase/supabase-js` - Backend services
- `@tanstack/react-query` - Data fetching (optional)
- `zod` - Schema validation

### Utilities
- `clsx` / `tailwind-merge` - Class utilities
- `date-fns` - Date handling
- `uuid` - ID generation

---

## 🔐 Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Touch-optimized interactions
- `use-mobile.ts` hook for mobile detection

---

## 🧪 Testing

Currently manual testing. Future considerations:
- Vitest for unit tests
- Playwright for E2E tests

---

## 📝 Code Conventions

- **Components:** PascalCase, `.tsx` extension
- **Hooks:** `useCamelCase` prefix
- **Constants:** SCREAMING_SNAKE_CASE
- **Types:** PascalCase with descriptive suffixes (`*Id`, `*State`, `*Props`)
- **Files:** kebab-case for utilities, PascalCase for components

---

## 🚀 Future Enhancements

- [ ] Offline support (PWA)
- [ ] Sound effects integration
- [ ] More slot machine themes
- [ ] Social features (leaderboards, friends)
- [ ] Daily rewards system
- [ ] Achievement animations

---

**Last Updated:** November 2025
**Maintained by:** Maximilian Haak
