import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
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

interface AuthState {
  user: AdminUser | null
  token: string | null
  setUser: (user: AdminUser | null) => void
  setToken: (token: string | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clear: () => set({ user: null, token: null }),
    }),
    { name: 'sawit_admin_auth' }
  )
)
