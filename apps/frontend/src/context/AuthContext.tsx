import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import api from '../api/client'
import { AuthContext, type User } from './auth'
import { useAuthStore } from '../stores/authStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: storedUser, token, setUser, setToken, clear } = useAuthStore()
  const [user, setLocalUser] = useState<User | null>(storedUser)
  const [isLoading, setIsLoading] = useState(() => Boolean(token))

  const persistUser = useCallback((nextUser: User | null) => {
    setLocalUser(nextUser)
    setUser(nextUser)
  }, [setUser])

  const refreshUser = useCallback(async () => {
    if (!useAuthStore.getState().token) {
      persistUser(null)
      return null
    }
    try {
      const { data } = await api.get('/IdentityAuthService/me')
      const nextUser = data.user as User
      persistUser(nextUser)
      return nextUser
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 401) {
        clear()
        setLocalUser(null)
      }
      return null
    }
  }, [persistUser, clear])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      await refreshUser()
      if (mounted) setIsLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [refreshUser])

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post('/IdentityAuthService/login', { identifier, password })
    setToken(data.token)
    persistUser(data.user)
  }

  const logout = () => {
    clear()
    setLocalUser(null)
    window.location.href = '/'
  }

  const logoutAll = async () => {
    await api.post('/IdentitySessionService/logout-all')
    clear()
    setLocalUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
