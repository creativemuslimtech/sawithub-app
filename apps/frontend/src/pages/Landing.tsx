import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import PublicFooter from '../components/PublicFooter'
import Logo from '../components/Logo'
import { trackEvent, GAEvents } from '../utils/analytics'
import { SEO, StructuredData, SEOConfig } from '../components/SEO'
import { PUBLIC_ASSETS } from '../config/env'
import { SUBSCRIPTION_TRIAL_DAYS, formatPlanPriceIdr } from '../copy/productConstants'
import {
  SidebarCalculatorIcon,
} from '../components/AppNavigationIcons'
import {
  CheckmarkIconSVG,
  HarvestIconSVG,
  HomeIconSVG,
  LocationIconSVG,
  MaintenanceIconSVG,
  MoneyIconSVG,
} from '../components/icons'

// ── design tokens (shorthand) ────────────────────────────────────────────────
const T = {
  ink:     'var(--ink)',
  ink2:    'var(--ink-2)',
  ink3:    'var(--ink-3)',
  ink4:    'var(--ink-4)',
  line:    'var(--line)',
  paper:   'var(--paper)',
  paper2:  'var(--paper-2)',
  white:   'var(--surface)',
  em:      'var(--emerald)',
  em2:     'var(--emerald-2)',
  emSoft:  'var(--emerald-soft)',
  terra:   'var(--terra)',
  terraSoft: 'var(--terra-soft)',
  c1: 'var(--c1)', c2: 'var(--c2)', c3: 'var(--c3)',
  c4: 'var(--c4)', c5: 'var(--c5)', c6: 'var(--c6)',
  shadow:  'var(--shadow)',
  shadowLg:'var(--shadow-lg)',
  fontDisplay: '"Bricolage Grotesque", "Plus Jakarta Sans", sans-serif',
  fontMono:    '"JetBrains Mono", ui-monospace, monospace',
} as const

// ── feature items ─────────────────────────────────────────────────────────────
type FeatureIcon = ({ color, size }: { color?: string; size?: number }) => React.ReactElement

const features = [
  { icon: HomeIconSVG,            color: T.c1, eyebrow: 'Ringkasan', title: 'Satu layar untuk semua kebun',         desc: 'Untung bersih, hasil panen, harga TBS, dan jadwal — terhitung otomatis dari catatan harian.' },
  { icon: LocationIconSVG,        color: T.c4, eyebrow: 'Lahan',     title: 'Banyak kebun, satu pencatatan',        desc: 'Catat luas, jumlah pohon, tahun tanam, dan lokasi per blok agar laporan per-hektare akurat.' },
  { icon: HarvestIconSVG,         color: T.c1, eyebrow: 'Panen',     title: 'Janjang, berat, harga — nyambung',     desc: 'Isi sekali, aplikasi hitung harga rata-rata, uang masuk, dan biaya panen secara otomatis.' },
  { icon: MaintenanceIconSVG,     color: T.c5, eyebrow: 'Perawatan', title: 'Pisahkan biaya bahan dan tenaga',      desc: 'Catat pupuk, semprot, dan upah pekerja terpisah agar laporan biaya kebun jelas.' },
  { icon: CheckmarkIconSVG,       color: T.c2, eyebrow: 'Jadwal',    title: 'Jadwal kerja tidak terlewat',          desc: 'Atur rotasi pupuk 3 bulanan, pruning 6 bulanan — pengingat masuk langsung ke hape.' },
  { icon: SidebarCalculatorIcon,  color: T.c6, eyebrow: 'Kalkulator',title: 'Hitung pupuk sesuai jumlah pohon',     desc: 'Masukkan umur tanaman, jumlah pohon, kadar NPK — keluar dosis per pohon dan total tahunan.' },
  { icon: MoneyIconSVG,           color: T.c4, eyebrow: 'Laporan',   title: 'Akhir bulan tanpa kalkulator manual',  desc: 'Pendapatan, biaya, laba bersih — siap unduh Excel atau PDF dan kirim langsung ke email.' },
]

