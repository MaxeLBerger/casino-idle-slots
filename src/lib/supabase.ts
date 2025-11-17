import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const enableDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'

// Check if running in demo mode (no Supabase configuration)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || enableDemoMode

if (isDemoMode) {
  console.warn('⚠️ Casino Idle Slots running in DEMO MODE (localStorage only)')
}

// Create Supabase client only if credentials are available
// In demo mode, we create a dummy client that won't be used
export const supabase = isDemoMode 
  ? null as any
  : createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if backend features are available
export const hasBackendFeatures = !isDemoMode && supabase !== null
