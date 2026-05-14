import { createContext } from 'react'
import { PUBLIC_ASSETS } from '../config/env'

export interface ThemeConfig {
  primaryColor: string
  bgColor: string
  fontFamily: string
  logoUrl: string
  updatedAt: string
}

export interface ThemeContextType {
  theme: ThemeConfig | null
  loading: boolean
  error: string | null
}

export const FALLBACK_THEME: ThemeConfig = {
  primaryColor: '#7a5cff',
  bgColor: '#0f0f23',
  fontFamily: 'Inter',
  logoUrl: PUBLIC_ASSETS.branding.logoMark,
  updatedAt: new Date().toISOString(),
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
