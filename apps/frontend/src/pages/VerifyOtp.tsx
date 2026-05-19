// TODO[backend-pending]: POST /IdentityAuthService/otp/verify — Verify 6-digit OTP
// TODO[backend-pending]: POST /IdentityAuthService/otp/resend — Resend OTP (WA/SMS/call)
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthLayout'

function OtpPanel() {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--amber-3)', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>
        —— Verifikasi 1 langkah lagi
      </div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 40, fontWeight: 400, color: 'var(--paper)', lineHeight: 1.1, marginBottom: 24 }}>
        Cek <em style={{ color: 'var(--amber-3)' }}>WhatsApp kamu</em>.
      </h2>
      <p style={{ fontSize: 16, color: 'rgba(251,248,241,0.7)', lineHeight: 1.55 }}>
        Kami kirim kode 6-digit ke nomor WhatsApp yang terdaftar. Ketik kode di sebelah kanan untuk lanjutkan.
      </p>
    </div>
  )
}

export default function VerifyOtp() {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      refs.current[5]?.focus()
      e.preventDefault()
    }
  }

  return (
    <AuthShell panel={<OtpPanel />}>
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Verifikasi WhatsApp</div>
      <h2 className="sh-h-3" style={{ marginBottom: 10 }}>Masukkan kode.</h2>
      <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 26, lineHeight: 1.55 }}>
        Kode dikirim ke <strong style={{ color: 'var(--ink)' }}>+62 812-•••-•845</strong>.
        {' '}Salah nomor?{' '}
        <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>Kembali →</Link>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="sh-label" style={{ display: 'block', marginBottom: 10 }}>Kode 6-digit</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  height: 60, textAlign: 'center',
                  borderRadius: 12, background: 'var(--paper)',
                  border: i === 5 ? '1.5px solid var(--forest)' : '1px solid var(--line)',
                  boxShadow: i === 5 ? '0 0 0 4px rgba(45,90,61,.12)' : 'none',
                  fontFamily: 'var(--f-mono)', fontSize: 26, fontWeight: 500, color: 'var(--ink)',
                  outline: 'none', width: '100%',
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: 'var(--amber-tint)', color: 'var(--amber-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Kode kedaluwarsa dalam <span className="sh-num" style={{ color: 'var(--amber-2)' }}>02:14</span></div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>
              Tidak menerima kode?{' '}
              <button type="button" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: 'inherit' }}>
                Kirim ulang dalam 0:42
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="sh-btn sh-btn-primary sh-btn-lg"
          style={{ width: '100%' }}
        >
          Verifikasi &amp; masuk
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button type="button" className="sh-btn sh-btn-ghost sh-btn-sm">Kirim via SMS</button>
          <button type="button" className="sh-btn sh-btn-ghost sh-btn-sm">Kirim via panggilan</button>
        </div>
      </div>
    </AuthShell>
  )
}
