import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import toast from 'react-hot-toast'
import { trackEvent, GAEvents } from '../utils/analytics'
import { getApiErrorMessage } from '../utils/apiError'
import { AuthShell, AuthInput, AuthPasswordToggle, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'
import Card from '../components/ds/Card'
import { UserIcon, MailIcon, LockIcon, ArrowIcon } from '../components/ds/icons'

function isEmail(val: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) }
function isPhone(val: string) { return /^[0-9+\-\s]{8,15}$/.test(val) }

const PhoneIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)

/* ── Left panel content ─────────────────────────────────────────── */
function LoginPanel() {
  return (
    <div>
      <div style={{
        fontSize: 11, color: 'var(--amber-3)', letterSpacing: '.18em',
        textTransform: 'uppercase', fontWeight: 600, marginBottom: 18,
      }}>
        —— Selamat datang kembali
      </div>
      <h1 className="sh-h-1" style={{ color: 'var(--paper)', maxWidth: 480, marginBottom: 26 }}>
        Catatan kebun yang{' '}
        <em className="sh-italic" style={{ color: 'var(--amber-3)' }}>tak&nbsp;pernah&nbsp;basah</em>{' '}
        kena hujan.
      </h1>
      <p style={{ fontSize: 16, color: 'rgba(251,248,241,0.7)', maxWidth: 460, lineHeight: 1.55, marginBottom: 32 }}>
        Buka SawitHub dan lanjutkan dari panen terakhir kemarin. Semua data tersimpan di tempat yang sama.
      </p>

      {/* Quote card */}
      <Card padded={false} style={{
        background: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 22,
        color: 'var(--paper)',
      }}>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 48, color: 'var(--amber-3)', lineHeight: 0.5, marginBottom: 8 }}>"</div>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 18, lineHeight: 1.45, fontWeight: 400, color: 'var(--paper)' }}>
          Sebelum pakai, catatan panen ada di buku tulis. Sekarang anak saya foto setruk timbangan, dan saya tahu untungnya berapa malam itu juga.
        </p>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--amber-soft)', color: 'var(--forest)', display: 'grid', placeItems: 'center' }}>
            <UserIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Pak Suparman</div>
            <div style={{ fontSize: 11, color: 'rgba(251,248,241,0.6)' }}>Petani · Riau · 3,2 ha</div>
          </div>
        </div>
      </Card>
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

  const inputType = identifier.length === 0 ? 'empty'
    : isEmail(identifier) ? 'email'
    : isPhone(identifier) ? 'phone'
    : 'username'

  const identifierIcon = inputType === 'phone' ? <PhoneIcon size={18} />
    : inputType === 'username' ? <UserIcon size={18} />
    : <MailIcon size={18} />

  const inputHint = inputType === 'email' ? 'Email'
    : inputType === 'phone' ? 'No. HP'
    : inputType === 'username' ? 'Username'
    : undefined

  return (
    <AuthShell panel={<LoginPanel />}>
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Masuk ke akun</div>
      <h2 className="sh-h-2" style={{ marginBottom: 12 }}>Lanjutkan ke kebun kamu.</h2>
      <p className="mb-8 text-sm leading-6" style={{ color: 'var(--ink-3)' }}>
        Belum punya akun?{' '}
        <Link to="/signup" className={authLinkClass} style={{ color: 'var(--forest)', fontWeight: 600 }}>Daftar gratis →</Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="login-identifier"
          label="Nomor WhatsApp atau email"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
          autoFocus
          placeholder="email, username, atau 08xx..."
          autoComplete="username"
          rightLabel={inputHint}
          error={formError || undefined}
          leftIcon={identifierIcon}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="sh-label">Kata sandi</label>
            <Link to="/forgot-password" className="text-xs" style={{ color: 'var(--forest)', fontWeight: 600 }}>Lupa kata sandi?</Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center" style={{ color: 'var(--ink-4)' }}>
              <LockIcon size={18} />
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
              className="sh-input"
              style={{ paddingLeft: 42, paddingRight: 80 }}
            />
            <AuthPasswordToggle show={showPw} onClick={() => setShowPw(p => !p)} />
          </div>
          {formError && <p id="login-password-error" role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--terracotta-2)' }}>{formError}</p>}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--forest)' }} />
          Ingat saya di perangkat ini
        </label>

        <AuthSubmitButton loading={loading} loadingLabel="Masuk...">
          Masuk ke SawitHub <ArrowIcon size={16} />
        </AuthSubmitButton>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
        <span style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>atau lewat</span>
        <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="sh-btn sh-btn-ghost"
          style={{ borderRadius: 999 }}
        >
          <span style={{ fontWeight: 700, color: '#25D366', fontSize: 18 }}>◉</span>
          WhatsApp OTP
        </button>
        <button
          type="button"
          className="sh-btn sh-btn-ghost"
          style={{ borderRadius: 999 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M5 12a7 7 0 0 1 12-5l2.6-2.6A11 11 0 0 0 1 12l4-1.1c.4-1 1.1-1.8 2-2.4Z"/>
            <path fill="#34A853" d="M3.1 17.5A11 11 0 0 0 12 23a11 11 0 0 0 10.6-7.8l-4.6-1.2A6 6 0 0 1 7.2 15Z"/>
            <path fill="#FBBC05" d="M3.1 17.5 7.2 15c-.3-.8-.4-1.7-.3-2.6L2.4 11A11 11 0 0 0 3 17.5Z"/>
            <path fill="#4285F4" d="M22.6 15.2c.3-1 .4-2 .4-3.2 0-.8-.1-1.6-.2-2.4H12v4.6h6c-.3 1.5-1.2 2.7-2.5 3.5l4.6 1.2c1.4-1.3 2.3-3 2.5-3.7Z"/>
          </svg>
          Google
        </button>
      </div>

      <div className="mt-6 text-xs text-center" style={{ color: 'var(--ink-4)', lineHeight: 1.55 }}>
        Dengan masuk, kamu setuju dengan{' '}
        <Link to="/syarat" style={{ color: 'var(--forest)', textDecoration: 'underline' }}>Syarat Layanan</Link>
        {' '}dan{' '}
        <Link to="/privasi" style={{ color: 'var(--forest)', textDecoration: 'underline' }}>Kebijakan Privasi</Link>{' '}
        SawitHub.
      </div>
    </AuthShell>
  )
}
