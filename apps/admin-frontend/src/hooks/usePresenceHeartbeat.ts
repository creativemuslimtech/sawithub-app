import { useEffect } from 'react'
import api from '../api/client'

const PRESENCE_INTERVAL_MS = 60_000

export function usePresenceHeartbeat() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let inFlight = false

    const hasToken = () => Boolean(localStorage.getItem('sawit_token'))

    const sendHeartbeat = async () => {
      if (!hasToken() || document.visibilityState !== 'visible' || inFlight) return
      inFlight = true
      try {
        await api.get('/auth/ping')
      } catch {
        // Auth interceptor already handles expired tokens.
      } finally {
        inFlight = false
      }
    }

    const startHeartbeat = () => {
      if (intervalId) return
      intervalId = setInterval(() => {
        void sendHeartbeat()
      }, PRESENCE_INTERVAL_MS)
    }

    const stopHeartbeat = () => {
      if (!intervalId) return
      clearInterval(intervalId)
      intervalId = null
    }

    const handleVisibilityChange = () => {
      if (!hasToken()) {
        stopHeartbeat()
        return
      }

      if (document.visibilityState === 'visible') {
        void sendHeartbeat()
        startHeartbeat()
      } else {
        stopHeartbeat()
      }
    }

    if (hasToken() && document.visibilityState === 'visible') {
      void sendHeartbeat()
      startHeartbeat()
    }

    window.addEventListener('focus', handleVisibilityChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopHeartbeat()
      window.removeEventListener('focus', handleVisibilityChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
