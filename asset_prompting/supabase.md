# Supabase Alignment Plan

## Current Gaps
- `game_states` table only stores coins/level/basic stats; ignores diamonds, event tokens, avatar, workers, preferences, spinHistory.
- `useSupabaseGameState` writes legacy structures (`upgrades`, `statistics`) causing data loss for newly added fields.
- Demo mode fallback works, but we lack migration path for existing Supabase rows.

## Schema Changes
1. **Numeric Columns**
	- `diamonds` (bigint default 0)
	- `prestige_rank` (text) to capture Bronze–Diamond badge.
2. **JSONB Columns**
	- `event_token_balances` (Record<EventTokenId, number>)
	- `preferences` (PlayerPreferences)
	- `workers` (WorkerState[])
	- `spin_history` (SpinResult[] tail window)
	- `avatar` ({ id: AvatarId, cosmetics: string[] })
3. **Arrays**
	- `unlocked_slot_machines` (int[] NOT NULL DEFAULT '{0}')
	- `achievements` (text[]), `daily_challenges` (jsonb) stay.
4. **Timestamps**
	- `last_spin_at`, `last_prestige_at` for analytics.

## Migration Steps
1. Write SQL migration to add new columns with sane defaults (zeros/empty JSON).
2. Backfill data using current defaults (`DEFAULT_GAME_STATE`).
3. Create database view `game_states_public` with only safe fields for leaderboard consumption.

## App Updates
1. **Persistence Hook** (`src/lib/persistence.ts`)
	- Map new columns on save/load; keep helper to cap `spin_history` to 200 entries before upsert.
	- When demo mode is active, store same structure in localStorage to avoid code branching.
2. **Type Safety**
	- Export shared DTO types (`SupabaseGameStateRow`) in `types/persistence.types.ts`.
3. **Error Handling**
	- Surface toast when Supabase save fails; auto-retry with exponential backoff.

## Supabase Features To Enable Later
- Row Level Security policies for multi-device sync.
- Edge Function to update leaderboard (total earnings/streak) on every prestige.
- Scheduled cleanup for stale `spin_history` arrays beyond N days.

