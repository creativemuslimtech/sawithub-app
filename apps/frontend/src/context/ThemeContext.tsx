import { useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../api/client'
import { FALLBACK_THEME, ThemeContext, type ThemeConfig } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(FALLBACK_THEME)
  const loading = false
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await apiClient.get('/PlatformThemeService', { timeout: 3000 })
        setTheme(response.data as ThemeConfig)
        setError(null)
      } catch (err) {
        setTheme(FALLBACK_THEME)
        setError(err instanceof Error ? err.message : 'Failed to fetch theme')
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
