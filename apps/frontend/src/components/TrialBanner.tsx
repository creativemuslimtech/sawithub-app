import { useState } from 'react'
import { Link } from 'react-router-dom'
import { trackEvent, GAEvents } from '../utils/analytics'

const STORAGE_KEY = 'sawithub_trial_banner_dismiss_remaining'

type TrialBannerProps = {
  trialRemaining: number
}

/**
 * Dismissible urgency strip for trialing users (≤3 days left).
 * Reappears if remaining days drop below the last dismissed value.
 */
export default function TrialBanner({ trialRemaining }: TrialBannerProps) {
  const [dismissedAt, setDismissedAt] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw == null) return null
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  })

  if (trialRemaining > 3) return null
  if (dismissedAt !== null && trialRemaining >= dismissedAt) return null

  const handleDismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, String(trialRemaining))
    setDismissedAt(trialRemaining)
  }

  const handleCtaClick = () => {
    trackEvent(GAEvents.TRIAL_BANNER_CLICK, {
      trial_remaining: trialRemaining,
      surface: 'dashboard',
    })
  }

  return (
    <section
      className="rounded-[28px] border border-amber-400/30 bg-amber-400/[0.09] p-4 md:p-5"
      role="region"
      aria-label="Peringatan masa trial"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/90">Masa trial</p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-amber-50/95">
            Sisa {trialRemaining} hari. Perpanjang sekarang agar akses penuh tidak terputus.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            to="/subscription"
            onClick={handleCtaClick}
            className="primary-button min-h-10 px-4 py-2 text-sm"
          >
            Perpanjang
          </Link>
          <button type="button" onClick={handleDismiss} className="secondary-button min-h-10 px-4 py-2 text-xs">
            Tutup
          </button>
        </div>
      </div>
    </section>
  )
}
