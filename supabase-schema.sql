-- Casino Idle Slots Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game States Table
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core Game State
  coins BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience BIGINT DEFAULT 0,
  prestige_points INTEGER DEFAULT 0,
  prestige_level INTEGER DEFAULT 0,
  
  -- Slot Machines (stored as JSONB)
  slots_unlocked JSONB DEFAULT '[]'::jsonb,
  
  -- Upgrades (stored as JSONB)
  upgrades JSONB DEFAULT '{}'::jsonb,
  
  -- Achievements (stored as JSONB)
  achievements JSONB DEFAULT '[]'::jsonb,
  
  -- Statistics (stored as JSONB)
  statistics JSONB DEFAULT '{}'::jsonb,
  
  -- Daily Challenges
  daily_challenges JSONB DEFAULT '[]'::jsonb,
  last_daily_reset TIMESTAMPTZ,
  
  -- Login tracking
  last_login_date TIMESTAMPTZ DEFAULT NOW(),
  login_streak INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one game state per user
  UNIQUE(user_id)
);

-- Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.raw_user_meta_data->>'user_name' as username,
  u.raw_user_meta_data->>'avatar_url' as avatar,
  COALESCE(u.raw_user_meta_data->>'name', 'Anonymous') as display_name,
  gs.coins,
  gs.level,
  gs.prestige_points,
  gs.prestige_level,
  gs.experience,
  gs.updated_at
FROM auth.users u
JOIN game_states gs ON u.id = gs.user_id
ORDER BY gs.coins DESC;

-- Enable Row Level Security
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can read own game state"
  ON game_states
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state"
  ON game_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
  ON game_states
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own game state"
  ON game_states
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_game_states_updated_at
  BEFORE UPDATE ON game_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
CREATE INDEX IF NOT EXISTS idx_game_states_coins ON game_states(coins DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_level ON game_states(level DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_prestige ON game_states(prestige_points DESC);
