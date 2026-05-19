import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import { trackEvent, GAEvents } from '../utils/analytics'

function isEmail(val: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) }
function isPhone(val: string) { return /^[0-9+\-\s]{8,15}$/.test(val) }

const INP_STYLE: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 14px 0 42px',
  borderRadius: 10, background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.12)',
  fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--paper)',
  outline: 'none', transition: 'border-color 0.15s',
}

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (user) navigate('/admin', { replace: true })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(identifier.trim(), password)
      trackEvent(GAEvents.LOGIN_SUCCESS, { method: 'email' })
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login gagal.'
      trackEvent(GAEvents.FORM_ERROR, { form_name: 'login_form', error_type: 'login_error', error_message: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const inputHint = identifier.length === 0 ? ''
    : isEmail(identifier) ? 'Email'
    : isPhone(identifier) ? 'No. Handphone'
    : 'Username'

  const now = new Date()
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative */}
      <div style={{ position: 'absolute', right: -240, top: -200, width: 900, height: 900, opacity: 0.04, pointerEvents: 'none' }}>
        <svg viewBox="0 0 400 400" fill="currentColor" style={{ color: 'var(--paper)', width: '100%', height: '100%' }}>
          <path d="M200 20 C140 20 80 60 60 120 C40 180 60 240 100 280 C140 320 180 340 200 380 C220 340 260 320 300 280 C340 240 360 180 340 120 C320 60 260 20 200 20Z" opacity="0.6" />
          <path d="M200 60 C160 60 110 90 95 140 C80 190 95 240 130 270 C165 300 185 320 200 350 C215 320 235 300 270 270 C305 240 320 190 305 140 C290 90 240 60 200 60Z" opacity="0.4" />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 180, opacity: 0.14, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1200 180" preserveAspectRatio="none" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,100 C200,140 400,60 600,100 C800,140 1000,60 1200,100 L1200,180 L0,180Z" fill="var(--amber)" opacity="0.5" />
          <path d="M0,120 C200,80 400,160 600,120 C800,80 1000,160 1200,120 L1200,180 L0,180Z" fill="var(--amber)" opacity="0.3" />
        </svg>
      </div>

      {/* Top strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 2 }}>
        <Logo size="md" />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 11.5 }}>
          <span style={{ padding: '4px 10px', background: 'rgba(184,84,43,0.18)', color: 'var(--paper)', borderRadius: 6, border: '1px solid rgba(184,84,43,0.3)', letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 11 }}>● Production</span>
          <span style={{ color: 'rgba(251,248,241,0.5)' }}>region: id-jakarta-1</span>
          <span style={{ color: 'rgba(251,248,241,0.5)' }}>v2.4.1</span>
        </div>
      </div>

      {/* Center form */}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '60px 48px', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: 'var(--amber-3)', letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, fontFamily: 'var(--f-mono)' }}>
              —— Staff portal · Restricted
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, lineHeight: 1.1, color: 'var(--paper)', margin: 0 }}>
              Masuk ke <em style={{ fontStyle: 'italic', color: 'var(--amber-3)' }}>Command&nbsp;Center</em>.
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(251,248,241,0.7)', marginTop: 14, lineHeight: 1.55 }}>
              Hanya untuk staf SawitHub yang terdaftar. Semua akses dicatat dan diaudit secara real-time.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email / Identifier */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(251,248,241,0.7)', letterSpacing: '.05em' }}>
                    Email perusahaan
                  </label>
                  {inputHint && <span style={{ fontSize: 11, color: 'rgba(251,248,241,0.4)' }}>{inputHint}</span>}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(251,248,241,0.4)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    autoFocus
                    placeholder="email atau username..."
                    style={INP_STYLE}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--amber-3)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(251,248,241,0.7)', letterSpacing: '.05em' }}>Kata sandi</label>
                  <a href="#" style={{ fontSize: 11, color: 'var(--amber-3)', fontWeight: 600, textDecoration: 'none' }}>Reset via SSO</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(251,248,241,0.4)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan kata sandi"
                    style={{ ...INP_STYLE, paddingRight: 48 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--amber-3)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'rgba(251,248,241,0.4)', cursor: 'pointer' }}
                  >
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 2FA OTP — optional, shown only after backend enables it per-user */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(251,248,241,0.7)', letterSpacing: '.05em' }}>
                    Kode 2FA (TOTP)
                  </label>
                  <span style={{ fontSize: 10, color: 'rgba(251,248,241,0.35)', fontFamily: 'var(--f-mono)' }}>opsional · lewati jika belum dikonfigurasi</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      style={{
                        width: '100%', minWidth: 0, height: 48, textAlign: 'center',
                        borderRadius: 10, background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 500, color: 'var(--paper)',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6, height: 50,
                  background: 'var(--amber)', color: '#2B1F00',
                  borderRadius: 10, border: 0,
                  fontFamily: 'var(--f-body)', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Masuk...' : <>Masuk ke Command Center <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
              </button>

              {/* Security notice */}
              <div style={{ padding: 12, background: 'rgba(184,84,43,0.1)', border: '1px solid rgba(184,84,43,0.25)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--terracotta)', marginTop: 1, flexShrink: 0 }}>●</span>
                <div style={{ fontSize: 11.5, color: 'rgba(251,248,241,0.8)', lineHeight: 1.55, fontFamily: 'var(--f-mono)' }}>
                  Login dari IP <span style={{ color: 'var(--paper)', fontWeight: 600 }}>182.1.x.x</span> — sesi terkunci 8 jam, lalu re-auth.
                  Akses tak sah dilaporkan ke security@sawithub dalam 30 detik.
                </div>
              </div>
            </div>
          </form>

          <div style={{ marginTop: 24, fontSize: 11.5, color: 'rgba(251,248,241,0.5)', textAlign: 'center', fontFamily: 'var(--f-mono)' }}>
            Bukan staf?{' '}
            <a href="/" style={{ color: 'var(--amber-3)', textDecoration: 'none' }}>Buka aplikasi petani →</a>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(251,248,241,0.5)', position: 'relative', zIndex: 2 }}>
        <span>Last successful login · 12 jam lalu · MacBook Pro · Chrome 124</span>
        <span>build a8f3b2c · uptime 99.98% · {timeStr}</span>
      </div>
    </div>
  )
}
