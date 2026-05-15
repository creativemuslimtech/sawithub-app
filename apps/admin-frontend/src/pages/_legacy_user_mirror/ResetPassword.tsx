import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'

const RESEND_COOLDOWN = 60
const BG = 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)'
const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.08] transition'

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
      await api.post('/auth/forgot-password', { email })
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
      await api.post('/auth/verify-reset', { email, code })
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
      await api.post('/auth/reset-password', { email, code, password })
      toast.success('Password berhasil diubah! Silakan login.')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      toast.error('Gagal reset password. Coba dari awal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Glow blob */}
      <div className="pointer-events-none fixed top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(ellipse, #16a34a 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link to="/" className="hover:opacity-80 transition">
          <Logo size="md" />
        </Link>
        <Link to="/forgot-password" className="text-sm font-medium transition" style={{ color: '#4ade80' }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
          ← Kembali
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">

          {/* Step icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' }}>
              {step === 'code' ? '🔑' : '🔒'}
            </div>
          </div>

          {/* Step pills */}
          <div className="flex gap-2 justify-center mb-6">
            {(['code', 'password'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition"
                style={step === s
                  ? { background: 'rgba(22,163,74,0.15)', borderColor: 'rgba(22,163,74,0.4)', color: '#4ade80' }
                  : i === 0 && step === 'password'
                    ? { background: 'rgba(22,163,74,0.1)', borderColor: 'rgba(22,163,74,0.25)', color: '#4ade80' }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                {i === 0 && step === 'password' ? '✓' : `${i + 1}`}
                {s === 'code' ? ' Verifikasi Kode' : ' Password Baru'}
              </div>
            ))}
          </div>

          {step === 'code' ? (
            <>
              <h1 className="text-xl font-bold text-white text-center mb-1">Masukkan Kode</h1>
              <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Kode 6 digit dikirim ke <span className="text-white">{email || 'email Anda'}</span>
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={INP} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Kode Verifikasi</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required maxLength={6} placeholder="_ _ _ _ _ _"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold tracking-[0.5em] text-center placeholder-gray-700 focus:outline-none focus:border-green-500 focus:bg-white/[0.08] transition"
                  />
                  <p className="text-xs mt-1.5 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Cek email Anda (termasuk folder spam)</p>
                </div>

                <button type="submit" disabled={loading || code.length !== 6}
                  className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}
                  onMouseOver={e => !(loading || code.length !== 6) && (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                  {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
                </button>
              </form>

              {/* Resend section */}
              <div className="mt-5 flex flex-col items-center gap-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Tidak menerima kode?</p>
                {countdown > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                        <circle cx="16" cy="16" r="13" fill="none" stroke="#16a34a" strokeWidth="2.5"
                          strokeDasharray={`${2 * Math.PI * 13}`}
                          strokeDashoffset={`${2 * Math.PI * 13 * (1 - countdown / RESEND_COOLDOWN)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: '#4ade80' }}>
                        {countdown}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Kirim ulang dalam <span style={{ color: '#4ade80' }} className="font-medium">{countdown}s</span>
                    </span>
                  </div>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resendLoading}
                    className="text-sm font-semibold transition underline underline-offset-2 disabled:opacity-50"
                    style={{ color: '#4ade80' }}>
                    {resendLoading ? 'Mengirim...' : 'Kirim Ulang Kode'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white text-center mb-1">Password Baru</h1>
              <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Buat password baru yang kuat untuk akun Anda
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Password Baru</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      required minLength={8} placeholder="Min. 8 karakter" className={INP + ' pr-12'} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-base select-none">
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[8, 10, 12].map((len, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= len
                          ? i === 0 ? 'bg-red-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Konfirmasi Password</label>
                  <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    required placeholder="Ulangi password baru"
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-white/[0.08] transition ${
                      confirmPw && confirmPw !== password ? 'border-red-500/60' : 'border-white/10 focus:border-green-500'}`} />
                  {confirmPw && confirmPw !== password && (
                    <p className="text-xs text-red-400 mt-1">Password tidak cocok</p>
                  )}
                </div>
                <button type="submit" disabled={loading || password !== confirmPw || password.length < 8}
                  className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}
                  onMouseOver={e => !(loading || password !== confirmPw || password.length < 8) && (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                  {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
