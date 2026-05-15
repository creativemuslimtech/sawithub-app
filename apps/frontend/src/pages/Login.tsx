import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import toast from 'react-hot-toast'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { trackEvent, GAEvents } from '../utils/analytics'
import { getApiErrorMessage } from '../utils/apiError'
import { AuthShell, AuthInput, AuthPasswordToggle, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'

function isEmail(val: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) }
function isPhone(val: string) { return /^[0-9+\-\s]{8,15}$/.test(val) }

/* ── Left panel content ─────────────────────────────────────────── */
const sparkData = [6, 9, 8, 12, 11, 15, 18, 22, 24].map((v, i) => ({ i, v }))

function LoginPanel() {
  return (
    <div>
      {/* Badge */}
      <div className="mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
        style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <span className="rounded-full bg-emerald px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">BARU</span>
        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Versi 2026 · 12.400+ petani sudah pakai</span>
      </div>

      {/* Quote */}
      <h2 className="display font-bold text-white leading-tight mb-6"
        style={{ fontSize: 42, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
        "Sekali isi panen, langsung tahu untung kebun."
      </h2>

      {/* Attribution */}
      <div className="flex items-center gap-3 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="h-11 w-11 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ background: 'rgba(255,255,255,0.1)' }}>🧑‍🌾</div>
        <div>
          <p className="text-sm font-bold text-white">Pak Suparman</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Petani Riau · 3,2 ha · Anggota sejak 2024</p>
        </div>
      </div>

      {/* Mini stat card */}
      <div className="mt-7 rounded-lg-1 p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Pendapatan tahun ini
          </span>
          <span className="text-[11px] font-bold rounded-full px-2 py-0.5"
            style={{ background: 'rgba(217,106,44,0.25)', color: 'var(--terra)' }}>↑ 18%</span>
        </div>
        <p className="num text-3xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>Rp 142,8jt</p>
        <div style={{ height: 48 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="loginSparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--terra)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--terra)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ display: 'none' }} />
              <Area dataKey="v" stroke="var(--terra)" fill="url(#loginSparkFill)" strokeWidth={1.8} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ── Login Form ──────────────────────────────────────────────────── */

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [navigate, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)
    try {
      await login(identifier.trim(), password)
      trackEvent(GAEvents.LOGIN_SUCCESS, { method: 'email' })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Login gagal.')
      trackEvent(GAEvents.FORM_ERROR, { form_name: 'login_form', error_type: 'login_error', error_message: msg })
      setFormError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputHint = identifier.length === 0 ? ''
    : isEmail(identifier) ? '✉️ Email'
    : isPhone(identifier) ? '📱 No. HP'
    : '👤 Username'

  return (
    <AuthShell panel={<LoginPanel />}>
      {/* Eyebrow */}
      <p className="eyebrow mb-2">Masuk</p>

      {/* Heading */}
      <h1 className="display text-3xl font-bold text-ink mb-2" style={{ letterSpacing: '-0.025em' }}>
        Selamat datang kembali.
      </h1>
      <p className="mb-8 text-sm leading-6 text-ink-3">
        Masuk untuk mengelola kebun. Belum punya akun?{' '}
        <Link to="/signup" className={authLinkClass}>Daftar gratis →</Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="login-identifier"
          label="Email / Username / No. HP"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
          autoFocus
          placeholder="email, username, atau 08xx..."
          autoComplete="username"
          rightLabel={inputHint || undefined}
          error={formError || undefined}
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          className="pl-10"
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-[13px] font-semibold text-ink-2">Password</label>
            <Link to="/forgot-password" className={`text-xs ${authLinkClass}`}>Lupa password?</Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? 'login-password-error' : undefined}
              className="w-full rounded-md-1 border border-line bg-surface py-3.5 pl-10 pr-12 text-sm text-ink placeholder:text-ink-4 transition-colors focus:border-emerald focus:outline-none"
            />
            <AuthPasswordToggle show={showPw} onClick={() => setShowPw(p => !p)} />
          </div>
          {formError && <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-terra-2">{formError}</p>}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 text-sm text-ink-3 cursor-pointer select-none">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-ink shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="m5 12 5 5 9-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Ingat saya di perangkat ini
        </label>

        <AuthSubmitButton loading={loading} loadingLabel="Masuk...">
          Masuk ke Dashboard →
        </AuthSubmitButton>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-4">atau lanjut dengan</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M5 12a7 7 0 0 1 12-5l2.6-2.6A11 11 0 0 0 1 12l4-1.1c.4-1 1.1-1.8 2-2.4Z"/>
            <path fill="#34A853" d="M3.1 17.5A11 11 0 0 0 12 23a11 11 0 0 0 10.6-7.8l-4.6-1.2A6 6 0 0 1 7.2 15Z"/>
            <path fill="#FBBC05" d="M3.1 17.5 7.2 15c-.3-.8-.4-1.7-.3-2.6L2.4 11A11 11 0 0 0 3 17.5Z"/>
            <path fill="#4285F4" d="M22.6 15.2c.3-1 .4-2 .4-3.2 0-.8-.1-1.6-.2-2.4H12v4.6h6c-.3 1.5-1.2 2.7-2.5 3.5l4.6 1.2c1.4-1.3 2.3-3 2.5-3.7Z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          OTP WhatsApp
        </button>
      </div>

      {/* Trust note */}
      <div className="mt-7 rounded-lg-1 border border-line bg-surface p-4 text-[13px] leading-6 text-ink-3">
        <strong className="text-ink">Data kebun kamu aman.</strong> Kami tidak menjual data petani. Masuk hanya lewat akun resmi SawitHub.
      </div>
    </AuthShell>
  )
}
