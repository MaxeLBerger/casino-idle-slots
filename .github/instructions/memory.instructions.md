---
applyTo: '**'
---

# Project Memory

## Version 2.0.0 - Big Refactor & Redesign (November 2025)

### MCP Server Setup
- Location: `packages/casino-mcp-server`
- Config: `.vscode/mcp.json`
- **Always use MCP tools to validate code changes!**

### Architecture Changes
- **Feature-based architecture**: All screens now in `/src/features/`
- **Context-based state**: GameContext, NavigationContext, AuthContext
- **Hub-and-spoke navigation**: CityMapView as hub, screens as spokes
- **Component library**: New layout components in `/src/components/layout/`

### New Features Added
- `slot-machine/` - Refactored SlotMachineView with overlays
- `upgrades/` - UpgradesScreen with UpgradesPanel
- `prestige/` - PrestigeScreen (VIP Lounge)
- `statistics/` - StatisticsScreen with detailed stats
- `shop/` - MainShopScreen for purchases
- `workers/` - WorkersScreen with WorkersPanel
- `social/` - SocialHubScreen (Leaderboard, Achievements)
- `settings/` - SettingsScreen
- `city-map/` - CityMapView as main hub

### New Constants
- `economy.constants.ts` - Currency icon assets, economy config
- `ui.constants.ts` - UI icon asset paths
- `slot.constants.ts` - Slot machine symbols and payouts

### Icon Fix for Black Backgrounds
- Added `.icon-blend` CSS class with `mix-blend-mode: screen`
- All game assets with black backgrounds now render transparently

### Session Notes (Nov 29, 2025)
- Fixed PrestigeDialog NaN issues (was missing props)
- Added Statistics, Shop, SocialHub screens
- Fixed mobile scrolling with ScrollArea
- Fixed Lightning import crash in MainShopScreen
- Made builds stricter (`npm run build` now runs typecheck)
- Added MCP server with dev tools (run_typecheck, run_lint, run_diagnostics, etc.)
- Fixed MCP initialize handler for VS Code

### Quality Checklist Before Commits
1. Run `npm run check` (typecheck + lint)
2. Run `npm run build` (full production build)
3. Test on mobile viewport (320px width minimum)
