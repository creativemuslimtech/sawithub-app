import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/PublicPageLayout'

export default function NotFound() {
  return (
    <PublicPageLayout
      eyebrow="Halaman tidak ditemukan"
      title="Maaf, halaman yang Anda cari belum tersedia."
      description="Tautan mungkin berubah atau alamat halaman salah. Anda bisa kembali ke halaman utama atau membuka pusat bantuan SawitHub."
    >
      <section className="rounded-xl-1 border border-line bg-surface p-8 text-center shadow-card">
        <p className="num text-7xl font-bold text-emerald" style={{ letterSpacing: '-0.04em' }}>404</p>
        <p className="mt-4 text-base text-ink-3">Halaman tidak ditemukan</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-paper transition hover:bg-emerald-2">
            Home
          </Link>
          <Link to="/login" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:bg-paper-2">
            Login
          </Link>
          <Link to="/bantuan" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:bg-paper-2">
            Bantuan
          </Link>
          <Link to="/signup" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:bg-paper-2">
            Daftar
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  )
}
