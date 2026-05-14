import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { AuthShell, AuthInput, AuthPasswordToggle, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'

const RESEND_COOLDOWN = 60

function ResetPanel({ step }: { step: 'code' | 'password' }) {
  return (
    <div>
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-xl-1"
        style={{ background: step === 'password' ? 'var(--emerald)' : 'var(--terra)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          {step === 'code'
            ? <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            : <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          }
        </svg>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7">
        {(['code', 'password'] as const).map((s, i) => {
          const done = i === 0 && step === 'password'
          const active = s === step
          return (
            <div key={s} className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition"
              style={active
                ? { background: 'rgba(10,120,71,0.15)', borderColor: 'rgba(10,120,71,0.4)', color: 'var(--emerald-3)' }
                : done
                  ? { background: 'rgba(10,120,71,0.1)', borderColor: 'rgba(10,120,71,0.25)', color: 'var(--emerald-3)' }
                  : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
              }>
              <span className="font-bold">{done ? '✓' : i + 1}</span>
              {s === 'code' ? 'Verifikasi Kode' : 'Password Baru'}
            </div>
          )
        })}
      </div>

      <h2 className="display font-bold text-white leading-tight mb-4"
        style={{ fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
        {step === 'code'
          ? 'Lupa password? Tenang — kebun kamu tetap aman.'
          : 'Buat password baru yang kuat.'
        }
      </h2>
      <p className="text-[15px] leading-7" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {step === 'code'
          ? 'Masukkan kode 6 digit dari email kamu. Berlaku 15 menit.'
          : 'Gunakan minimal 8 karakter. Simpan password di tempat yang aman.'
        }
      </p>
    </div>
  )
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState<'code' | 'password'>('code')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    startCountdown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startCountdown() {
    if (timerRef.current) clearInterval(timerRef.current)
    setCountdown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (!email) { toast.error('Masukkan email terlebih dahulu.'); return }
    setResendLoading(true)
    try {
      await api.post('/IdentityAuthService/forgot-password', { email })
      toast.success('Kode baru telah dikirim ke email Anda.')
      setCode('')
      startCountdown()
    } catch {
      toast.error('Gagal mengirim ulang kode. Coba lagi.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Kode harus 6 digit.'); return }
    setLoading(true)
    try {
      await api.post('/IdentityAuthService/verify-reset', { email, code })
      setStep('password')
      toast.success('Kode valid! Buat password baru.')
    } catch {
      toast.error('Kode tidak valid atau sudah kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password minimal 8 karakter.'); return }
    if (password !== confirmPw) { toast.error('Password tidak cocok.'); return }
    setLoading(true)
    try {
      await api.post('/IdentityAuthService/reset-password', { email, code, password })
      toast.success('Password berhasil diubah! Silakan login.')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      toast.error('Gagal reset password. Coba dari awal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell panel={<ResetPanel step={step} />}>
      <Link to="/forgot-password" className="inline-flex items-center gap-1.5 mb-6 text-sm font-semibold text-ink-3 hover:text-ink transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Kembali
      </Link>

      <p className="eyebrow mb-2">Reset Password</p>

      {step === 'code' ? (
        <>
          <h1 className="display text-3xl font-bold text-ink mb-2" style={{ letterSpacing: '-0.025em' }}>
            Masukkan kode verifikasi.
          </h1>
          <p className="mb-8 text-sm leading-6 text-ink-3">
            Kode 6 digit dikirim ke{' '}
            <strong className="text-ink">{email || 'email Anda'}</strong>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <AuthInput
              id="reset-email"
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
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
              <label htmlFor="reset-code" className="mb-1.5 block text-[13px] font-semibold text-ink-2">
                Kode Verifikasi
              </label>
              <input
                id="reset-code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                placeholder="· · · · · ·"
                className="w-full rounded-md-1 border border-line bg-surface px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-ink placeholder:text-ink-4 placeholder:tracking-widest transition-colors focus:border-emerald focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-center text-ink-4">Cek email Anda (termasuk folder spam)</p>
            </div>

            <AuthSubmitButton loading={loading} loadingLabel="Memverifikasi...">
              Verifikasi Kode →
            </AuthSubmitButton>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-xs text-ink-4">Tidak menerima kode?</p>
            {countdown > 0 ? (
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="var(--line)" strokeWidth="2.5" />
                    <circle cx="16" cy="16" r="13" fill="none" stroke="var(--emerald)" strokeWidth="2.5"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={`${2 * Math.PI * 13 * (1 - countdown / RESEND_COOLDOWN)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald">
                    {countdown}
                  </span>
                </div>
                <span className="text-xs text-ink-4">
                  Kirim ulang dalam{' '}
                  <span className="font-semibold text-emerald">{countdown}s</span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className={`text-sm font-semibold underline underline-offset-2 disabled:opacity-50 ${authLinkClass}`}
              >
                {resendLoading ? 'Mengirim...' : 'Kirim Ulang Kode'}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h1 className="display text-3xl font-bold text-ink mb-2" style={{ letterSpacing: '-0.025em' }}>
            Buat password baru.
          </h1>
          <p className="mb-8 text-sm leading-6 text-ink-3">
            Gunakan minimal 8 karakter agar akun lebih aman.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="reset-password" className="text-[13px] font-semibold text-ink-2">Password Baru</label>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input
                  id="reset-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 karakter"
                  autoComplete="new-password"
                  className="w-full rounded-md-1 border border-line bg-surface py-3.5 pl-10 pr-12 text-sm text-ink placeholder:text-ink-4 transition-colors focus:border-emerald focus:outline-none"
                />
                <AuthPasswordToggle show={showPw} onClick={() => setShowPw(p => !p)} />
              </div>
              <div className="mt-2 flex gap-1" aria-hidden>
                {[8, 10, 12].map((len, i) => (
                  <div key={len} className={`h-1 flex-1 rounded-full transition-all ${
                    password.length >= len
                      ? i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-emerald'
                      : 'bg-line'
                  }`} />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="mb-1.5 block text-[13px] font-semibold text-ink-2">
                Konfirmasi Password
              </label>
              <input
                id="reset-confirm-password"
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmPw && confirmPw !== password)}
                aria-describedby={confirmPw && confirmPw !== password ? 'reset-confirm-error' : undefined}
                className={`w-full rounded-md-1 border bg-surface px-3.5 py-3.5 text-sm text-ink placeholder:text-ink-4 transition-colors focus:outline-none ${
                  confirmPw && confirmPw !== password
                    ? 'border-terra-2 focus:border-terra-2'
                    : 'border-line focus:border-emerald'
                }`}
              />
              {confirmPw && confirmPw !== password ? (
                <p id="reset-confirm-error" role="alert" className="mt-1.5 text-xs text-terra-2">
                  Password tidak cocok
                </p>
              ) : null}
            </div>

            <AuthSubmitButton loading={loading} loadingLabel="Menyimpan...">
              Simpan Password Baru →
            </AuthSubmitButton>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-ink-3">
        Ingat password?{' '}
        <Link to="/login" className={authLinkClass}>Masuk di sini</Link>
      </p>
    </AuthShell>
  )
}
