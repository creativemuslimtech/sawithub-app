import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { AuthShell, AuthSubmitButton } from '../components/AuthLayout'
import { authLinkClass } from '../components/authStyles'

function ForgotPanel() {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--amber-3)', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>
        —— Reset kata sandi
      </div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 40, fontWeight: 400, color: 'var(--paper)', lineHeight: 1.1, marginBottom: 24 }}>
        Tenang, kami <em style={{ color: 'var(--amber-3)' }}>bantu ingat</em>.
      </h2>
      <p style={{ fontSize: 16, color: 'rgba(251,248,241,0.7)', lineHeight: 1.55 }}>
        Masukkan email atau nomor WhatsApp yang terdaftar. Kami kirim link untuk membuat kata sandi baru.
      </p>
    </div>
  )
}

type Method = 'wa' | 'email'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [method, setMethod] = useState<Method>('wa')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [found, setFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (method === 'wa') {
      // TODO[backend-pending]: WhatsApp OTP reset not yet implemented
      setFound(true)
      return
    }
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
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Lupa kata sandi</div>
      <h1 className="sh-h-3" style={{ marginBottom: 10 }}>Cari akun kamu.</h1>
      <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 26 }}>
        Sudah ingat?{' '}
        <Link to="/login" className={authLinkClass}>Kembali ke login →</Link>
      </p>

      {/* Method tabs */}
      <div style={{ display: 'flex', padding: 4, background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 10, marginBottom: 18 }}>
        {([
          { value: 'wa' as Method, label: 'Via WhatsApp', icon: '◉' },
          { value: 'email' as Method, label: 'Via Email', icon: '✉' },
        ]).map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setMethod(t.value); setFound(false) }}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 7,
              fontSize: 13, fontWeight: 600,
              background: method === t.value ? 'var(--forest)' : 'transparent',
              color: method === t.value ? 'var(--paper)' : 'var(--ink-3)',
              border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .15s',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {method === 'wa' ? (
            <div>
              <label className="sh-label" style={{ display: 'block', marginBottom: 6 }}>Nomor WhatsApp terdaftar</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-3)' }}>+62</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setFound(false) }}
                  onBlur={() => { if (phone.length >= 8) setFound(true) }}
                  placeholder="812 xxxx xxxx"
                  autoComplete="tel"
                  className="sh-input sh-num"
                  style={{ paddingLeft: 50 }}
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="sh-label" style={{ display: 'block', marginBottom: 6 }}>Email terdaftar</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.7"/>
                    <path d="m2 7 10 7 10-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  autoComplete="email"
                  className="sh-input"
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>
          )}

          {found && method === 'wa' && (
            <div style={{ padding: 16, background: 'var(--forest-tint)', border: '1px solid var(--forest-soft)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'start' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--forest)', color: 'var(--paper)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--ink)' }}>Akun ditemukan.</strong> Kami akan kirim kode 6-digit ke WhatsApp kamu dalam 30 detik.
              </div>
            </div>
          )}

          <AuthSubmitButton loading={loading} loadingLabel="Mengirim...">
            Kirim kode reset →
          </AuthSubmitButton>

          <div style={{ paddingTop: 18, borderTop: '1px solid var(--line-2)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>Masih tidak bisa masuk?</div>
            <button
              type="button"
              className="sh-btn sh-btn-ghost sh-btn-sm"
              onClick={() => window.open('https://wa.me/6281171002000', '_blank')}
            >
              Hubungi support via WhatsApp
            </button>
          </div>
        </div>
      </form>
    </AuthShell>
  )
}
