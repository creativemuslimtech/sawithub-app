import { createContext } from 'react'

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
  /** Server-backed JSON preferences (e.g. onboarding_done). */
  preferences?: Record<string, unknown>
}

export interface AuthCtx {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  /** Revoke all sessions (all devices) server-side, then clear local storage. */
  logoutAll: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

export const AuthContext = createContext<AuthCtx | undefined>(undefined)

