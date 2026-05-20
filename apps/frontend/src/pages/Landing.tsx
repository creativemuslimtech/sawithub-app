import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import PublicFooter from '../components/PublicFooter'
import Logo from '../components/Logo'
import { trackEvent, GAEvents } from '../utils/analytics'
import { SEO, StructuredData, SEOConfig } from '../components/SEO'
import { PUBLIC_ASSETS } from '../config/env'
import { SUBSCRIPTION_TRIAL_DAYS, formatPlanPriceIdr } from '../copy/productConstants'
import PalmFrond from '../components/ds/botanical/PalmFrond'
import PalmLeaf from '../components/ds/botanical/PalmLeaf'
import SunRays from '../components/ds/botanical/SunRays'
import SoilWaves from '../components/ds/botanical/SoilWaves'
import Sparkline from '../components/ds/Sparkline'
import Chip from '../components/ds/Chip'
import {
  HomeIcon, LeafIcon, BasketIcon, SprayIcon, CalIcon,
  CalcIcon, MoneyIcon, ChartIcon, CheckIcon, ArrowIcon, UserIcon,
} from '../components/ds/icons'

/* ── Feature items ─────────────────────────────────────────────── */
const features = [
  { icon: HomeIcon,   color: 'var(--forest)',   eyebrow: 'Ringkasan',    title: 'Satu layar untuk semua kebun',      desc: 'Untung bersih, hasil panen, harga TBS, dan jadwal dalam satu pandangan.' },
  { icon: LeafIcon,   color: 'var(--c-bark)',   eyebrow: 'Lahan',        title: 'Banyak kebun, satu pencatatan',     desc: 'Catat luas, jumlah pohon, tahun tanam per blok dengan presisi.' },
  { icon: BasketIcon, color: 'var(--amber-2)',  eyebrow: 'Panen',        title: 'Janjang, berat, harga — nyambung', desc: 'Isi sekali, harga rata-rata dan pendapatan terhitung otomatis.' },
  { icon: SprayIcon,  color: 'var(--c-terra)',  eyebrow: 'Perawatan',    title: 'Pisahkan biaya bahan dan tenaga',   desc: 'Pupuk, semprot, dan upah pekerja terpisah agar laporan jelas.' },
  { icon: CalIcon,    color: 'var(--c-sky)',    eyebrow: 'Jadwal',       title: 'Jadwal kerja tidak terlewat',       desc: 'Rotasi pupuk 3 bulanan, pruning 6 bulanan — pengingat di hape.' },
  { icon: CalcIcon,   color: 'var(--forest-3)', eyebrow: 'Kalkulator',   title: 'Hitung pupuk sesuai jumlah pohon', desc: 'Umur tanaman, kadar NPK — keluar dosis per pohon dan total tahunan.' },
  { icon: MoneyIcon,  color: 'var(--amber-2)',  eyebrow: 'Laporan',      title: 'Akhir bulan tanpa kalkulator manual', desc: 'Pendapatan, biaya, laba bersih — siap unduh Excel atau PDF.' },
  { icon: ChartIcon,  color: 'var(--forest)',   eyebrow: 'Wawasan',      title: 'Tahu kebun mana yang paling untung', desc: 'Bandingkan per-hektare antar blok dan musim.' },
]

const stats = [
  { value: '12.400+', label: 'Petani aktif' },
  { value: 'Rp 240 M', label: 'Tercatat / tahun' },
  { value: '18 prov.', label: 'Tersebar' },
]

const testimonials = [
  { name: 'Pak Suparman', role: 'Petani · Riau · 3,2 ha', quote: 'Dulu catatan panen di buku tulis, sering sobek dan hilang. Sekarang anak saya tinggal foto setruk timbangan, dan saya tahu untungnya berapa malam itu juga.', featured: true },
  { name: 'Bu Hartini', role: 'Bendahara KopSawit Tj. Jabung', quote: 'Laporan bulanan anggota tinggal unduh. Kami tidak perlu lagi tunggu 3 minggu untuk rapat keuangan.' },
  { name: 'Pak Yusran', role: 'Petani · Sumut · 8,5 ha', quote: 'Jadwal pupuk 3 bulanan tidak pernah terlewat. Hasil panen naik 14% dalam setahun.' },
]

