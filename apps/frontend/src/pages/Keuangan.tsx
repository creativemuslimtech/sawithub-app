import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import { MoneyIcon, ChartIcon } from '../components/ds/icons'

const TILES = [
  {
    to: '/pendapatan',
    title: 'Pendapatan',
    description: 'Catat dan tinjau alur kas dari hasil kebun.',
    accent: 'var(--amber)',
    Icon: MoneyIcon,
  },
  {
    to: '/harga-tbs',
    title: 'Harga TBS',
    description: 'Bandingkan acuan harga komoditas untuk estimasi.',
    accent: 'var(--c-sky)',
    Icon: ChartIcon,
  },
  {
    to: '/laporan-keuangan',
    title: 'Laporan Keuangan',
    description: 'Unduh Excel/PDF dan kirim ringkasan ke email.',
    accent: 'var(--forest)',
    Icon: ChartIcon,
  },
]

export default function Keuangan() {
  return (
    <AppLayout>
      <AppTopbar
        title="Hub Keuangan"
        subtitle="Keuangan"
      />
      <div style={{ padding: '32px 36px 48px' }}>
        <div style={{ marginBottom: 28 }}>
          <p className="sh-eyebrow" style={{ marginBottom: 6 }}>Keuangan</p>
          <h1 className="sh-h-2" style={{ marginBottom: 8 }}>Hub Keuangan</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 520, lineHeight: 1.6 }}>
            Semua alur yang berhubungan dengan uang dan acuan harga dalam satu tempat.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginBottom: 24 }}>
          {TILES.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="sh-card"
              style={{
                padding: 24, textDecoration: 'none',
                borderTop: `3px solid ${tile.accent}`,
                transition: 'box-shadow 0.15s',
              }}
            >
              <p className="sh-eyebrow" style={{ color: tile.accent, marginBottom: 8 }}>Buka</p>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {tile.title}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 16 }}>
                {tile.description}
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: tile.accent }}>Lanjut →</span>
            </Link>
          ))}
        </div>

        <Link
          to="/subscription"
          className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: 'var(--forest-tint)', border: '1px solid var(--forest-soft)',
            borderRadius: 12, padding: '20px 24px', textDecoration: 'none',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p className="sh-eyebrow" style={{ color: 'var(--forest)', marginBottom: 4 }}>Langganan</p>
            <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 15, marginBottom: 2 }}>Kelola paket dan status pembayaran</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Pahami batas trial atau lanjutkan akses penuh.</p>
          </div>
          <span style={{
            flexShrink: 0, border: '1px solid var(--forest-soft)', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, color: 'var(--forest)',
          }}>
            Ke halaman langganan
          </span>
        </Link>
      </div>
    </AppLayout>
  )
}
