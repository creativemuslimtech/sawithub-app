import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { trackEvent, GAEvents, setUserId, setUserProperties } from '../utils/analytics'
import { getApiErrorMessage } from '../utils/apiError'
import { SUBSCRIPTION_TRIAL_DAYS } from '../copy/productConstants'
import { AuthShell, AuthInput, AuthPasswordToggle, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'

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

const featureBullets = [
  {
    text: 'Catat panen, biaya rawat, dan jadwal kerja dalam hitungan detik.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2a9 9 0 0 1 7 14.5L17 22H7l-2-5.5A9 9 0 0 1 12 2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    text: 'Laporan keuangan otomatis — siap untuk koperasi atau bank.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="3" width="20" height="18" rx="3" stroke="white" strokeWidth="1.8"/>
        <path d="M7 8h10M7 12h6M7 16h8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    text: 'Kalkulator pupuk presisi berdasarkan kebutuhan lahan Anda.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8"/>
        <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    text: 'Pengingat jadwal perawatan lewat WhatsApp.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

function SignupPanel() {
  return (
    <div>
      <p className="eyebrow mb-4" style={{ color: 'var(--terra)' }}>Daftar {SUBSCRIPTION_TRIAL_DAYS} hari gratis</p>
      <h2 className="display font-bold text-white leading-tight mb-7"
        style={{ fontSize: 42, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
        Bawa kebun kamu ke dalam satu aplikasi.
      </h2>
      <div className="flex flex-col gap-3">
        {featureBullets.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'var(--emerald)' }}>
              {item.icon}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', paddingTop: 4 }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama_lengkap: '', phone: '', email: '', password: '' })
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

  return (
    <AuthShell panel={<SignupPanel />}>
      <p className="eyebrow mb-2">Buat akun</p>
      <h1 className="display text-3xl font-bold text-ink mb-2" style={{ letterSpacing: '-0.025em' }}>
        Daftar gratis {SUBSCRIPTION_TRIAL_DAYS} hari.
      </h1>
      <p className="mb-7 text-sm leading-6 text-ink-3">
        Tanpa kartu kredit. Sudah punya akun?{' '}
        <Link to="/login" className={authLinkClass}>Masuk →</Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="signup-name"
          label="Nama Lengkap"
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

        <AuthInput
          id="signup-phone"
          label="No. WhatsApp"
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="08xx-xxxx-xxxx"
          autoComplete="tel"
          helper="Untuk verifikasi & pengingat jadwal perawatan."
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          className="pl-10"
        />

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
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="signup-password" className="text-[13px] font-semibold text-ink-2">Password</label>
            <span className="text-xs text-ink-4">Min. 8 karakter</span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-4">
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
              className="w-full rounded-md-1 border border-line bg-surface py-3.5 pl-10 pr-12 text-sm text-ink placeholder:text-ink-4 transition-colors focus:border-emerald focus:outline-none"
            />
            <AuthPasswordToggle show={showPw} onClick={() => setShowPw(p => !p)} />
          </div>
          <div className="mt-2 flex gap-1" aria-hidden>
            {[8, 10, 12].map((len, i) => (
              <div key={len} className={`h-1 flex-1 rounded-full transition-all ${
                form.password.length >= len
                  ? i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-emerald'
                  : 'bg-line'
              }`} />
            ))}
          </div>
          {passwordError
            ? <p id="signup-password-error" role="alert" className="mt-1.5 text-xs text-terra-2">{passwordError}</p>
            : <p id="signup-password-help" className="mt-1.5 text-xs text-ink-4">Gunakan minimal 8 karakter agar akun lebih aman.</p>
          }
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-3 cursor-pointer select-none">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-ink shrink-0 mt-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="m5 12 5 5 9-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>
            Saya setuju dengan{' '}
            <Link to="/syarat" className={authLinkClass}>Syarat Layanan</Link>{' '}
            dan{' '}
            <Link to="/privasi" className={authLinkClass}>Kebijakan Privasi</Link>.
          </span>
        </label>

        <AuthSubmitButton loading={loading} loadingLabel="Mendaftar...">
          Mulai {SUBSCRIPTION_TRIAL_DAYS} hari gratis →
        </AuthSubmitButton>
      </form>

      {/* Migration help card */}
      <div className="mt-7 flex items-start gap-3 rounded-lg-1 border p-4"
        style={{ background: 'var(--emerald-soft)', borderColor: 'rgba(10,120,71,0.18)' }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md-1"
          style={{ background: 'var(--emerald)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-[13px] leading-5 text-ink-2">
          <strong className="text-ink">Bantuan migrasi gratis.</strong>{' '}
          Punya catatan di Excel atau buku? Kirim ke kami, tim akan memindahkan.
        </div>
      </div>
    </AuthShell>
  )
}