const partners = ['KOPSAWIT Riau', 'Asian Agri Mitra', 'GAPKI', 'Kementan', 'Bank BSI Tani', 'PSR Indonesia']

const plans = [
  {
    name: 'Coba', price: 'Gratis', per: `${SUBSCRIPTION_TRIAL_DAYS} hari`, featured: false,
    desc: 'Semua fitur, tanpa kartu kredit.',
    feats: ['2 kebun', 'Catat panen & rawat', 'Laporan bulanan', 'Backup di cloud'],
    cta: 'Mulai gratis',
  },
  {
    name: 'Petani Pro', price: formatPlanPriceIdr(), per: '/bulan', featured: true,
    desc: 'Untuk kebun keluarga sampai 20 ha.',
    feats: ['Kebun tak terbatas', 'Kalkulator pupuk', 'Unduh PDF & Excel', 'Pengingat WhatsApp', 'Dukungan prioritas'],
    cta: 'Pilih Petani Pro',
  },
  {
    name: 'Koperasi', price: 'Hubungi', per: 'kami', featured: false,
    desc: 'Untuk koperasi & kelompok tani 50+ anggota.',
    feats: ['Multi-akun anggota', 'Rekap koperasi', 'API integrasi pabrik', 'Pelatihan onsite', 'Account manager'],
    cta: 'Diskusi dengan tim',
  },
]

