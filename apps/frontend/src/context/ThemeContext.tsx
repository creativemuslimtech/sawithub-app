import { useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../api/client'
import { FALLBACK_THEME, ThemeContext, type ThemeConfig } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(FALLBACK_THEME)
  const loading = false
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    applyTheme(FALLBACK_THEME)

    const fetchTheme = async () => {
      try {
        console.log('🎨 ThemeContext: Fetching theme from /api/PlatformThemeService')
        const response = await apiClient.get('/PlatformThemeService', { timeout: 3000 })
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

function applyTheme(_config: ThemeConfig) {
  // Theme is now fixed (light mode only); CSS tokens are set in index.css.
  // No dynamic overrides needed.
}
