import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'
import { useAuthStore, type AdminUser } from '../stores/authStore'

export type { AdminUser as User }

interface AuthCtx {
  user: AdminUser | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Revoke all admin sessions server-side, then clear local state. */
  logoutAll: () => Promise<void>
  refreshUser: () => Promise<AdminUser | null>
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: storedUser, token, setUser, setToken, clear } = useAuthStore()
  const [user, setLocalUser] = useState<AdminUser | null>(storedUser)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  const persistUser = (nextUser: AdminUser | null) => {
    setLocalUser(nextUser)
    setUser(nextUser)
  }

  const refreshUser = async () => {
    if (!useAuthStore.getState().token) {
      persistUser(null)
      return null
    }
    try {
      const { data } = await api.get('/admin/auth/me')
      const nextUser = data.user as AdminUser
      persistUser(nextUser)
      return nextUser
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        clear()
        setLocalUser(null)
      }
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    if (!useAuthStore.getState().token) {
      setIsLoading(false)
      return
    }
    ;(async () => {
      await refreshUser()
      if (mounted) setIsLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post('/admin/auth/login', { identifier, password })
    setToken(data.token)
    persistUser(data.user)
  }

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout')
    } catch { /* best-effort */ }
    clear()
    setLocalUser(null)
    window.location.href = '/'
  }

  const logoutAll = async () => {
    await api.post('/admin/auth/logout-all')
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

export const useAuth = () => useContext(AuthContext)
