import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { AuthShell, AuthInput, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'

function ForgotPanel() {
  return (
    <div>
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-xl-1"
        style={{ background: 'var(--terra)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="display font-bold text-white leading-tight mb-4"
        style={{ fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
        Lupa password? Tenang — kebun kamu tetap aman.
      </h2>
      <p className="text-[15px] leading-7 mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
        Kami akan kirim kode 6 digit ke email kamu. Berlaku 15 menit.
      </p>
      <div className="flex items-center gap-3 rounded-lg-1 p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
          <path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-[13px] leading-5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Butuh bantuan? Hubungi{' '}
          <strong style={{ color: 'white' }}>0811-7100-200</strong>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/IdentityAuthService/forgot-password', { email })
      toast.success('Kode reset password telah dikirim ke email Anda.')
      navigate(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch {
      toast.error('Gagal mengirim. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell panel={<ForgotPanel />}>
      <Link to="/login" className={`inline-flex items-center gap-1.5 mb-6 text-sm font-semibold text-ink-3 hover:text-ink transition-colors`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Kembali ke masuk
      </Link>

      <p className="eyebrow mb-2">Reset Password</p>
      <h1 className="display text-3xl font-bold text-ink mb-2" style={{ letterSpacing: '-0.025em' }}>
        Atur ulang password.
      </h1>
      <p className="mb-8 text-sm leading-6 text-ink-3">
        Masukkan email terdaftar. Kami kirim kode 6 digit untuk reset password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="forgot-email"
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
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

        <AuthSubmitButton loading={loading} loadingLabel="Mengirim...">
          Kirim Kode Reset Password →
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-3">
        Ingat password?{' '}
        <Link to="/login" className={authLinkClass}>Masuk di sini</Link>
      </p>
    </AuthShell>
  )
}
