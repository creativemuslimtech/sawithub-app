import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import api from '../api/client'
import { AuthContext, type User } from './auth'

function clearStoredAuth() {
  localStorage.removeItem('sawit_token')
  localStorage.removeItem('sawit_user')
}

function getStoredUser() {
  const token = localStorage.getItem('sawit_token')
  const stored = localStorage.getItem('sawit_user')

  if (!token || !stored) return null

  try {
    return JSON.parse(stored) as User
  } catch {
    clearStoredAuth()
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('sawit_token')))

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem('sawit_user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('sawit_user')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('sawit_token')
    if (!token) {
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
        clearStoredAuth()
        setUser(null)
      }
      return null
    }
  }, [persistUser])

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
    localStorage.setItem('sawit_token', data.token)
    persistUser(data.user)
  }

  const logout = () => {
    clearStoredAuth()
    setUser(null)
    window.location.href = '/'
  }

  const logoutAll = async () => {
    await api.post('/IdentitySessionService/logout-all')
    clearStoredAuth()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
