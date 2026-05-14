import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'

const BG = 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)'
const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.08] transition'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Kode reset password telah dikirim ke email Anda.')
      navigate(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch {
      toast.error('Gagal mengirim. Coba lagi.')
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
        <Link to="/login" className="text-sm font-medium transition" style={{ color: '#4ade80' }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
          ← Kembali masuk
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">

          <div className="flex justify-center mb-6">
            {/* Lock icon in green style */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' }}>
              🔐
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Lupa Password?</h1>
          <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Masukkan email terdaftar. Kami akan mengirimkan kode 6 digit untuk reset password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus placeholder="email@contoh.com" className={INP} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}
                onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                {loading ? 'Mengirim...' : 'Kirim Kode Reset Password'}
              </button>
            </form>
        </div>
      </div>
    </div>
  )
}