const stats = [
  { value: '12.400+', label: 'petani aktif' },
  { value: '18 prov.', label: 'tersebar' },
  { value: 'Rp 240M', label: 'tercatat / thn' },
]

const testimonials = [
  { name: 'Pak Suparman', role: 'Petani · Riau · 3,2 ha', quote: 'Sebelum pakai, catatan panen ada di buku tulis. Sekarang anak saya tinggal foto setruk timbangan dan saya tahu untungnya berapa.' },
  { name: 'Bu Hartini',   role: 'Bendahara KopSawit Tanjung Jabung', quote: 'Laporan bulanan anggota tinggal unduh. Kami tidak perlu lagi tunggu 3 minggu untuk rapat keuangan.' },
  { name: 'Pak Yusran',  role: 'Petani · Sumut · 8,5 ha', quote: 'Jadwal pupuk 3 bulanan tidak pernah terlewat. Hasil panen naik 14% dalam setahun.' },
]

const partners = ['KOPSAWIT Riau', 'ASIAN AGRI Mitra', 'GAPKI', 'Kementan', 'Bank BSI Tani', 'PSR Indonesia']

// ── small card helpers ────────────────────────────────────────────────────────
function Chip({ color, children }: { color?: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: color ? `${color}18` : T.emSoft,
      color: color ?? T.em2,
      border: `1px solid ${color ? `${color}30` : 'rgba(10,120,71,0.18)'}`,
    }}>
      {children}
    </span>
  )
}

