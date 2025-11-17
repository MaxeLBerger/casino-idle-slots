import { supabase, isDemoMode } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface UserInfo {
  id: string
  login: string
  avatarUrl: string
  email: string
}

let userCache: UserInfo | null | undefined = undefined

export async function getCurrentUser(): Promise<UserInfo | null> {
  if (userCache !== undefined) {
    return userCache
  }

  // Demo mode: return guest user
  if (isDemoMode) {
    userCache = {
      id: 'demo-user',
      login: 'DemoPlayer',
      avatarUrl: '',
      email: 'demo@local'
    }
    return userCache
  }

  try {
    const { data: { user }, error } = await supabase!.auth.getUser()
    
    if (error || !user) {
      userCache = null
      return null
    }

    userCache = {
      id: user.id,
      login: user.user_metadata?.user_name || user.email?.split('@')[0] || 'Anonymous',
      avatarUrl: user.user_metadata?.avatar_url || '',
      email: user.email || ''
    }

    return userCache
  } catch (error) {
    console.error('[Auth] Error getting user:', error)
    userCache = null
    return null
  }
}

export async function signInWithGitHub(): Promise<boolean> {
  // Demo mode: no-op
  if (isDemoMode) {
    console.log('[Auth] Demo mode - sign in not available')
    return false
  }

  try {
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    })

    if (error) {
      console.error('[Auth] GitHub sign in error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Auth] Error signing in:', error)
    return false
  }
}

export async function signOut(): Promise<void> {
  // Demo mode: no-op
  if (isDemoMode) {
    userCache = null
    return
  }

  try {
    await supabase!.auth.signOut()
    userCache = null
  } catch (error) {
    console.error('[Auth] Error signing out:', error)
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  // Demo mode: immediate callback with demo user
  if (isDemoMode) {
    callback(null)
    return () => {}
  }

  const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
    userCache = undefined
    callback(session?.user || null)
  })

  return () => subscription.unsubscribe()
}
