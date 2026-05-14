import { useEffect } from 'react'
import api from '../api/client'

function getOrCreate(key: string, gen: () => string): string {
  let val = localStorage.getItem(key)
  if (!val) { val = gen(); localStorage.setItem(key, val) }
  return val
}

function randomId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function detectDevice(): 'web' | 'mobile' {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'web'
}

export function useVisitTracker() {
  useEffect(() => {
    const sessionKey = 'swh_session'
    let sessionId = sessionStorage.getItem(sessionKey)
    if (sessionId) return // already tracked this session

    sessionId = randomId()
    sessionStorage.setItem(sessionKey, sessionId)

    const visitorId = getOrCreate('swh_visitor', randomId)

    api.post('/visit', {
      session_id: sessionId,
      visitor_id: visitorId,
      device_type: detectDevice(),
      page: window.location.pathname,
    }).catch(() => {})
  }, [])
}