function PreviewCard() {
  return (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, zIndex: 1 }}>
      {/* Main dashboard card */}
      <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: T.shadowLg, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: T.ink4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ringkasan · Mei 2026</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontDisplay, letterSpacing: '-0.01em', marginTop: 1 }}>Kebun Suka Maju</div>
          </div>
          <Logo size="sm" showText={false} />
        </div>
        <div style={{ background: T.paper, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: T.ink4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Untung bersih</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: T.fontDisplay, letterSpacing: '-0.025em', marginTop: 2 }}>Rp 38,4 jt</div>
          <Chip>↑ 18,2%</Chip>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Panen', '8,4 ton', T.c1], ['Biaya', 'Rp 12 jt', T.c2]].map(([l, v, c]) => (
            <div key={l} style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 10, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, background: c, borderRadius: 99 }} />
                <span style={{ fontSize: 10, color: T.ink4, fontWeight: 600 }}>{l}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDisplay }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Schedule */}
        <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 'var(--radius-lg)', padding: 14, boxShadow: T.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.terraSoft, color: T.terra, display: 'grid', placeItems: 'center', fontSize: 12 }}>📅</div>
            <span style={{ fontSize: 11, fontWeight: 700 }}>Jadwal besok</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Pemupukan Blok A</div>
          <div style={{ fontSize: 11, color: T.ink4, marginTop: 2 }}>240 pohon · Pak Hadi</div>
        </div>

        {/* TBS price */}
        <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 'var(--radius-lg)', padding: 14, boxShadow: T.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 10, color: T.ink4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Harga TBS hari ini</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: T.fontDisplay, letterSpacing: '-0.02em', marginTop: 2 }}>
                Rp 2.340<span style={{ fontSize: 11, fontWeight: 500, color: T.ink4 }}>/kg</span>
              </div>
            </div>
            <Chip>↑ 4,2%</Chip>
          </div>
        </div>

        {/* Calculator dark */}
        <div style={{ background: T.ink, borderRadius: 'var(--radius-lg)', padding: 14, boxShadow: T.shadow }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kalkulator Pupuk</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: '4px 0 8px' }}>Hitung dosis NPK</div>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDisplay, color: T.terra }}>1,8 kg / pohon</div>
        </div>
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function Landing() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard')
  }, [user, isLoading, navigate])

  const handleSignupClick = (location: string) => {
    trackEvent(GAEvents.FUNNEL_LANDING_CTA, { funnel_step: 'landing_cta', button_location: location, page: 'landing' })
    trackEvent(GAEvents.CLICK_SIGNUP,        { button_location: location, page: 'landing' })
    navigate('/signup')
  }

  const handleLoginClick = () => {
    trackEvent(GAEvents.CLICK_LOGIN, { button_location: 'header', page: 'landing' })
    navigate('/login')
  }

  const navLinkStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', padding: '6px 12px',
    borderRadius: 10, fontSize: 14, fontWeight: 600,
    color: T.ink2, textDecoration: 'none', transition: 'background 0.12s',
  }

  return (
    <div style={{ background: T.paper, color: T.ink, minHeight: '100vh', fontFamily: T.fontDisplay.includes('Plus') ? T.fontDisplay : `"Plus Jakarta Sans", system-ui, sans-serif` }}>
      <SEO {...SEOConfig.home} />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'SawitHub',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web, Android, iOS',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'IDR',
            description: `Gratis ${SUBSCRIPTION_TRIAL_DAYS} hari pertama, kemudian ${formatPlanPriceIdr()} per bulan jika cocok`,
          },
          description: 'Aplikasi kebun sawit untuk petani mandiri. Catat panen TBS, biaya perawatan, jadwal kerja, kalkulator pupuk sawit, dan laporan keuangan kebun sawit dari HP.',
          screenshot: PUBLIC_ASSETS.landing.heroJpg,
          author: { '@type': 'Organization', name: 'SawitHub', url: 'https://www.sawithub.com' },
        }}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SawitHub',
          url: 'https://www.sawithub.com',
          logo: PUBLIC_ASSETS.branding.logoMark,
          image: PUBLIC_ASSETS.branding.logoHorizontal,
          description: 'SawitHub adalah buku catatan kebun sawit digital untuk petani mandiri Indonesia.',
          sameAs: ['https://www.sawithub.com'],
          contactPoint: { '@type': 'ContactPoint', contactType: 'Customer Support', email: 'support@sawithub.com', availableLanguage: ['id-ID'] },
        }}
      />

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(250,246,236,0.88)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${T.line}`,
      }}>
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-8 lg:px-10">
          <Link to="/" aria-label="Beranda SawitHub">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {(['Fitur', 'Untuk Petani', 'Harga', 'Bantuan'] as const).map(label => (
              <a
                key={label}
                href={label === 'Fitur' ? '#fitur' : label === 'Harga' ? '#harga' : label === 'Bantuan' ? '/bantuan' : '#untuk-petani'}
                style={navLinkStyle}
                onMouseEnter={e => { e.currentTarget.style.background = T.paper2 }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleLoginClick}
              className="hidden sm:inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2"
              style={{ border: `1px solid ${T.line}`, background: T.white, color: T.ink2 }}
              onMouseEnter={e => { e.currentTarget.style.background = T.paper2 }}
              onMouseLeave={e => { e.currentTarget.style.background = T.white }}
            >
              Masuk
            </button>
            <button
              onClick={() => handleSignupClick('header')}
              className="inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2"
              style={{ background: T.ink, color: T.paper }}
              onMouseEnter={e => { e.currentTarget.style.background = T.em2 }}
              onMouseLeave={e => { e.currentTarget.style.background = T.ink }}
            >
              Coba gratis {SUBSCRIPTION_TRIAL_DAYS} hari
            </button>

            {/* Mobile hamburger */}
            <button
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg lg:hidden"
              style={{ border: `1px solid ${T.line}`, background: T.white }}
              aria-label="Buka menu"
              onClick={() => setMenuOpen(v => !v)}
            >
              <span style={{ fontSize: 18 }}>{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: T.white, borderTop: `1px solid ${T.line}`, padding: '12px 16px 16px' }} className="lg:hidden">
            <div className="flex flex-col gap-1">
              {['Fitur', 'Harga', 'Bantuan'].map(label => (
                <a key={label} href={label === 'Fitur' ? '#fitur' : label === 'Harga' ? '#harga' : '/bantuan'}
                  style={{ padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: T.ink2, textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <button onClick={() => { setMenuOpen(false); handleLoginClick() }}
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: T.ink2, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                Masuk
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main>

        {/* Hero */}
        <section className="px-4 pb-20 pt-16 sm:px-8 lg:px-10" style={{ background: T.paper }}>
          <div className="mx-auto max-w-7xl">
            {/* Announcement badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 6px', border: `1px solid ${T.line}`, background: T.white, borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <span style={{ background: T.emSoft, color: T.em2, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>BARU</span>
              Kalkulator pupuk presisi · Versi 2026
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left text */}
              <div>
                <h1
                  className="display"
                  style={{ fontSize: 72, lineHeight: 1.0, fontWeight: 700, letterSpacing: '-0.04em', margin: '20px 0 20px', color: T.ink }}
                >
                  Hape kamu,<br />
                  <span style={{ color: 'var(--emerald)' }}>kantor kebun</span> kamu.
                </h1>
                <p className="mt-5 text-base leading-7 sm:text-lg" style={{ color: T.ink3, maxWidth: 540 }}>
                  SawitHub bantu petani sawit catat panen, biaya rawat, harga TBS, dan jadwal kerja — sekali isi, hasilnya langsung jadi laporan keuangan yang rapi.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSignupClick('hero')}
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2"
                    style={{ background: T.ink, color: T.paper }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.em2 }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.ink }}
                  >
                    Mulai gratis {SUBSCRIPTION_TRIAL_DAYS} hari →
                  </button>
                  <Link
                    to="/bantuan"
                    className="inline-flex min-h-12 items-center rounded-lg px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2"
                    style={{ border: `1px solid ${T.line}`, background: T.white, color: T.ink2 }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.paper2 }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.white }}
                  >
                    Lihat panduan →
                  </Link>
                </div>

                {/* Stats */}
                <div className="mt-10 flex gap-8 flex-wrap">
                  {stats.map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: T.fontDisplay, letterSpacing: '-0.025em', color: T.ink }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: T.ink4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: app preview */}
              <div className="hidden lg:block" aria-label="Contoh screenshot produk SawitHub:">
                {/* Soft radial glow */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '-40px -60px', background: `radial-gradient(circle at 60% 50%, ${T.emSoft}, transparent 65%)`, borderRadius: 200, zIndex: 0 }} />
                  <PreviewCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section style={{ background: T.white, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }} className="px-4 py-4 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.ink4 }}>Dipakai bersama koperasi &amp; mitra</span>
            <div className="flex flex-wrap gap-6 items-center">
              {partners.map(p => (
                <span key={p} style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 15, color: T.ink4, letterSpacing: '-0.01em' }}>{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section id="fitur" className="px-4 py-20 sm:px-8 lg:px-10" style={{ background: T.paper }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.ink4 }}>Apa yang bisa dikerjakan</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: T.fontDisplay, letterSpacing: '-0.03em', lineHeight: 1.05, color: T.ink, maxWidth: 620 }}>
                  Tujuh alat kerja kebun — bekerja sama, bukan terpisah.
                </h2>
              </div>
              <Link to="/bantuan" style={{ fontSize: 14, fontWeight: 600, color: T.em2, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                Lihat semua fitur →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((f, i) => {
                const Icon = f.icon as FeatureIcon
                return (
                  <div
                    key={i}
                    style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 'var(--radius-lg)', padding: 22, position: 'relative', overflow: 'hidden', boxShadow: T.shadow }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color, display: 'grid', placeItems: 'center' }}>
                        <Icon color="white" size={18} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.ink4 }}>{f.eyebrow}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDisplay, letterSpacing: '-0.015em', lineHeight: 1.25, margin: '0 0 8px', color: T.ink }}>{f.title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: T.ink3, margin: 0 }}>{f.desc}</p>
                    {/* Decorative ghost icon */}
                    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05 }}>
                      <Icon color={f.color} size={100} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Financial dark section */}
        <section className="px-4 pb-20 sm:px-8 lg:px-10" style={{ background: T.paper }}>
          <div
            className="mx-auto max-w-7xl"
            style={{ background: T.ink, color: T.paper, borderRadius: 'var(--radius-xl)', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Decorative logo */}
            <div style={{ position: 'absolute', right: -80, top: -80, opacity: 0.06, color: 'white' }}>
              <Logo size="lg" showText={false} />
            </div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center" style={{ position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.terra }}>Laporan Keuangan</p>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl" style={{ fontFamily: T.fontDisplay, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'white' }}>
                  Akhir bulan tanpa kalkulator manual.
                </h2>
                <p className="mt-4 text-base leading-7" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 460 }}>
                  Pendapatan, biaya, laba bersih per kebun — siap untuk koperasi, bank, atau pajak. Unduh PDF atau Excel, atau kirim langsung ke email.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSignupClick('financial_section')}
                    className="inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2"
                    style={{ background: T.terra, color: 'white' }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.terra; e.currentTarget.style.filter = 'brightness(1.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                  >
                    Coba laporan keuangan
                  </button>
                </div>
              </div>

              {/* Chart preview */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 22 }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Untung bersih · 12 bulan</div>
                  <div style={{ fontSize: 32, fontWeight: 700, fontFamily: T.fontDisplay, color: 'white', letterSpacing: '-0.025em', marginTop: 4 }}>Rp 482,4 jt</div>
                </div>
                {/* Bar chart representation */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80, marginBottom: 8 }}>
                  {[42, 48, 55, 52, 61, 68, 72, 78, 75, 88, 92, 96].map((v, i) => (
                    <div key={i} style={{ flex: 1, height: `${(v / 96) * 100}%`, background: i === 11 ? 'var(--emerald-3)' : 'rgba(10,120,71,0.45)', borderRadius: '4px 4px 0 0', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {['Jun', '', 'Agu', '', 'Okt', '', 'Des', '', 'Feb', '', 'Apr', 'Mei'].map((m, i) => (
                    <span key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: T.fontMono }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-16 sm:px-8 lg:px-10" style={{ background: T.paper2 }}>
          <div className="mx-auto max-w-7xl">
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.ink4, textAlign: 'center', marginBottom: 32 }}>Kata petani yang sudah pakai</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map(t => (
                <div key={t.name} style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 'var(--radius-lg)', padding: 26, boxShadow: T.shadow }}>
                  <p style={{ fontSize: 16, lineHeight: 1.55, fontFamily: T.fontDisplay, fontWeight: 500, letterSpacing: '-0.01em', color: T.ink, margin: 0 }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 99, background: T.emSoft, display: 'grid', placeItems: 'center', fontSize: 18 }}>🧑‍🌾</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: T.ink4, marginTop: 1 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="harga" className="px-4 py-16 sm:px-8 lg:px-10" style={{ background: T.paper }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.ink4 }}>Harga</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: T.fontDisplay, letterSpacing: '-0.03em', color: T.ink }}>
                Mulai gratis. Tambah saat siap.
              </h2>
            </div>

            {(() => {
              const plans = [
                {
                  name: 'Coba',
                  price: 'Gratis',
                  per: `${SUBSCRIPTION_TRIAL_DAYS} hari`,
                  desc: 'Semua fitur, tanpa kartu kredit.',
                  cta: `Mulai gratis ${SUBSCRIPTION_TRIAL_DAYS} hari`,
                  feats: ['2 kebun', 'Catat panen & rawat', 'Laporan bulanan', 'Backup di cloud'],
                  featured: false,
                },
                {
                  name: 'Petani Pro',
                  price: formatPlanPriceIdr(),
                  per: '/bulan',
                  desc: 'Untuk kebun keluarga sampai 20 ha.',
                  cta: 'Pilih Petani Pro',
                  feats: ['Kebun tak terbatas', 'Kalkulator pupuk', 'Unduh PDF & Excel', 'Pengingat WhatsApp', 'Dukungan prioritas'],
                  featured: true,
                },
                {
                  name: 'Koperasi',
                  price: 'Hubungi',
                  per: 'kami',
                  desc: 'Untuk koperasi & kelompok tani 50+ anggota.',
                  cta: 'Diskusi dengan tim',
                  feats: ['Multi-akun anggota', 'Rekap koperasi', 'API integrasi pabrik', 'Pelatihan onsite', 'Dedicated manager'],
                  featured: false,
                },
              ]
              return (
                <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
                  {plans.map(p => (
                    <div
                      key={p.name}
                      style={{
                        background: p.featured ? T.ink : T.white,
                        color: p.featured ? T.paper : T.ink,
                        border: p.featured ? `1px solid ${T.ink}` : `1px solid ${T.line}`,
                        borderRadius: 'var(--radius-xl)',
                        padding: 28,
                        position: 'relative',
                        boxShadow: T.shadow,
                      }}
                    >
                      {p.featured && (
                        <div style={{ position: 'absolute', top: -10, right: 24, background: T.terra, color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          Paling populer
                        </div>
                      )}
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: p.featured ? T.terra : T.ink4 }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 4px' }}>
                        <span style={{ fontFamily: T.fontDisplay, fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>{p.price}</span>
                        <span style={{ fontSize: 14, color: p.featured ? 'rgba(255,255,255,0.5)' : T.ink4 }}>{p.per}</span>
                      </div>
                      <p style={{ fontSize: 14, color: p.featured ? 'rgba(255,255,255,0.65)' : T.ink3, margin: '0 0 24px' }}>{p.desc}</p>
                      <button
                        onClick={() => handleSignupClick('pricing_section')}
                        className="w-full min-h-12 rounded-lg text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2"
                        style={{ background: p.featured ? T.terra : T.ink, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                      >
                        {p.cta}
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, paddingTop: 24, borderTop: p.featured ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${T.line}` }}>
                        {p.feats.map(f => (
                          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: p.featured ? 'rgba(255,255,255,0.8)' : T.ink3 }}>
                            <span style={{ width: 6, height: 6, flexShrink: 0, borderRadius: 99, background: p.featured ? T.c1 : T.em }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </section>

        {/* Bottom CTA — emerald gradient */}
        <section className="px-4 pb-20 sm:px-8 lg:px-10" style={{ background: T.paper }}>
          <div
            className="mx-auto max-w-7xl"
            style={{ borderRadius: 'var(--radius-xl)', background: `linear-gradient(120deg, ${T.em} 0%, ${T.em2} 70%)`, padding: '56px 48px', color: 'white', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', right: -80, top: -80, opacity: 0.12, color: 'white' }}>
              <Logo size="lg" showText={false} />
            </div>
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 14px', color: 'white' }}>
                Mulai dari panen minggu ini.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.85, margin: '0 0 28px' }}>
                {SUBSCRIPTION_TRIAL_DAYS} hari gratis tanpa kartu kredit. Tim kami bantu pindahkan catatan lama kamu — gratis.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSignupClick('bottom_cta')}
                  className="inline-flex min-h-12 items-center rounded-lg px-6 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2"
                  style={{ background: 'white', color: T.ink }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.paper2 }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                >
                  Coba gratis {SUBSCRIPTION_TRIAL_DAYS} hari →
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl md:hidden" style={{ background: 'rgba(13,31,23,0.95)', border: `1px solid rgba(255,255,255,0.1)`, padding: 8, backdropFilter: 'blur(8px)' }}>
        <button
          onClick={() => handleSignupClick('sticky_mobile_cta')}
          className="w-full min-h-12 rounded-xl text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2"
          style={{ background: T.em, color: 'white' }}
          onMouseEnter={e => { e.currentTarget.style.background = T.em2 }}
          onMouseLeave={e => { e.currentTarget.style.background = T.em }}
        >
          Mulai gratis {SUBSCRIPTION_TRIAL_DAYS} hari
        </button>
      </div>

      <div className="pb-16 md:pb-0">
        <PublicFooter />
      </div>
    </div>
  )
}
