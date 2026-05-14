import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { trackEvent, GAEvents } from '../utils/analytics'

type Props = {
  open: boolean
  onClose: () => void
  message: string
  /** Session-scoped analytics surface (e.g. add_panen, add_lahan, export_laporan). */
  surface: string
}

export default function SubscriptionGateSheet({ open, onClose, message, surface }: Props) {
  const fired = useRef(false)

  useEffect(() => {
    if (!open) {
      fired.current = false
      return
    }
    if (fired.current) return
    const key = `subscription_gate_view:${surface}`
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) {
      fired.current = true
      return
    }
    fired.current = true
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, '1')
    trackEvent(GAEvents.SUBSCRIPTION_GATE_VIEW, { surface })
  }, [open, surface])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center px-3 pb-4 sm:items-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-gate-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl"
        style={{
          background: 'linear-gradient(155deg, rgba(16,24,20,0.98), rgba(10,8,24,0.98))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">
          Langganan diperlukan
        </p>
        <h2 id="subscription-gate-title" className="mt-2 text-xl font-semibold text-white">
          Aksi ini dibatasi
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/72">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="secondary-button min-h-11 w-full sm:w-auto"
            onClick={onClose}
          >
            Tutup
          </button>
          <Link
            to="/subscription"
            className="primary-button min-h-11 w-full text-center sm:w-auto"
            onClick={onClose}
          >
            Kelola langganan
          </Link>
        </div>
      </div>
    </div>
  )
}
