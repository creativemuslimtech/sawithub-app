import { useEffect, useState } from 'react'

type StandaloneNavigator = Navigator & { standalone?: boolean }

export default function useStandalonePWA() {
  const [isStandalonePWA, setIsStandalonePWA] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const syncDisplayMode = () => {
      setIsStandalonePWA(mediaQuery.matches || (window.navigator as StandaloneNavigator).standalone === true)
    }

    syncDisplayMode()
    mediaQuery.addEventListener('change', syncDisplayMode)

    return () => {
      mediaQuery.removeEventListener('change', syncDisplayMode)
    }
  }, [])

  return isStandalonePWA
}
