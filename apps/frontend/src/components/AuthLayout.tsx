import type { InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import PalmFrond from './ds/botanical/PalmFrond'
import SoilWaves from './ds/botanical/SoilWaves'
import SunRays from './ds/botanical/SunRays'

/* ── 2-column Auth Shell ─────────────────────────────────────────── */

type AuthShellProps = {
  panel: ReactNode
  children: ReactNode
}

export function AuthShell({ panel, children }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[640px_1fr]" style={{ background: 'var(--cream)' }}>
      {/* ── Left panel — dark forest ─────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col overflow-hidden"
        style={{ background: 'var(--forest)', color: 'var(--paper)' }}
      >
        <PalmFrond size={620} style={{ position: 'absolute', right: -160, top: -80, color: 'var(--paper)', opacity: 0.07 }} />
        <SoilWaves width={520} height={120} style={{ position: 'absolute', left: 0, bottom: 0, color: 'var(--amber)', opacity: 0.15 }} />
        <SunRays size={120} style={{ position: 'absolute', left: 64, top: 220, color: 'var(--amber-3)', opacity: 0.16 }} />

        {/* Wordmark */}
        <div className="relative shrink-0 p-10">
          <Link to="/" aria-label="Kembali ke beranda">
            <Logo size="sm" mono color="var(--paper)" wordColor="var(--paper)" />
          </Link>
        </div>

        {/* Center content */}
        <div className="relative flex flex-1 flex-col justify-center px-14 py-8">
          {panel}
        </div>

        {/* Footer */}
        <div className="relative shrink-0 flex justify-between px-14 pb-8 text-xs" style={{ color: 'rgba(251,248,241,0.38)' }}>
          <span>© 2026 SawitHub</span>
          <span className="flex gap-3">
            <Link to="/bantuan" className="hover:text-white/70 transition-colors">Bantuan</Link>
            <Link to="/privasi" className="hover:text-white/70 transition-colors">Privasi</Link>
            <Link to="/syarat" className="hover:text-white/70 transition-colors">Syarat</Link>
          </span>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div
        className="flex flex-col min-h-screen lg:min-h-0"
        style={{ background: 'var(--cream)' }}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-5 lg:hidden" style={{ borderBottom: '1px solid var(--line)' }}>
          <Link to="/" aria-label="Beranda SawitHub"><Logo size="sm" /></Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Legacy AuthLayout ────────────────────────────────────────────── */
type AuthLayoutProps = {
  children: ReactNode
  actionLabel: string
  actionTo: string
  actionText?: string
  maxWidth?: string
}

export function AuthLayout({ children, actionLabel, actionTo, actionText, maxWidth = 'max-w-sm' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <Link to="/" aria-label="Beranda SawitHub"><Logo size="md" /></Link>
        <Link to={actionTo} className="text-sm font-medium transition-colors" style={{ color: 'var(--ink-3)' }}>
          {actionText ? <span className="hidden sm:inline">{actionText} </span> : null}
          <span style={{ color: 'var(--forest)', fontWeight: 600 }}>{actionLabel}</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className={`w-full ${maxWidth}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

/* ── AuthInput ────────────────────────────────────────────────────── */

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  helper?: ReactNode
  rightLabel?: ReactNode
  leftIcon?: ReactNode
}

export function AuthInput({ id, label, error, helper, rightLabel, leftIcon, className = '', style, ...props }: AuthInputProps) {
  const describedBy = [helper ? `${id}-help` : '', error ? `${id}-error` : '']
    .filter(Boolean).join(' ') || undefined

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="sh-label">{label}</label>
        {rightLabel ? <span className="text-xs" style={{ color: 'var(--ink-4)' }}>{rightLabel}</span> : null}
      </div>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center" style={{ color: 'var(--ink-4)' }}>
            {leftIcon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'sh-input',
            error ? 'border-terracotta-2' : '',
            className,
          ].filter(Boolean).join(' ')}
          style={{ ...(leftIcon ? { paddingLeft: 42 } : {}), ...style }}
          {...props}
        />
      </div>
      {helper ? <p id={`${id}-help`} className="mt-1.5 text-xs" style={{ color: 'var(--ink-4)' }}>{helper}</p> : null}
      {error ? <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--terracotta-2)' }}>{error}</p> : null}
    </div>
  )
}

/* ── AuthSubmitButton ─────────────────────────────────────────────── */

export function AuthSubmitButton({ loading, loadingLabel, children }: { loading: boolean; loadingLabel: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="sh-btn sh-btn-primary sh-btn-lg w-full mt-2 disabled:cursor-not-allowed disabled:opacity-55"
      style={{ borderRadius: '999px' }}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}

/* ── AuthPasswordToggle ───────────────────────────────────────────── */

export function AuthPasswordToggle({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
      className="absolute right-3 top-1/2 min-h-10 min-w-10 -translate-y-1/2 flex items-center justify-center transition-colors focus-visible:outline-none"
      style={{ color: 'var(--ink-4)' }}
    >
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

/* ── AuthTrustNote ────────────────────────────────────────────────── */

export function AuthTrustNote({ children }: { children: ReactNode }) {
  return (
    <div className="sh-card mt-4 text-[13px] leading-6" style={{ color: 'var(--ink-3)' }}>
      {children}
    </div>
  )
}
