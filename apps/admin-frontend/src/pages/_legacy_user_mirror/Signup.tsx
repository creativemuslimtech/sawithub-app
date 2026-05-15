import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import { trackEvent, GAEvents, setUserId, setUserProperties } from '../utils/analytics'

const BG = 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)'
const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.08] transition'
const LBL = 'block text-xs font-medium mb-1.5 uppercase tracking-wide'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama_lengkap: '', username: '', no_hp: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formStarted, setFormStarted] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleFormStart = () => {
    if (!formStarted) {
      trackEvent(GAEvents.FORM_START, {
        form_name: 'signup_form',
      })
      setFormStarted(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password minimal 8 karakter.')
      return
    }
    if (form.username.length < 3) {
      toast.error('Username minimal 3 karakter.')
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        full_name: form.nama_lengkap,
        username: form.username,
        phone: form.no_hp,
        email: form.email,
        password: form.password,
      })

      // Track successful signup (PRIMARY CONVERSION)
      trackEvent(GAEvents.SIGNUP_SUCCESS, {
        method: 'email',
        form_name: 'signup_form',
      })

      // Set user properties
      if (response.data?.user_id) {
        setUserId(response.data.user_id)
        setUserProperties({
          user_type: 'petani_sawit',
          signup_date: new Date().toISOString(),
          signup_method: 'email',
        })
      }

      toast.success('Pendaftaran berhasil! Silakan masuk.')
      navigate('/login')
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Pendaftaran gagal.'

      // Track form error
      trackEvent(GAEvents.FORM_ERROR, {
        form_name: 'signup_form',
        error_type: 'api_error',
        error_message: msg,
      })

      toast.error(msg)
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
          Masuk →
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={false} />
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">Buat Akun Baru</h2>
          <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Isi data untuk mulai mengelola kebun Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className={LBL} style={{ color: 'rgba(255,255,255,0.4)' }}>Nama Lengkap</label>
              <input className={INP} value={form.nama_lengkap} onChange={set('nama_lengkap')}
                onFocus={handleFormStart}
                required placeholder="Nama lengkap Anda" />
            </div>

            <div>
              <label className={LBL} style={{ color: 'rgba(255,255,255,0.4)' }}>Username</label>
              <input className={INP} value={form.username} onChange={set('username')}
                required placeholder="username (min. 3 karakter)" autoComplete="username" />
            </div>

            <div>
              <label className={LBL} style={{ color: 'rgba(255,255,255,0.4)' }}>No. Handphone</label>
              <input type="tel" className={INP} value={form.no_hp} onChange={set('no_hp')}
                placeholder="08xxxxxxxxxx" />
            </div>

            <div>
              <label className={LBL} style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
              <input type="email" className={INP} value={form.email} onChange={set('email')}
                required placeholder="email@contoh.com" />
            </div>

            <div>
              <label className={LBL} style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className={INP + ' pr-12'} value={form.password}
                  onChange={set('password')} required placeholder="Min. 8 karakter" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-base select-none">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {[8, 10, 12].map((len, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                    form.password.length >= len
                      ? i === 0 ? 'bg-red-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'
                      : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 text-white font-bold rounded-xl transition mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}
              onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium transition" style={{ color: '#4ade80' }}
              onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.opacity = '0.7')}
              onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.opacity = '1')}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
