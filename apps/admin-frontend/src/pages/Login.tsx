import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import { trackEvent, GAEvents } from '../utils/analytics'

const BG = 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)'
const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.08] transition'

function isEmail(val: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) }
function isPhone(val: string) { return /^[0-9+\-\s]{8,15}$/.test(val) }

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(identifier.trim(), password)

      // Track successful login
      trackEvent(GAEvents.LOGIN_SUCCESS, {
        method: 'email',
      })

      // Note: User ID will be set automatically by AuthContext after login
      // User properties will be available in subsequent events
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login gagal.'

      // Track login error
      trackEvent(GAEvents.FORM_ERROR, {
        form_name: 'login_form',
        error_type: 'login_error',
        error_message: msg,
      })

      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputHint = identifier.length === 0 ? ''
    : isEmail(identifier) ? 'Email'
    : isPhone(identifier) ? 'No. Handphone'
    : 'Username'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(ellipse, #16a34a 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <header className="relative z-10 flex items-center justify-center px-6 py-5">
        <div className="hover:opacity-80 transition"><Logo size="md" /></div>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6"><Logo size="lg" showText={false} /></div>
          <h1 className="text-2xl font-bold text-white text-center mb-1">Selamat Datang</h1>
          <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Masuk untuk mengelola kebun Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-identifier" className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Email / Username / No. HP
                </label>
                {inputHint && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{inputHint}</span>}
              </div>
              <input id="login-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)}
                required autoFocus placeholder="email, username, atau 08xx..." className={INP} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin Panel</span>
              </div>
              <div className="relative">
                <input id="login-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="Masukkan password" className={INP + ' pr-12'} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-gray-500 hover:text-gray-300 transition">
                  {showPw ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 text-white font-bold rounded-xl transition mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}
              onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} SawitHub · Untuk petani sawit mandiri
          </p>
        </div>
      </div>
    </div>
  )
}
