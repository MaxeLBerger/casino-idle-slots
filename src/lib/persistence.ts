import { useEffect, useState, useRef } from 'react'

export interface UserInfo {
  id: number
  login: string
  avatarUrl: string
  email: string
  isOwner: boolean
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    const userPromise = window.spark.user()
    const user = await Promise.race([userPromise, timeoutPromise])
    return user || null
  } catch (error) {
    console.error('[Persistence] Error getting user:', error)
    return null
  }
}

export function useUserLinkedKV<T>(baseKey: string, defaultValue: T) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [value, setValue] = useState<T>(defaultValue)
  const isInitializedRef = useRef(false)
  const userIdRef = useRef<string | null>(null)
  const defaultValueRef = useRef(defaultValue)

  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      try {
        const user = await getCurrentUser()
        if (!mounted) return
        
        const userIdStr = user ? user.id.toString() : null
        setUserId(userIdStr)
        userIdRef.current = userIdStr
        
        const storageKey = userIdStr ? `${baseKey}-user-${userIdStr}` : `${baseKey}-local`
        console.log(`[Persistence] Loading from key: ${storageKey}`)
        
        try {
          const storedValue = await window.spark.kv.get<T>(storageKey)
          
          if (storedValue !== undefined && storedValue !== null) {
            console.log(`[Persistence] Loaded data from ${storageKey}:`, storedValue)
            setValue(storedValue)
          } else {
            console.log(`[Persistence] No data found at ${storageKey}, using default`)
            setValue(defaultValueRef.current)
          }
        } catch (kvError) {
          console.error('[Persistence] Error loading from KV:', kvError)
          setValue(defaultValueRef.current)
        }
        
        isInitializedRef.current = true
      } catch (error) {
        console.error('[Persistence] Error during initialization:', error)
        setValue(defaultValueRef.current)
        isInitializedRef.current = true
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    initialize()

    return () => {
      mounted = false
    }
  }, [baseKey])

  const setValueAndPersist = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const valueToSet = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue
      
      if (isInitializedRef.current) {
        const storageKey = userIdRef.current ? `${baseKey}-user-${userIdRef.current}` : `${baseKey}-local`
        console.log(`[Persistence] Saving to ${storageKey}:`, valueToSet)
        window.spark.kv.set(storageKey, valueToSet).catch(err => {
          console.error('Failed to persist game state:', err)
        })
      }
      
      return valueToSet
    })
  }

  const deleteValue = async () => {
    const storageKey = userIdRef.current ? `${baseKey}-user-${userIdRef.current}` : `${baseKey}-local`
    await window.spark.kv.delete(storageKey)
    setValue(defaultValueRef.current)
  }

  return [value, setValueAndPersist, deleteValue, isLoading, userId] as const
}

export async function migrateLocalDataToUser(baseKey: string, userId: string) {
  const localKey = `${baseKey}-local`
  const userKey = `${baseKey}-user-${userId}`
  
  const localData = await window.spark.kv.get(localKey)
  
  if (localData) {
    const existingUserData = await window.spark.kv.get(userKey)
    
    if (!existingUserData) {
      await window.spark.kv.set(userKey, localData)
      return true
    }
  }
  
  return false
}

export async function syncGameStateToGitHub<T>(baseKey: string, userId: string, data: T) {
  const userKey = `${baseKey}-user-${userId}`
  await window.spark.kv.set(userKey, data)
}

export async function loadGameStateFromGitHub<T>(baseKey: string, userId: string, defaultValue: T): Promise<T> {
  const userKey = `${baseKey}-user-${userId}`
  const data = await window.spark.kv.get<T>(userKey)
  return data ?? defaultValue
}
