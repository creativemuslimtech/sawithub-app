import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'

const TILES = [
  {
    to: '/pendapatan',
    title: 'Pendapatan',
    description: 'Catat dan tinjau alur kas dari hasil kebun.',
    accent: '#facc15',
  },
  {
    to: '/harga-tbs',
    title: 'Harga TBS',
    description: 'Bandingkan acuan harga komoditas untuk estimasi.',
    accent: '#38bdf8',
  },
  {
    to: '/laporan-keuangan',
    title: 'Laporan keuangan',
    description: 'Unduh Excel/PDF dan kirim ringkasan ke email.',
    accent: '#34d399',
  },
]

export default function Keuangan() {
  return (
    <AppLayout>
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-ink">Hub Keuangan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">
              Semua alur yang berhubungan dengan uang dan acuan harga dalam satu tempat. Gunakan menu ini jika mencari fitur keuangan dari dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {TILES.map((tile) => (
              <Link
                key={tile.to}
                to={tile.to}
                className="group rounded-xl-1 border border-line bg-surface p-5 shadow-card-sm transition hover:shadow-card"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: tile.accent }}>
                  Buka
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{tile.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">{tile.description}</p>
                <span className="mt-4 inline-flex text-sm font-semibold" style={{ color: tile.accent }}>
                  Lanjut →
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/subscription"
            className="flex flex-col rounded-xl-1 border border-emerald-soft bg-emerald-tint p-5 transition hover:bg-emerald-tint sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald">Langganan</p>
              <p className="mt-1 text-base font-semibold text-ink">Kelola paket dan status pembayaran</p>
              <p className="mt-1 text-sm text-ink-3">Pahami batas trial atau lanjutkan akses penuh.</p>
            </div>
            <span className="mt-3 inline-flex shrink-0 rounded-xl border border-emerald-soft px-4 py-2 text-sm font-semibold text-emerald sm:mt-0">
              Ke halaman langganan
            </span>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