/* ── Hero Preview Card ─────────────────────────────────────────── */
function HeroPreview() {
  return (
    <div style={{ position: 'relative', height: 520 }}>
      <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle at 60% 50%, var(--amber-soft), transparent 60%)', zIndex: 0, filter: 'blur(20px)' }} />

      {/* Main card */}
      <div style={{ position: 'absolute', left: 20, top: 30, width: 360, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 24, padding: 22, boxShadow: 'var(--sh-card-3)', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="sh-eyebrow">Mei 2026 · Semua Kebun</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 18, fontWeight: 500, marginTop: 4 }}>Kebun Suka Maju</div>
          </div>
          <Logo size="sm" showText={false} />
        </div>
        <div style={{ padding: 18, background: 'linear-gradient(180deg, var(--cream), var(--paper-2))', borderRadius: 16, border: '1px solid var(--line-2)', marginBottom: 14 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Untung bersih</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div className="sh-num" style={{ fontSize: 36, fontWeight: 500, color: 'var(--forest)' }}>Rp&nbsp;38,4<span style={{ fontSize: 18, color: 'var(--ink-3)' }}>&thinsp;jt</span></div>
            <Chip tone="forest">↑ 18,2%</Chip>
          </div>
          <div style={{ marginTop: 12 }}><Sparkline data={[12, 18, 16, 22, 28, 24, 32, 38, 34, 42]} width={310} height={48} color="var(--forest)" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {([['Panen', '8,4 ton', 'var(--forest)'], ['Biaya rawat', 'Rp 12,0 jt', 'var(--amber-2)']] as [string, string, string][]).map(([l, v, c]) => (
            <div key={l} style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: c }} />
                <span className="sh-eyebrow" style={{ fontSize: 10 }}>{l}</span>
              </div>
              <div className="sh-num" style={{ fontSize: 17, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule pill */}
      <div style={{ position: 'absolute', right: 20, top: 0, width: 240, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18, padding: 16, boxShadow: 'var(--sh-card-2)', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--amber-soft)', color: 'var(--amber-2)', display: 'grid', placeItems: 'center' }}>
            <CalIcon size={16} />
          </div>
          <div className="sh-eyebrow">Jadwal besok</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Pemupukan Blok A</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>240 pohon · Pak Hadi</div>
      </div>

      {/* TBS price */}
      <div style={{ position: 'absolute', right: 0, top: 130, width: 220, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18, padding: 16, boxShadow: 'var(--sh-card-2)', zIndex: 3 }}>
        <div className="sh-eyebrow">Harga TBS hari ini</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
          <div className="sh-num" style={{ fontSize: 22, fontWeight: 500 }}>Rp&nbsp;2.340</div>
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>/kg</span>
        </div>
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip tone="forest">↑ 4,2%</Chip>
          <Sparkline data={[2200, 2180, 2220, 2260, 2240, 2300, 2340]} width={70} height={26} color="var(--forest-3)" fill={false} />
        </div>
      </div>

      {/* Calc dark card */}
      <div style={{ position: 'absolute', right: 30, bottom: 0, width: 260, background: 'var(--forest)', color: 'var(--paper)', borderRadius: 18, padding: 18, boxShadow: 'var(--sh-card-3)', zIndex: 3 }}>
        <div className="sh-eyebrow" style={{ color: 'var(--amber-3)' }}>Kalkulator Pupuk</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6, marginBottom: 12, color: 'var(--paper)' }}>Dosis NPK · TT 8 tahun</div>
        <div className="sh-num" style={{ fontSize: 30, fontWeight: 500, color: 'var(--amber-3)' }}>1,8 <span style={{ fontSize: 14, color: 'rgba(251,248,241,0.5)' }}>kg/pohon</span></div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ width: '72%', height: '100%', background: 'var(--amber)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'rgba(251,248,241,0.6)' }}>
          <span>240 pohon</span><span className="sh-num">432 kg total</span>
        </div>
      </div>
    </div>
  )
}

/* ── Laporan Preview ────────────────────────────────────────────── */
function LaporanPreview() {
  const months = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei']
  const bars = [42, 48, 55, 52, 61, 68, 72, 78, 75, 88, 92, 96]
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--amber-3)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600 }}>Untung Bersih · 12 Bulan</div>
          <div className="sh-num" style={{ fontSize: 40, fontWeight: 500, color: 'var(--paper)', marginTop: 8 }}>Rp&nbsp;482,4<span style={{ fontSize: 22, color: 'rgba(251,248,241,0.5)' }}>&thinsp;jt</span></div>
        </div>
        <span className="sh-chip" style={{ background: 'rgba(212,168,39,0.2)', color: 'var(--amber-3)', borderColor: 'rgba(212,168,39,0.3)' }}>↑ 24,8%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, marginBottom: 8 }}>
        {bars.map((v, i) => (
          <div key={i} style={{ flex: 1, position: 'relative' }}>
            <div style={{ width: '100%', height: `${v}%`, background: i === 11 ? 'var(--amber)' : 'rgba(212,168,39,0.3)', borderRadius: '4px 4px 0 0' }} />
            {i === 11 && <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--amber-3)', fontFamily: 'var(--f-mono)' }}>96jt</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--f-mono)', color: 'rgba(251,248,241,0.4)' }}>
        {months.map(m => <span key={m}>{m}</span>)}
      </div>
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 32 }}>
        {[['Pendapatan', 'Rp 1,24 M'], ['Biaya', 'Rp 758 jt']].map(([l, v]) => (
          <div key={l}>
            <div className="sh-eyebrow" style={{ color: 'rgba(251,248,241,0.45)' }}>{l}</div>
            <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, color: 'var(--paper)', marginTop: 4 }}>{v}</div>
          </div>
        ))}
        <div>
          <div className="sh-eyebrow" style={{ color: 'rgba(251,248,241,0.45)' }}>Margin</div>
          <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, color: 'var(--amber-3)', marginTop: 4 }}>38,9%</div>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
