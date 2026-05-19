import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import PalmFrond from '../components/ds/botanical/PalmFrond'
import SunRays from '../components/ds/botanical/SunRays'
import { HomeIcon, BasketIcon, ChartIcon, CalcIcon, StarIcon } from '../components/ds/icons'

const QUICK_LINKS = [
  { label: 'Catat panen TBS', to: '/panen/add', icon: BasketIcon },
  { label: 'Harga TBS hari ini', to: '/harga-tbs', icon: StarIcon },
  { label: 'Laporan keuangan', to: '/laporan-keuangan', icon: ChartIcon },
  { label: 'Kalkulator pupuk', to: '/kalkulator-pupuk', icon: CalcIcon },
]

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="sh-grain" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      <PalmFrond size={700} style={{ position: 'absolute', right: -200, top: -120, color: 'var(--forest)', opacity: 0.08, pointerEvents: 'none' }} />
      <PalmFrond size={500} style={{ position: 'absolute', left: -160, bottom: -100, color: 'var(--amber-2)', opacity: 0.1, transform: 'rotate(180deg)', pointerEvents: 'none' }} />
      <SunRays size={180} style={{ position: 'absolute', left: '30%', top: 100, color: 'var(--amber-2)', opacity: 0.14, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 32, left: 56, zIndex: 2 }}>
        <Link to="/" aria-label="Beranda SawitHub">
          <Logo size="sm" />
        </Link>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 640, position: 'relative', zIndex: 2, padding: '0 24px' }}>
        <div style={{
          fontFamily: 'var(--f-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(120px, 20vw, 240px)',
          fontWeight: 400,
          color: 'var(--forest)',
          lineHeight: 0.9,
          letterSpacing: '-0.05em',
          marginBottom: 18,
        }}>
          404
        </div>

        <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Halaman tidak ditemukan</div>

        <h1 className="sh-h-2" style={{ marginBottom: 18 }}>
          Sepertinya halaman ini{' '}
          <em className="sh-italic" style={{ color: 'var(--amber-2)' }}>tersesat&nbsp;di&nbsp;kebun</em>.
        </h1>

        <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 32px' }}>
          URL yang kamu buka mungkin sudah pindah atau tidak pernah ada. Coba kembali ke beranda atau cari yang lain.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          <Link
            to="/dashboard"
            className="sh-btn sh-btn-primary sh-btn-lg"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <HomeIcon size={16} />
            Kembali ke dashboard
          </Link>
          <Link
            to="/login"
            className="sh-btn sh-btn-ghost sh-btn-lg"
            style={{ textDecoration: 'none' }}
          >
            Masuk ke akun
          </Link>
        </div>

        <div style={{ padding: 22, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, textAlign: 'left' }}>
          <div className="sh-eyebrow" style={{ marginBottom: 14, textAlign: 'center' }}>Atau coba salah satu ini</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--cream)', border: '1px solid var(--line-2)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  textDecoration: 'none',
                }}
              >
                <span style={{ color: 'var(--forest)' }}><Icon size={16} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{to}</div>
                </div>
                <span style={{ color: 'var(--ink-4)', fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
