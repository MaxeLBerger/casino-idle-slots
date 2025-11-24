# Midnight Luxury Lounge - UI Redesign Plan

## Phase 1: Architecture & Navigation Shell
- [ ] 1.1: Create missing feature folders (shop, settings, avatar, social)
- [ ] 1.2: Implement GameNavigationContext (Hub-and-Spoke state management)
- [ ] 1.3: Create MainLayout component (Background, Transitions, Global Overlays)
- [ ] 1.4: Refactor App.tsx to use the new Navigation and Layout

## Phase 2: Core Loop (Slot Machine)
- [ ] 2.1: Refactor SlotMachineView to SlotCasinoScreen
- [ ] 2.2: Implement SpinResultOverlay (Big Win/Level Up animations)
- [ ] 2.3: Integrate new Asset Registry for Slot Symbols & UI

## Phase 3: Meta Layer (The City)
- [ ] 3.1: Refactor CityMapView to CasinoCityMapScreen (The Hub)
- [ ] 3.2: Implement Building interaction & Tooltips
- [ ] 3.3: Integrate Avatar display on Map

## Phase 4: Feature Screens (The Spokes)
- [ ] 4.1: Implement WorkersHQScreen (Redesign WorkersPanel)
- [ ] 4.2: Implement UpgradesScreen (Redesign UpgradesPanel)
- [ ] 4.3: Implement PrestigeScreen (Redesign PrestigeDialog)
- [ ] 4.4: Implement AvatarWardrobeScreen

## Phase 5: Economy & Social
- [ ] 5.1: Implement MainShopScreen (Coins, Diamonds)
- [ ] 5.2: Implement SocialHubScreen (Leaderboard, Achievements, Stats)

## Phase 6: Polish & Visuals
- [ ] 6.1: Apply 'Midnight Luxury' theme (Colors, Fonts, Shadows) globally
- [ ] 6.2: Add particle effects (Confetti, Sparkles)
- [ ] 6.3: Mobile responsiveness check (Touch targets, Safe areas)
