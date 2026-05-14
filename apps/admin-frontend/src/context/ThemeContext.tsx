import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../api/client'

export interface ThemeConfig {
  primaryColor: string
  bgColor: string
  fontFamily: string
  logoUrl: string
  updatedAt: string
}

interface ThemeContextType {
  theme: ThemeConfig | null
  loading: boolean
  error: string | null
}

const FALLBACK_THEME: ThemeConfig = {
  primaryColor: '#16a34a',
  bgColor: '#0f0f23',
  fontFamily: 'Inter',
  logoUrl: '/logo.png',
  updatedAt: new Date().toISOString(),
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(FALLBACK_THEME)
  const loading = false
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    applyTheme(FALLBACK_THEME)

    const fetchTheme = async () => {
      try {
        console.log('🎨 ThemeContext: Fetching theme from /api/config/theme')
        const response = await apiClient.get('/config/theme', { timeout: 3000 })
        console.log('🎨 ThemeContext: Theme loaded:', response.data)
        setTheme(response.data as ThemeConfig)
        setError(null)
        applyTheme(response.data as ThemeConfig)
        console.log('🎨 ThemeContext: CSS variables applied')
      } catch (err) {
        console.warn('🎨 ThemeContext: Failed to fetch theme, using fallback:', err)
        setTheme(FALLBACK_THEME)
        applyTheme(FALLBACK_THEME)
        setError(err instanceof Error ? err.message : 'Failed to fetch theme')
        console.log('🎨 ThemeContext: Fallback theme applied')
      }
    }

    fetchTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, loading, error }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

function applyTheme(config: ThemeConfig) {
  const root = document.documentElement

  root.style.setProperty('--color-primary', config.primaryColor)
  root.style.setProperty('--color-bg', config.bgColor)
  root.style.setProperty('--font-family', config.fontFamily)

  document.documentElement.style.fontFamily = config.fontFamily
  document.body.style.backgroundColor = config.bgColor
}
