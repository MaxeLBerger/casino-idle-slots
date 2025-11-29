# Casino Idle Slots – Copilot Instructions

## Project Context
- **Product:** Premium single-page idle casino game targeting "High-Roller" mobile market (Age 30-55).
- **Theme:** "Midnight Luxury Lounge" (Dark Violet/Blue backgrounds, Gold accents, Cyan/Pink highlights).
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL).
- **Architecture:** Feature-based (`/src/features`), strict separation of concerns.

## MCP Development Tools
This project has a custom MCP server at `packages/casino-mcp-server` with these tools:

| Tool | Usage |
|------|-------|
| `run_typecheck` | Check for TypeScript errors before committing |
| `run_lint` | Check for ESLint issues |
| `run_diagnostics` | Full TypeScript + ESLint check |
| `analyze_component` | Deep analysis of a specific React component |
| `check_mobile_responsiveness` | Scan for mobile UI issues |
| `get_build_status` | Test if production build succeeds |
| `find_unused_exports` | Find dead code to clean up |
| `get_game_stats` | Read game constants |
| `list_assets` | List available assets in public/ |

**Always run `run_diagnostics` after making significant changes to catch errors early!**

## Build Commands
- `npm run check` - Full diagnostic (TypeScript + ESLint)
- `npm run build` - **Strict build** with type checking (use this!)
- `npm run build:fast` - Skip type checking (only for quick iteration)
- `npm run typecheck` - TypeScript only

## Game Design & Mechanics
- **Core Loop:** Spin Slots -> Earn Coins -> Upgrade Stats/Workers -> Prestige -> Unlock New Casinos.
- **Slots:** 6 distinct machines (Classic, Deluxe, Premium, Mega, Ultimate, Event).
- **Economy:**
  - **Coins:** Soft currency (Upgrades).
  - **Prestige Points:** Meta currency (Global multipliers, Unlocks).
  - **Diamonds:** Premium currency (Speed-ups, Cosmetics).
  - **Event Tokens:** Temporary currency.
- **Meta Layer ("Casino City Map"):**
  - Hub world with buildings: Casinos, Worker HQ, Boutique, VIP Lounge, Event Plaza.
  - **Avatar:** Customizable character (Body, Outfit, Color) moving on the map.
- **Progression:** 8 Idle Workers, 5 Prestige Ranks (Bronze to Diamond).

## Visual & UX Guidelines
- **Aesthetic:** High-end, glossy, "Vegas Nightlife". NO cartoon styles.
- **Assets:** Use high-res images from `public/assets/`. **Avoid emojis** for game elements.
- **Mobile-First:**
  - Touch targets must be large (min 44px).
  - Layouts must work on 320px width.
  - Prevent layout shifts (CLS).
- **Cognitive Load:** Adhere to Hick's Law (max 5-7 options per screen).

## Coding Standards
- **React:** Functional components, custom hooks for logic, strict types.
- **State:** Keep state close to features. Use Context for global game state (Wallet, Settings).
- **Styling:** Tailwind CSS. Use `theme.css` variables for colors.
- **Types:** All shared types in `src/types/**`.
- **Constants:** All game balance values in `src/constants/**`.

## Copilot Behavior Rules
1. **Asset Awareness:** When adding UI, assume assets exist or ask for them. Do not default to text/emojis.
2. **Type Safety:** Always update `types` and `constants` BEFORE implementing logic.
3. **Incremental Changes:** Break down complex features into small, testable steps.
4. **Supabase:** Never modify the schema without explicit permission.
5. **Context:** Always check `PRESTIGE_SYSTEM.md` or `PRD.md` if unsure about mechanics.
6. **Quality Gates:** Run `npm run check` before considering any feature complete.
