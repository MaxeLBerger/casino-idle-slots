# Missing Pieces Overview

## Slot Machine Experience
- No tier-specific backgrounds/cabinets; `SlotCasinoScreen` uses a generic gradient.
- Reel animation is instant symbol swap; lacks stagger, easing, blur, and sound gating.
- Feature strip icons (scatter/bonus/jackpot) are static labels with no triggering logic or rewards.
- Bet sizing/auto-spin controls absent; SPIN_COST hardcoded at 10 regardless of machine tier.
- `SpinResultOverlay` only shows numeric win; no breakdown (multiplier, coins, jackpot tier).
- `spinHistory` array stays empty, so `SpinHistory` analytics and `Statistics` screen have no data.

## Navigation & UI
- Entering a casino has no visible “Back to City” affordance; player is trapped in slot screen.
- `NavigationContext` only remembers one previous screen, preventing proper back stack.
- Top bar currency pills are static visuals; clicking coins/prestige/diamonds does nothing.
- No quick links to shop/workers/stats from the top bar or slot screen header.

## Settings & Preferences
- Settings screen is placeholder text; none of `gameState.preferences` (sound/music/haptics/auto-spin) can be viewed or changed.
- Audio system (`lib/sounds.ts`) ignores preference toggles and always plays SFX.
- Account management (Supabase login state) not exposed; no manual save/load controls.

## Statistics & Secondary Views
- `Statistics.tsx` file is empty; no dashboard summarizing coins, RTP, streaks, etc.
- Workers/upgrades/shop wrappers in `ScreenRouter` still render placeholder data; not wired to `gameState` or Supabase progress.
- No leaderboard hook-up despite design calling for quick prestige/earnings view.

## Supabase / Persistence Dependencies
- `game_states` schema lacks diamonds, event tokens, preferences, workers, avatar, spinHistory columns; saving today discards those values.
- Demo mode uses localStorage but doesn’t mirror the same structure (no event tokens, spin history), causing divergent behavior between modes.

## Asset / Content Needs
- Need per-machine background art and cabinet overlays (likely under `public/assets/slots/*`).
- Lack animated spin button (current icon missing, broken image on spin button screenshot).
- Require currency drawer icons/tooltips for coins/prestige/diamonds/event tokens.
- Need audio toggle icons + slider assets for settings.

## Testing / Tooling
- `npm run lint` fails (flat config missing) preventing CI-style checks.
- No automated tests cover `useSlotMachine`, navigation stack, or persistence.

