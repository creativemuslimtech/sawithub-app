import type { InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

/* ── 2-column Auth Shell ─────────────────────────────────────────── */

type AuthShellProps = {
  /** Panel kiri — konten branding/marketing */
  panel: ReactNode
  /** Panel kanan — form */
  children: ReactNode
}

export function AuthShell({ panel, children }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── Left panel — dark ink ────────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col overflow-hidden"
        style={{ background: 'var(--ink)', color: 'var(--paper)' }}
      >
        {/* Radial decorations */}
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 10% 90%, var(--emerald-3), transparent 40%), radial-gradient(circle at 80% 20%, var(--terra), transparent 30%)',
          opacity: 0.05,
        }} />
        {/* Watermark logo */}
        <div className="pointer-events-none absolute -right-28 -bottom-20 opacity-[0.08]" style={{ color: 'white' }}>
          <Logo size="lg" showText={false} mono />
        </div>

        {/* Wordmark */}
        <div className="relative shrink-0 p-8 lg:p-10">
          <Link to="/" aria-label="Kembali ke beranda">
            <Logo size="sm" mono />
          </Link>
        </div>

        {/* Center content — passed in as panel */}
        <div className="relative flex flex-1 flex-col justify-center px-10 py-8 pr-14">
          {panel}
        </div>

        {/* Footer */}
        <div className="relative shrink-0 flex justify-between px-10 pb-8 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
          <span>© 2026 SawitHub</span>
          <span className="flex gap-3">
            <Link to="/bantuan" className="hover:text-white/70 transition-colors">Bantuan</Link>
            <Link to="/privasi" className="hover:text-white/70 transition-colors">Privasi</Link>
            <Link to="/syarat" className="hover:text-white/70 transition-colors">Syarat</Link>
          </span>
        </div>
      </div>

      {/* ── Right panel — cream paper ────────────────────────── */}
      <div
        className="flex flex-col min-h-screen lg:min-h-0"
        style={{ background: 'var(--paper)' }}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-5 lg:hidden border-b border-line">
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

/* ── Legacy AuthLayout (single-column wrapper — kept for compat) ──── */
type AuthLayoutProps = {
  children: ReactNode
  actionLabel: string
  actionTo: string
  actionText?: string
  maxWidth?: string
}

export function AuthLayout({ children, actionLabel, actionTo, actionText, maxWidth = 'max-w-sm' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="flex items-center justify-between px-6 py-5 border-b border-line">
        <Link to="/" aria-label="Beranda SawitHub"><Logo size="md" /></Link>
        <Link to={actionTo} className="text-sm font-medium text-ink-3 hover:text-ink transition-colors">
          {actionText ? <span className="hidden sm:inline">{actionText} </span> : null}
          <span className="text-emerald font-semibold">{actionLabel}</span>
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

/* ── AuthInput ──────────────────────────────────────────────────────── */

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  helper?: ReactNode
  rightLabel?: ReactNode
  leftIcon?: ReactNode
}

export function AuthInput({ id, label, error, helper, rightLabel, leftIcon, className = '', ...props }: AuthInputProps) {
  const describedBy = [helper ? `${id}-help` : '', error ? `${id}-error` : '']
    .filter(Boolean).join(' ') || undefined

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">{label}</label>
        {rightLabel ? <span className="text-xs text-ink-4">{rightLabel}</span> : null}
      </div>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-4">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'w-full rounded-md-1 border border-line bg-surface px-3.5 py-3.5 text-sm text-ink placeholder:text-ink-4 transition-colors',
            'focus:border-emerald focus:outline-none',
            error ? 'border-terra-2' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
      </div>
      {helper ? <p id={`${id}-help`} className="mt-1.5 text-xs text-ink-4">{helper}</p> : null}
      {error ? <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-terra-2">{error}</p> : null}
    </div>
  )
}

/* ── AuthSubmitButton ───────────────────────────────────────────────── */

export function AuthSubmitButton({ loading, loadingLabel, children }: { loading: boolean; loadingLabel: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-paper hover:bg-emerald-2 transition-colors disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {loading ? loadingLabel : children}
    </button>
  )
}

/* ── AuthPasswordToggle ─────────────────────────────────────────────── */

export function AuthPasswordToggle({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
      className="absolute right-3 top-1/2 min-h-10 min-w-10 -translate-y-1/2 flex items-center justify-center text-ink-4 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
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

/* ── AuthTrustNote ──────────────────────────────────────────────────── */

export function AuthTrustNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg-1 border border-line bg-surface p-4 text-[13px] leading-6 text-ink-3">
      {children}
    </div>
  )
}
