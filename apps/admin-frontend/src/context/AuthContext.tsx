import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

export interface User {
  user_id?: string
  public_id?: string
  email: string
  username: string
  full_name: string
  phone?: string
  role?: 'user' | 'admin'
  created_at?: string
  updated_at?: string
}

interface AuthCtx {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Revoke all admin sessions server-side, then clear local storage (same as single-device logout). */
  logoutAll: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

function clearStoredAuth() {
  localStorage.removeItem('sawit_admin_token')
  localStorage.removeItem('sawit_admin_user')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem('sawit_admin_user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('sawit_admin_user')
    }
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('sawit_admin_token')
    if (!token) {
      persistUser(null)
      return null
    }

    try {
      const { data } = await api.get('/admin/auth/me')
      const nextUser = data.user as User
      persistUser(nextUser)
      return nextUser
    } catch (err: any) {
      if (err?.response?.status === 401) {
        clearStoredAuth()
        setUser(null)
      }
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('sawit_admin_token')
    const stored = localStorage.getItem('sawit_admin_user')

    if (!token) {
      setIsLoading(false)
      return
    }

    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        clearStoredAuth()
      }
    }

    ;(async () => {
      await refreshUser()
      if (mounted) setIsLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post('/admin/auth/login', { identifier, password })
    localStorage.setItem('sawit_admin_token', data.token)
    persistUser(data.user)
  }

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout')
    } catch {
      /* revoke JTI best-effort; always clear local session */
    }
    clearStoredAuth()
    setUser(null)
    window.location.href = '/'
  }

  const logoutAll = async () => {
    await api.post('/admin/auth/logout-all')
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

export const useAuth = () => useContext(AuthContext)
