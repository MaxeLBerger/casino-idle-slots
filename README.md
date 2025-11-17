#  Casino Idle Slots

Ein browser-basiertes Idle-Casino-Spiel mit Slot-Maschinen, Upgrades, Achievements und Leaderboards. Gebaut mit React, TypeScript und GitHub Spark.

##  Live Demo

**Production:** [https://maximilianhaak.de/CasinoIdleSlots/](https://maximilianhaak.de/CasinoIdleSlots/)

##  Features

### Core Gameplay
- ** Slot Machines** - 5 freischaltbare Slot-Maschinen mit unterschiedlichen Konfigurationen
- ** Manual Spinning** - Aktives Gameplay durch manuelles Spinnen
- ** Idle Income** - Passive Coin-Generierung auch offline
- ** Win Celebrations** - Gestufte Gewinn-Animationen mit Konfetti

### Progression System
- ** Upgrade System** - Spin Power & Idle Income Upgrades
- ** Prestige System** - Reset für permanente Prestige-Punkte
- ** Leveling System** - Erfahrungspunkte und Level-Ups
- ** Achievements** - Über 15 Achievements zum Freischalten

### Social Features
- ** GitHub Login** - Account-basierte Fortschritts-Speicherung
- ** Leaderboards** - Globale Rankings in 6 Kategorien
- ** Daily Challenges** - Täglich wechselnde Herausforderungen
- ** Cloud Sync** - Automatische Synchronisation über Geräte hinweg

### Special Mechanics
- ** Jackpot Symbols** - 3% Chance für 2x Multiplier
- ** Ultra Jackpot** - 0.5% Chance für 3x Multiplier
- ** Win Streaks** - Combo-System für aufeinanderfolgende Gewinne
- ** Statistics** - Detaillierte Statistik-Tracking

##  Tech Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations

### UI Components
- **shadcn/ui** - Component Library
- **Radix UI** - Primitives
- **Phosphor Icons** - Icon System
- **Sonner** - Toast Notifications

### Backend & Storage
- **GitHub Spark** - Authentication & Key-Value Storage
- **GitHub Spark KV** - Cloud-basierte Datenspeicherung
- **Octokit** - GitHub API Integration

##  Projekt-Struktur

\\\
casinoidleslots/
 .github/
    workflows/
        deploy.yml          # GitHub Actions Deployment
 src/
    components/
       ui/                 # shadcn/ui Komponenten
       Achievements.tsx    # Achievement System
       Confetti.tsx        # Win Celebrations
       DailyChallenges.tsx # Daily Challenge System
       Leaderboard.tsx     # Global Rankings
       UserProfile.tsx     # User Profile & Auth
    constants/              # Spiel-Konstanten
       game.constants.ts
       slot.constants.ts
    features/               # Feature-Module
       slot-machine/
       upgrades/
       prestige/
       statistics/
    hooks/                  # Custom React Hooks
       game/
       use-mobile.ts
    lib/                    # Core Libraries
       achievements.ts
       leaderboard.ts
       persistence.ts
       sounds.ts
       utils.ts
    services/               # Business Logic Services
    types/                  # TypeScript Definitionen
       game.types.ts
       slot.types.ts
       user.types.ts
    utils/                  # Utility Functions
    App.tsx                 # Main Application
    main.tsx                # Entry Point
    index.css               # Global Styles
 .env.example                # Environment Variables Template
 vite.config.ts              # Vite Configuration
 tailwind.config.js          # Tailwind Configuration
 tsconfig.json               # TypeScript Configuration
 package.json                # Dependencies
\\\

##  Installation & Development

### Voraussetzungen
- Node.js 20+
- npm oder yarn
- Git

### Setup

\\\ash
# Repository klonen
git clone https://github.com/MaxeLBerger/casino-idle-slots.git
cd casino-idle-slots

# Dependencies installieren
npm install

# Development Server starten
npm run dev
\\\

Der Development Server läuft auf [http://localhost:5173](http://localhost:5173)

### Environment Variables

Kopiere \.env.example\ zu \.env\:

\\\ash
cp .env.example .env
\\\

### Build für Production

\\\ash
# Production Build erstellen
npm run build

# Build lokal testen
npm run preview
\\\

##  Deployment

Das Projekt wird automatisch über GitHub Actions auf GitHub Pages deployed:

1. **Push to Main Branch** - Automatischer Deployment-Trigger
2. **Build Process** - npm ci && npm run build
3. **Deployment** - Deployment auf \/CasinoIdleSlots/\ Subdirectory

### Manuelle Deployment-Trigger

Workflow kann auch manuell im Actions Tab getriggert werden.

##  Gameplay Guide

### Getting Started
1. **Login** - Mit GitHub Account einloggen für Cloud-Sync
2. **Spin** - Slot-Machine für 10 Coins pro Spin drehen
3. **Win** - Bei Matches Coins gewinnen
4. **Upgrade** - Spin Power oder Idle Income upgraden

### Progression Path
1. **Early Game** - Manuelle Spins für erste Coins
2. **Mid Game** - Idle Income für passive Generierung
3. **Late Game** - Prestige für neue Slot Machines
4. **End Game** - Achievement & Leaderboard Completion

### Tips & Tricks
-  Idle Income früh upgraden für passive Coins
-  Achievements für Bonus-Rewards freischalten
-  Daily Challenges für Extra-XP completieren
-  Login Streak für Bonus-Multiplier aufrechterhalten

##  Architektur-Entscheidungen

### Warum GitHub Spark?
- **Kostenlos** - Keine Backend-Kosten
- **Cloud Storage** - KV-Store für User-Daten
- **Authentication** - GitHub OAuth out-of-the-box
- **Real-time Sync** - Automatische Synchronisation

### Warum Vite?
- **Fast** - Schneller als Webpack
- **Modern** - Native ES Modules
- **Simple** - Minimale Konfiguration
- **Optimiert** - Tree-shaking & Code-splitting

### Code Organization
- **Feature-basiert** - Modules nach Features organisiert
- **Type-safe** - Vollständige TypeScript Coverage
- **Constants** - Zentrale Konfigurationsdateien
- **Separation of Concerns** - UI, Business Logic, State getrennt

##  Wartung & Support

### Fehler melden
Issues können auf GitHub erstellt werden: [Issues](https://github.com/MaxeLBerger/casino-idle-slots/issues)

### Feature Requests
Feature-Vorschläge sind willkommen! Bitte als Issue mit Label \enhancement\ erstellen.

##  Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

##  Contributors

- **MaxeLBerger** - Initial Development
- **Community** - Bug Reports & Feedback

##  Danksagungen

- **GitHub Spark** - Backend & Storage
- **shadcn/ui** - Component Library
- **Radix UI** - UI Primitives
- **Vercel** - Inspiration für moderne Web-Apps

---

**Made with  and TypeScript**

Viel Spaß beim Spielen! 