export default function Landing() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard')
  }, [user, isLoading, navigate])

  const handleSignupClick = (location: string) => {
    trackEvent(GAEvents.FUNNEL_LANDING_CTA, { funnel_step: 'landing_cta', button_location: location, page: 'landing' })
    trackEvent(GAEvents.CLICK_SIGNUP, { button_location: location, page: 'landing' })
    navigate('/signup')
  }

  const handleLoginClick = () => {
    trackEvent(GAEvents.CLICK_LOGIN, { button_location: 'header', page: 'landing' })
    navigate('/login')
  }

  return (
    <div style={{ background: 'var(--cream)', color: 'var(--ink)', minHeight: '100vh', fontFamily: 'var(--f-body)' }}>
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
        padding: '18px 56px',
        background: 'rgba(245,240,232,0.78)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(219,211,191,0.6)',
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <Link to="/" aria-label="Beranda SawitHub">
          <Logo size="sm" />
        </Link>
        <nav className="hidden lg:flex items-center" style={{ gap: 28, marginLeft: 16 }} aria-label="Navigasi utama">
          {(['Fitur', 'Untuk Petani', 'Koperasi', 'Harga', 'Cerita'] as const).map(l => (
            <a key={l}
              href={l === 'Fitur' ? '#fitur' : l === 'Harga' ? '#harga' : '#'}
              style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, textDecoration: 'none' }}
            >{l}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center" style={{ gap: 10 }}>
          <button onClick={handleLoginClick}
            className="hidden sm:inline-flex items-center"
            style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Masuk
          </button>
          <button
            onClick={() => handleSignupClick('header')}
            className="sh-btn sh-btn-primary sh-btn-sm"
            style={{ borderRadius: 999 }}
          >
            Coba gratis {SUBSCRIPTION_TRIAL_DAYS} hari
          </button>
          <button
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg lg:hidden"
            style={{ border: '1px solid var(--line)', background: 'var(--paper)' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Buka menu"
          >
            <span style={{ fontSize: 18 }}>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 lg:hidden" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '12px 16px 16px' }}>
            <div className="flex flex-col gap-1">
              {['Fitur', 'Harga', 'Bantuan'].map(label => (
                <a key={label} href={label === 'Fitur' ? '#fitur' : label === 'Harga' ? '#harga' : '/bantuan'}
                  style={{ padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
              <button onClick={() => { setMenuOpen(false); handleLoginClick() }}
                style={{ padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                Masuk
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ── */}
        <section style={{ position: 'relative', padding: '60px 56px 80px', overflow: 'hidden' }}>
          <PalmFrond size={520} style={{ position: 'absolute', right: -60, top: -40, opacity: 0.08, color: 'var(--forest)' }} />
          <PalmLeaf size={280} style={{ position: 'absolute', left: -40, bottom: -40, opacity: 0.1, color: 'var(--forest)', transform: 'rotate(-15deg)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center', maxWidth: 1320, margin: '0 auto' }}>
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 6px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, marginBottom: 28 }}>
                <span style={{ padding: '3px 9px', borderRadius: 999, background: 'var(--forest)', color: 'var(--paper)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em' }}>BARU</span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Kalkulator pupuk presisi v2026 · gratis untuk uji coba</span>
              </div>

              <h1 className="sh-h-display" style={{ marginBottom: 26, fontWeight: 400 }}>
                Kebun kamu,<br />
                dikelola seperti <em className="sh-italic" style={{ color: 'var(--forest)' }}>koperasi&nbsp;modern</em>.
              </h1>

              <p style={{ fontSize: 19, color: 'var(--ink-3)', maxWidth: 560, lineHeight: 1.55, marginBottom: 36 }}>
                SawitHub menyatukan catatan panen, biaya rawat, harga TBS, dan laporan keuangan kebun sawit — dalam satu tempat yang rapi, dapat dipercaya, dan mudah dibuka dari hape.
              </p>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 44 }}>
                <button
                  onClick={() => handleSignupClick('hero')}
                  className="sh-btn sh-btn-primary sh-btn-lg"
                  style={{ borderRadius: 999 }}
                >
                  Mulai gratis {SUBSCRIPTION_TRIAL_DAYS} hari <ArrowIcon size={16} />
                </button>
                <Link to="/bantuan"
                  className="sh-btn sh-btn-ghost sh-btn-lg"
                  style={{ borderRadius: 999, textDecoration: 'none' }}
                >
                  Lihat demo kebun ›
                </Link>
              </div>

              {/* Trust strip */}
              <div style={{ display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}>
                {stats.map((s, i) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {i > 0 && <div style={{ width: 1, height: 36, background: 'var(--line)' }} />}
                    <div>
                      <div className="sh-num" style={{ fontSize: 28, fontWeight: 500, color: 'var(--ink)' }}>{s.value}</div>
                      <div className="sh-eyebrow" style={{ marginTop: 4 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* ── Partners rail ── */}
        <section style={{ padding: '18px 56px', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)', background: 'var(--paper)' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div className="sh-eyebrow">Dipercaya oleh koperasi &amp; mitra agribisnis</div>
            <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
              {partners.map(n => (
                <span key={n} style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-4)', letterSpacing: '-0.01em' }}>{n}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section id="fitur" style={{ padding: '100px 56px 60px', position: 'relative' }}>
          <SunRays size={140} style={{ position: 'absolute', right: 80, top: 60, opacity: 0.08, color: 'var(--amber-2)' }} />
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Apa yang bisa dikerjakan</div>
              <h2 className="sh-h-1" style={{ maxWidth: 720 }}>
                Tujuh alat kerja kebun yang <em className="sh-italic">bekerja sama</em>, bukan terpisah.
              </h2>
            </div>
            <a href="#" style={{ fontSize: 14, color: 'var(--forest)', fontWeight: 600 }}>Jelajahi semua fitur →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="sh-card sh-lift" style={{ padding: 24, position: 'relative', overflow: 'hidden', minHeight: 200 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}14`, color: f.color, border: `1px solid ${f.color}22`, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                    <Icon size={18} />
                  </div>
                  <div className="sh-eyebrow" style={{ color: f.color, marginBottom: 8 }}>{f.eyebrow}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, lineHeight: 1.2, fontFamily: 'var(--f-display)' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55 }}>{f.desc}</p>
                  <PalmLeaf size={80} style={{ position: 'absolute', right: -10, bottom: -10, color: f.color, opacity: 0.06 }} />
                </div>
              )
            })}
          </div>
          </div>
        </section>

        {/* ── Editorial dark block — Laporan ── */}
        <section style={{ padding: '60px 56px 80px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ background: 'var(--forest)', color: 'var(--paper)', borderRadius: 32, padding: '64px 56px', position: 'relative', overflow: 'hidden' }}>
            <PalmFrond size={400} style={{ position: 'absolute', right: -80, top: -80, color: 'var(--paper)', opacity: 0.07 }} />
            <SoilWaves width={400} height={80} style={{ position: 'absolute', left: 0, bottom: 0, color: 'var(--amber)', opacity: 0.18 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'center', position: 'relative' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--amber-3)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>—— Laporan Keuangan</div>
                <h2 className="sh-h-1" style={{ color: 'var(--paper)', marginBottom: 24 }}>
                  Akhir bulan,<br />tanpa <em className="sh-italic" style={{ color: 'var(--amber-3)' }}>kalkulator&nbsp;manual</em>.
                </h2>
                <p style={{ fontSize: 17, color: 'rgba(251,248,241,0.7)', maxWidth: 460, lineHeight: 1.55, marginBottom: 32 }}>
                  Pendapatan, biaya, dan laba bersih per kebun — siap untuk koperasi, bank, atau pajak. Unduh Excel atau PDF, atau kirim langsung ke email pengurus.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleSignupClick('financial_section')} className="sh-btn sh-btn-amber" style={{ borderRadius: 999 }}>Coba laporan keuangan</button>
                  <button className="sh-btn sh-btn-ghost" style={{ borderRadius: 999, background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--paper)' }}>Contoh PDF →</button>
                </div>
              </div>
              <LaporanPreview />
            </div>
          </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ padding: '60px 56px 80px', background: 'var(--paper)' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Cerita petani</div>
            <h2 className="sh-h-2" style={{ maxWidth: 720, margin: '0 auto' }}>
              Dipakai pagi-pagi sebelum panen, sore setelah pulang dari kebun.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 18 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="sh-card" style={{ padding: 32, minHeight: 280, background: t.featured ? 'var(--cream)' : 'var(--surface)' }}>
                <div style={{ fontSize: 32, fontFamily: 'var(--f-display)', color: 'var(--amber-2)', lineHeight: 0.5, marginBottom: 12 }}>"</div>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: t.featured ? 22 : 17, lineHeight: 1.4, fontWeight: 400, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
                  {t.quote}
                </p>
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 99, background: 'var(--forest-soft)', display: 'grid', placeItems: 'center', color: 'var(--forest)' }}>
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="harga" style={{ padding: '80px 56px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Harga</div>
            <h2 className="sh-h-1">Mulai gratis. Tambah saat siap.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, maxWidth: 1120, margin: '0 auto' }}>
            {plans.map((p, i) => (
              <div key={i} style={{
                background: p.featured ? 'var(--forest)' : 'var(--paper)',
                color: p.featured ? 'var(--paper)' : 'var(--ink)',
                border: `1px solid ${p.featured ? 'var(--forest-2)' : 'var(--line)'}`,
                borderRadius: 24, padding: 32, position: 'relative',
                boxShadow: p.featured ? 'var(--sh-card-3)' : 'var(--sh-card)',
              }}>
                {p.featured && (
                  <div style={{ position: 'absolute', top: -12, right: 24, background: 'var(--amber)', color: '#2B1F00', fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 99, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    Paling populer
                  </div>
                )}
                <div className="sh-eyebrow" style={{ color: p.featured ? 'var(--amber-3)' : 'var(--ink-4)' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 48, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: p.featured ? 'rgba(251,248,241,0.55)' : 'var(--ink-4)' }}>{p.per}</span>
                </div>
                <p style={{ fontSize: 13.5, color: p.featured ? 'rgba(251,248,241,0.7)' : 'var(--ink-3)', marginBottom: 24, minHeight: 36 }}>{p.desc}</p>
                <button
                  onClick={() => handleSignupClick('pricing')}
                  className={p.featured ? 'sh-btn sh-btn-amber sh-btn-lg' : 'sh-btn sh-btn-primary sh-btn-lg'}
                  style={{ width: '100%', borderRadius: 999 }}
                >
                  {p.cta}
                </button>
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${p.featured ? 'rgba(255,255,255,0.12)' : 'var(--line)'}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.feats.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: p.featured ? 'rgba(251,248,241,0.85)' : 'var(--ink-2)' }}>
                      <div style={{ color: p.featured ? 'var(--amber-3)' : 'var(--forest)' }}><CheckIcon size={16} /></div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section style={{ padding: '20px 56px 80px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(120deg, var(--amber-soft), var(--cream))', border: '1px solid var(--line)', borderRadius: 32, padding: '64px 56px', position: 'relative', overflow: 'hidden' }}>
            <PalmFrond size={360} style={{ position: 'absolute', right: -40, top: -40, color: 'var(--forest)', opacity: 0.1 }} />
            <SunRays size={200} style={{ position: 'absolute', left: -40, bottom: -40, color: 'var(--amber-2)', opacity: 0.12 }} />
            <div style={{ position: 'relative', maxWidth: 640 }}>
              <h2 className="sh-h-1" style={{ marginBottom: 16 }}>
                Mulai dari panen <em className="sh-italic" style={{ color: 'var(--forest)' }}>minggu&nbsp;ini</em>.
              </h2>
              <p style={{ fontSize: 17, color: 'var(--ink-3)', marginBottom: 28, maxWidth: 520, lineHeight: 1.55 }}>
                {SUBSCRIPTION_TRIAL_DAYS} hari gratis tanpa kartu kredit. Tim kami bantu pindahkan catatan lama kamu — gratis.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => handleSignupClick('bottom_cta')} className="sh-btn sh-btn-primary sh-btn-lg" style={{ borderRadius: 999 }}>
                  Coba gratis {SUBSCRIPTION_TRIAL_DAYS} hari <ArrowIcon size={16} />
                </button>
                <button className="sh-btn sh-btn-ghost sh-btn-lg" style={{ borderRadius: 999 }}>Hubungi via WhatsApp</button>
              </div>
            </div>
          </div>
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl md:hidden" style={{ background: 'rgba(26,61,43,0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: 8, backdropFilter: 'blur(8px)' }}>
        <button
          onClick={() => handleSignupClick('sticky_mobile_cta')}
          className="w-full sh-btn sh-btn-amber sh-btn-lg"
          style={{ borderRadius: 999 }}
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
