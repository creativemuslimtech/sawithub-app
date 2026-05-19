import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { trackEvent, GAEvents, setUserId, setUserProperties } from '../utils/analytics'
import { getApiErrorMessage } from '../utils/apiError'
import { SUBSCRIPTION_TRIAL_DAYS } from '../copy/productConstants'
import { AuthShell, AuthInput, AuthPasswordToggle, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'
import { UserIcon } from '../components/ds/icons'

function buildTrialUsername(name: string, email: string) {
  const emailPrefix = email.split('@')[0] || ''
  const baseSource = emailPrefix || name || 'petani'
  const base = baseSource
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 22) || 'petani'
  const suffix = Date.now().toString(36).slice(-5)
  return `${base}_${suffix}`.slice(0, 30)
}

function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SignupPanel() {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--amber-3)', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>
        —— Daftar gratis · {SUBSCRIPTION_TRIAL_DAYS} hari
      </div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 40, fontWeight: 400, color: 'var(--paper)', lineHeight: 1.1, marginBottom: 24 }}>
        Mulai dari <em style={{ color: 'var(--amber-3)' }}>panen minggu ini</em>.
      </h2>
      <p style={{ fontSize: 16, color: 'rgba(251,248,241,0.7)', lineHeight: 1.55, marginBottom: 32 }}>
        Buat akun dalam 2 menit. Tanpa kartu kredit. Catat panen pertama hari ini juga.
      </p>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 22, color: 'var(--paper)' }}>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 48, color: 'var(--amber-3)', lineHeight: 0.5, marginBottom: 8 }}>"</div>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 17, lineHeight: 1.45, color: 'var(--paper)' }}>
          Hasil panen naik 14% dalam setahun. Jadwal pupuknya tidak pernah terlewat.
        </p>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--amber-soft)', color: 'var(--forest)', display: 'grid', placeItems: 'center' }}>
            <UserIcon size={14} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Pak Yusran</div>
            <div style={{ fontSize: 10.5, color: 'rgba(251,248,241,0.6)' }}>Petani · Sumut · 8,5 ha</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama_lengkap: '', phone: '', email: '', password: '' })
  const [role, setRole] = useState<'petani' | 'koperasi'>('petani')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formStarted, setFormStarted] = useState(false)
  const passwordError = form.password.length > 0 && form.password.length < 8 ? 'Password minimal 8 karakter.' : ''

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleFormStart = () => {
    if (!formStarted) {
      trackEvent(GAEvents.SIGNUP_START, { form_name: 'signup_form', signup_flow: 'simplified_trial' })
      trackEvent(GAEvents.FORM_START, { form_name: 'signup_form' })
      setFormStarted(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password minimal 8 karakter.')
      return
    }
    setLoading(true)
    try {
      const username = buildTrialUsername(form.nama_lengkap.trim(), form.email.trim())
      const response = await api.post('/IdentityAuthService/register', {
        full_name: form.nama_lengkap,
        username,
        phone: form.phone,
        email: form.email,
        password: form.password,
      })

      trackEvent(GAEvents.SIGNUP_SUCCESS, { method: 'email', form_name: 'signup_form' })

      if (response.data?.user_id) {
        setUserId(response.data.user_id)
        setUserProperties({
          user_type: 'petani_sawit',
          signup_date: new Date().toISOString(),
          signup_method: 'email',
          signup_flow: 'simplified_trial',
        })
      }

      window.localStorage.setItem('sawithub_show_onboarding_checklist', '1')
      toast.success('Pendaftaran berhasil! Silakan masuk.')
      navigate('/login')
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Pendaftaran gagal.')
      trackEvent(GAEvents.FORM_ERROR, { form_name: 'signup_form', error_type: 'api_error', error_message: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const strengthScore = form.password.length >= 12 ? 4 : form.password.length >= 10 ? 3 : form.password.length >= 8 ? 2 : form.password.length > 0 ? 1 : 0
  const strengthColors = ['var(--line)', 'var(--terracotta)', 'var(--amber)', 'var(--amber-2)', 'var(--forest)']
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][strengthScore]

  return (
    <AuthShell panel={<SignupPanel />}>
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Buat akun</div>
      <h1 className="sh-h-3" style={{ marginBottom: 10 }}>Gabung 12.418 petani.</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 26 }}>
        Sudah punya akun?{' '}
        <Link to="/login" className={authLinkClass}>Masuk →</Link>
      </p>

      {/* Role picker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {([
          { l: 'Petani', sub: 'Kebun pribadi / keluarga', value: 'petani' as const },
          { l: 'Koperasi', sub: 'Pengurus kelompok tani', value: 'koperasi' as const },
        ]).map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            style={{
              padding: 14, borderRadius: 12,
              border: `1.5px solid ${role === r.value ? 'var(--forest)' : 'var(--line)'}`,
              background: role === r.value ? 'var(--forest-tint)' : 'var(--surface)',
              textAlign: 'left', cursor: 'pointer', position: 'relative',
            }}
          >
            {role === r.value && (
              <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: 99, background: 'var(--forest)', color: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
                <CheckIcon size={10} />
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: role === r.value ? 'var(--forest)' : 'var(--ink)' }}>{r.l}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{r.sub}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="signup-name"
          label="Nama lengkap"
          value={form.nama_lengkap}
          onChange={set('nama_lengkap')}
          onFocus={handleFormStart}
          required
          autoFocus
          placeholder="Mis. Pak Budi"
          autoComplete="name"
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          className="pl-10"
        />

        <div>
          <label className="sh-label" style={{ display: 'block', marginBottom: 6 }}>Nomor WhatsApp</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-3)' }}>+62</span>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="812 xxxx xxxx"
              autoComplete="tel"
              className="sh-input sh-num"
              style={{ paddingLeft: 50 }}
            />
          </div>
          <p className="mt-1.5 text-xs" style={{ color: 'var(--ink-4)' }}>Kami kirim kode OTP untuk verifikasi · gratis</p>
        </div>

        <AuthInput
          id="signup-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          required
          placeholder="email@contoh.com"
          autoComplete="email"
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.7"/>
              <path d="m2 7 10 7 10-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          }
          className="pl-10"
        />

        <div>
          <label htmlFor="signup-password" className="sh-label" style={{ display: 'block', marginBottom: 6 }}>Buat kata sandi</label>
          <div style={{ position: 'relative' }}>
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center" style={{ color: 'var(--ink-4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              id="signup-password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
              placeholder="Min. 8 karakter"
              autoComplete="new-password"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? 'signup-password-error' : 'signup-password-help'}
              className="sh-input"
              style={{ paddingLeft: 42, paddingRight: 48 }}
            />
            <AuthPasswordToggle show={showPw} onClick={() => setShowPw(p => !p)} />
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 4 }} aria-hidden>
            {[1, 2, 3, 4].map(b => (
              <div key={b} style={{ flex: 1, height: 4, borderRadius: 99, background: b <= strengthScore ? strengthColors[strengthScore] : 'var(--line)', transition: 'background .2s' }} />
            ))}
          </div>
          {passwordError
            ? <p id="signup-password-error" role="alert" style={{ marginTop: 5, fontSize: 11, color: 'var(--terracotta-2)' }}>{passwordError}</p>
            : strengthScore > 0
              ? <p id="signup-password-help" style={{ marginTop: 5, fontSize: 11, color: strengthColors[strengthScore], fontWeight: 500 }}>{strengthLabel} · minimal 8 karakter, ada angka</p>
              : <p id="signup-password-help" style={{ marginTop: 5, fontSize: 11, color: 'var(--ink-4)' }}>Gunakan minimal 8 karakter agar akun lebih aman.</p>
          }
        </div>

        <label style={{ display: 'flex', alignItems: 'start', gap: 10, fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.55, cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--forest)', marginTop: 3, flexShrink: 0 }} />
          <span>
            Saya setuju dengan{' '}
            <Link to="/syarat" className={authLinkClass}>Syarat Layanan</Link>{' '}
            dan{' '}
            <Link to="/privasi" className={authLinkClass}>Kebijakan Privasi</Link> SawitHub.
          </span>
        </label>

        <AuthSubmitButton loading={loading} loadingLabel="Mendaftar...">
          Mulai gratis {SUBSCRIPTION_TRIAL_DAYS} hari →
        </AuthSubmitButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>atau daftar lewat</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            className="sh-btn sh-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span style={{ fontWeight: 700, color: '#25D366' }}>◉</span> WhatsApp
          </button>
          <button
            type="button"
            className="sh-btn sh-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 600 }}>G</span> Google
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
