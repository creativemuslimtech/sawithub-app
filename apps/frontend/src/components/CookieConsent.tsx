import { useEffect, useState } from 'react'
import { COOKIE_CONSENT_STORAGE_KEY, COOKIE_SETTINGS_EVENT } from '../constants/cookieConsent'

type GtagFn = (command: string, action: string, params: Record<string, string>) => void


const STORAGE_KEY = COOKIE_CONSENT_STORAGE_KEY

type Consent = 'accepted' | 'declined'

function updateAnalyticsConsent(consent: Consent) {
  if (typeof window === 'undefined') return
  const gtag = (window as Window & { gtag?: GtagFn }).gtag
  if (!gtag) return
  gtag('consent', 'update', {
    analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = window.localStorage.getItem(STORAGE_KEY) as Consent | null
    return saved !== 'accepted' && saved !== 'declined'
  })

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Consent | null
    if (saved === 'accepted' || saved === 'declined') {
      updateAnalyticsConsent(saved)
    }

    const openSettings = () => setVisible(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings)
  }, [])

  const choose = (consent: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, consent)
    updateAnalyticsConsent(consent)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div role="region" aria-labelledby="cookie-consent-title" className="fixed inset-x-3 bottom-24 z-50 rounded-2xl border border-white/15 bg-[#06100c]/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur sm:inset-x-auto sm:right-4 sm:max-w-md md:bottom-4">
      <p id="cookie-consent-title" className="text-sm font-semibold">Penggunaan cookie</p>
      <p className="mt-2 text-[15px] leading-7 text-white/75">
        Kami memakai cookie penting dan analitik untuk memahami halaman mana yang membantu pengguna. Data analitik dipakai untuk meningkatkan SawitHub, bukan untuk menjual data kebun Anda. Anda bisa membuka ulang pengaturan cookie dari footer kapan saja.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => choose('declined')}
          className="min-h-11 rounded-lg border border-white/15 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
        >
          Tolak analitik
        </button>
        <button
          type="button"
          onClick={() => choose('accepted')}
          className="min-h-11 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
        >
          Setuju
        </button>
      </div>
    </div>
  )
}
