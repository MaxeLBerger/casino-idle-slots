import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'

export interface UserInfo {
  id: number
  login: string
  avatarUrl: string
  email: string
  isOwner: boolean
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const user = await window.spark.user()
    return user || null
  } catch {
    return null
  }
}

export function useUserLinkedKV<T>(baseKey: string, defaultValue: T) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const userSpecificKey = userId ? `${baseKey}-user-${userId}` : `${baseKey}-local`
  const [value, setValue, deleteValue] = useKV<T>(userSpecificKey, defaultValue)

  useEffect(() => {
    let mounted = true
    
    getCurrentUser().then(user => {
      if (!mounted) return
      
      if (user) {
        setUserId(user.id.toString())
      } else {
        setUserId(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

  return [value, setValue, deleteValue, isLoading, userId] as const
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
