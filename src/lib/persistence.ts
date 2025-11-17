import { useEffect, useState, useRef } from 'react'

export interface UserInfo {
  id: number
  login: string
  avatarUrl: string
  email: string
  isOwner: boolean
}

let userCache: UserInfo | null | undefined = undefined
let userPromise: Promise<UserInfo | null> | null = null

export async function getCurrentUser(): Promise<UserInfo | null> {
  if (userCache !== undefined) {
    return userCache
  }
  
  if (userPromise) {
    return userPromise
  }
  
  userPromise = (async () => {
    try {
      if (!window.spark || !window.spark.user) {
        console.warn('[Persistence] Spark user API not available')
        userCache = null
        return null
      }
      
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
      const user = await Promise.race([window.spark.user(), timeoutPromise])
      userCache = user || null
      return userCache
    } catch (error) {
      console.error('[Persistence] Error getting user:', error)
      userCache = null
      return null
    } finally {
      userPromise = null
    }
  })()
  
  return userPromise
}

export function useUserLinkedKV<T>(baseKey: string, defaultValue: T) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [value, setValue] = useState<T>(defaultValue)
  const isInitializedRef = useRef(false)
  const userIdRef = useRef<string | null>(null)
  const defaultValueRef = useRef(defaultValue)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      if (isInitializedRef.current) return
      
      try {
        const user = await getCurrentUser()
        if (!mounted) return
        
        const userIdStr = user ? user.id.toString() : null
        setUserId(userIdStr)
        userIdRef.current = userIdStr
        
        const storageKey = userIdStr ? `${baseKey}-user-${userIdStr}` : `${baseKey}-local`
        
        try {
          const storedValue = await window.spark.kv.get<T>(storageKey)
          
          if (storedValue !== undefined && storedValue !== null) {
            if (mounted) {
              setValue(storedValue)
            }
          } else {
            if (mounted) {
              setValue(defaultValueRef.current)
            }
          }
        } catch (kvError) {
          console.error('[Persistence] Error loading from KV:', kvError)
          if (mounted) {
            setValue(defaultValueRef.current)
          }
        }
        
        isInitializedRef.current = true
      } catch (error) {
        console.error('[Persistence] Error during initialization:', error)
        if (mounted) {
          setValue(defaultValueRef.current)
        }
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
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [baseKey])

  const setValueAndPersist = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const valueToSet = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue
      
      if (isInitializedRef.current) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        
        saveTimeoutRef.current = setTimeout(() => {
          const storageKey = userIdRef.current ? `${baseKey}-user-${userIdRef.current}` : `${baseKey}-local`
          window.spark.kv.set(storageKey, valueToSet).catch(err => {
            console.error('[Persistence] Failed to persist:', err)
          })
        }, 2000)
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
