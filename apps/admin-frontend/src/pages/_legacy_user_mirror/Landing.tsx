import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicHeader from '../components/PublicHeader'
import { SidebarCalculatorIcon } from '../components/AppNavigationIcons'
import {
  CheckmarkIconSVG,
  HarvestIconSVG,
  HomeIconSVG,
  LocationIconSVG,
  MaintenanceIconSVG,
  MoneyIconSVG,
} from '../components/icons'
import { trackEvent, GAEvents } from '../utils/analytics'
import { SEO, StructuredData, SEOConfig } from '../components/SEO'

type FeatureIcon = ({ color, size }: { color?: string; size?: number }) => ReactElement
type PreviewType = 'ringkasan' | 'lahan' | 'panen' | 'perawatan' | 'jadwal' | 'laporan' | 'kalkulator'

type FeatureItem = {
  title: string
  shortTitle: string
  eyebrow: string
  desc: string
  accent: string
  icon: FeatureIcon
  preview: PreviewType
  bullets: string[]
}

const featureItems: FeatureItem[] = [
  {
    title: 'Ringkasan kebun',
    shortTitle: 'Ringkasan',
    eyebrow: 'Lihat keadaan kebun',
    desc: 'Satu halaman untuk melihat hasil panen, harga TBS, uang masuk, biaya, dan jadwal kerja terdekat.',
    accent: '#22c55e',
    icon: HomeIconSVG,
    preview: 'ringkasan',
    bullets: ['Tahu kebun mana yang paling bagus', 'Lihat untung bersih tanpa hitung manual', 'Baca jadwal kerja berikutnya'],
  },
  {
    title: 'Data lahan',
    shortTitle: 'Lahan',
    eyebrow: 'Atur kebun dan letaknya',
    desc: 'Catat nama kebun, luas lahan, lokasi, tahun tanam, dan jumlah pohon supaya semua data dasar rapi.',
    accent: '#38bdf8',
    icon: LocationIconSVG,
    preview: 'lahan',
    bullets: ['Cocok untuk lebih dari satu kebun', 'Mudah cek luas dan jumlah pohon', 'Data dipakai untuk laporan per hektare'],
  },
  {
    title: 'Catat panen',
    shortTitle: 'Panen',
    eyebrow: 'Berat, harga, dan hasil',
    desc: 'Masukkan tanggal panen, berat TBS, jumlah janjang, harga per kg, dan biaya panen. Aplikasi langsung menghitung hasilnya.',
    accent: '#4ade80',
    icon: HarvestIconSVG,
    preview: 'panen',
    bullets: ['Harga dan pendapatan dihitung otomatis', 'Biaya panen langsung masuk laporan', 'Riwayat panen mudah dicari lagi'],
  },
  {
    title: 'Catat perawatan',
    shortTitle: 'Perawatan',
    eyebrow: 'Pupuk, semprot, dan biaya',
    desc: 'Simpan biaya bahan, jumlah pemakaian, biaya pekerja, dan keterangan kerja lapangan.',
    accent: '#a78bfa',
    icon: MaintenanceIconSVG,
    preview: 'perawatan',
    bullets: ['Pisahkan biaya bahan dan pekerja', 'Tahu biaya rawat tiap kebun', 'Mudah cek kerja yang sudah dilakukan'],
  },
  {
    title: 'Jadwal kerja',
    shortTitle: 'Jadwal',
    eyebrow: 'Kerja tidak mudah lupa',
    desc: 'Buat jadwal pupuk, semprot, pruning, atau kerja lain. Pilih jarak jadwal yang jelas seperti 3 bulan sekali.',
    accent: '#f59e0b',
    icon: CheckmarkIconSVG,
    preview: 'jadwal',
    bullets: ['Tanggal tampil lengkap dengan tahun', 'Bisa atur jadwal berulang', 'Membantu siap bahan dan tenaga kerja'],
  },
  {
    title: 'Kalkulator pupuk',
    shortTitle: 'Kalkulator',
    eyebrow: 'Hitung dosis awal',
    desc: 'Hitung kebutuhan pupuk dari umur tanaman, jumlah pohon, kadar N, P, K tanah, jenis pupuk, dan periode pemupukan.',
    accent: '#84cc16',
    icon: SidebarCalculatorIcon,
    preview: 'kalkulator',
    bullets: ['Bisa auto isi umur tanaman dan jumlah pohon dari data lahan', 'Tahu dosis per pohon, total tahunan, dan dosis per periode', 'Hasil tersimpan di sesi aktif tanpa masuk database'],
  },
  {
    title: 'Laporan keuangan',
    shortTitle: 'Laporan',
    eyebrow: 'Uang masuk dan keluar',
    desc: 'Lihat pendapatan, biaya, laba bersih, grafik, dan detail panen. Laporan bisa diunduh Excel atau PDF dan dikirim ke email.',
    accent: '#34d399',
    icon: MoneyIconSVG,
    preview: 'laporan',
    bullets: ['Nominal uang tampil rapi dan mudah dibaca', 'Bisa filter minggu, bulan, dan tahun', 'Excel dan PDF langsung terkirim ke email'],
  },
]

const quickWins = [
  { value: '3 bulan', label: 'gratis pertama' },
  { value: 'Untung bersih', label: 'langsung terlihat' },
  { value: 'Jadwal rapi', label: 'tanggal kerja lebih jelas' },
  { value: 'Excel + PDF', label: 'laporan siap dibawa' },
]

const pricingBenefits = [
  'Semua fitur catatan kebun aktif',
  'Laporan Excel dan PDF',
  'Kirim laporan ke email',
  'Data panen, biaya, dan jadwal tersimpan rapi',
]

function MiniMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase leading-none text-white/40">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-tight text-white" style={{ color: accent }}>{value}</p>
    </div>
  )
}

function ScreenFrame({ title, badge, accent, children }: { title: string; badge: string; accent: string; children: ReactNode }) {
  return (
    <figure
      className="overflow-hidden rounded-lg border shadow-2xl"
      style={{
        borderColor: `${accent}45`,
        background: 'linear-gradient(145deg, rgba(7,12,16,0.96), rgba(12,22,18,0.92))',
        boxShadow: `0 24px 80px ${accent}18`,
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
          <span className="text-xs font-semibold text-white">{title}</span>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ color: accent, background: `${accent}18` }}>
          {badge}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </figure>
  )
}

function RingkasanPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Ringkasan kebun" badge="Dashboard" accent={accent}>
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Total produksi" value="7,10 ton" accent="#4ade80" />
        <MiniMetric label="Laba bersih" value="Rp 18.524.000" accent="#34d399" />
        <MiniMetric label="Harga TBS" value="Rp 3.290/kg" accent="#facc15" />
        <MiniMetric label="Jadwal dekat" value="11 Juli 2026" accent="#38bdf8" />
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="text-xs font-semibold text-white">Kebun 2 sedang paling baik.</p>
        <p className="mt-1 text-xs leading-relaxed text-white/50">Hasil panen tinggi dan biaya masih terkendali.</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-full w-[82%] rounded-full bg-emerald-400" />
        </div>
      </div>
    </ScreenFrame>
  )
}

function LahanPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Daftar lahan" badge="2 kebun" accent={accent}>
      <div className="space-y-3">
        {[
          ['Kebun 1', '1,00 ha', '185 pohon', 'Sei Mencirim'],
          ['Kebun 2', '2,00 ha', '320 pohon', 'Namorambe'],
          ['Blok Baru', '0,75 ha', '120 pohon', 'Data siap dilengkapi'],
        ].map(row => (
          <div key={row[0]} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div>
              <p className="text-sm font-semibold text-white">{row[0]}</p>
              <p className="mt-1 text-xs text-white/50">{row[3]}</p>
            </div>
            <div className="text-right text-xs text-white/60">
              <p>{row[1]}</p>
              <p>{row[2]}</p>
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  )
}

function PanenPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Catat panen" badge="Otomatis" accent={accent}>
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Berat TBS" value="1,80 ton" accent="#4ade80" />
        <MiniMetric label="Harga/kg" value="Rp 3.290" accent="#facc15" />
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
        {[
          ['20 Apr 2026', 'Kebun 2', 'Rp 5.922.000'],
          ['18 Apr 2026', 'Kebun 1', 'Rp 3.630.000'],
          ['06 Apr 2026', 'Kebun 2', 'Rp 11.392.000'],
        ].map(row => (
          <div key={`${row[0]}-${row[1]}`} className="grid grid-cols-[1fr_0.8fr_1fr] gap-2 border-b border-white/10 px-3 py-2 text-xs last:border-b-0">
            <span className="text-white/50">{row[0]}</span>
            <span className="font-medium text-white">{row[1]}</span>
            <span className="text-right font-semibold text-emerald-300">{row[2]}</span>
          </div>
        ))}
      </div>
    </ScreenFrame>
  )
}

function PerawatanPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Biaya perawatan" badge="Rawat" accent={accent}>
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-sm font-semibold text-white">Pemupukan - Kebun 2</p>
          <p className="mt-1 text-xs text-white/50">Pupuk NPK, tenaga kerja, dan catatan lapangan.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Material" value="Rp 1.200.000" accent="#a78bfa" />
          <MiniMetric label="Pekerja" value="Rp 450.000" accent="#38bdf8" />
          <MiniMetric label="Total" value="Rp 1.650.000" accent="#facc15" />
        </div>
      </div>
    </ScreenFrame>
  )
}

function JadwalPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Jadwal kerja" badge="Tahun 2026" accent={accent}>
      <div className="space-y-3">
        {[
          ['Pupuk - Kebun 2', '11 Juli 2026', '#f97316'],
          ['Pupuk - Kebun 2', '11 Oktober 2026', '#22c55e'],
          ['Semprot - Kebun 1', '01 Desember 2026', '#38bdf8'],
        ].map(row => (
          <div key={row[1]} className="grid grid-cols-[4px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <span className="h-10 rounded-full" style={{ background: row[2] }} />
            <p className="text-sm font-semibold text-white">{row[0]}</p>
            <p className="text-right text-xs font-semibold" style={{ color: row[2] }}>{row[1]}</p>
          </div>
        ))}
      </div>
    </ScreenFrame>
  )
}

function LaporanPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Laporan keuangan" badge="Excel + PDF" accent={accent}>
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Pendapatan" value="Rp 24.394.000" accent="#facc15" />
        <MiniMetric label="Total biaya" value="Rp 5.870.000" accent="#f87171" />
        <MiniMetric label="Bersih" value="Rp 18.524.000" accent="#4ade80" />
      </div>
      <div className="mt-4 flex items-end gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        {[44, 72, 36, 88, 58].map((height, index) => (
          <div key={height} className="flex flex-1 flex-col items-center gap-2">
            <span className="w-full rounded-t-sm bg-emerald-400/80" style={{ height }} />
            <span className="text-[10px] text-white/35">M{index + 1}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/50">Saat Excel atau PDF ditekan, file diunduh dan salinan dikirim ke email.</p>
    </ScreenFrame>
  )
}

function KalkulatorPreview({ accent }: { accent: string }) {
  return (
    <ScreenFrame title="Kalkulator pupuk" badge="Sesi aktif" accent={accent}>
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Umur tanaman" value="5 tahun" accent="#84cc16" />
        <MiniMetric label="Jumlah pohon" value="100 pohon" accent="#38bdf8" />
        <MiniMetric label="Kadar tanah" value="N 0,10% · P 0,05% · K 0,08%" accent="#facc15" />
        <MiniMetric label="Periode" value="3 kali/tahun" accent="#a78bfa" />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-white">Hasil hitung awal</p>
          <span className="rounded-full bg-lime-400/10 px-2.5 py-1 text-[10px] font-semibold text-lime-200">K paling rendah</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniMetric label="Per pohon / tahun" value="4,95 kg" accent="#84cc16" />
          <MiniMetric label="Total tahunan" value="495 kg" accent="#38bdf8" />
          <MiniMetric label="Per periode" value="165 kg" accent="#f59e0b" />
          <MiniMetric label="Status tanah" value="N sedang · P sedang · K rendah" accent="#f97316" />
        </div>
      </div>
    </ScreenFrame>
  )
}

function FeaturePreview({ type, accent }: { type: PreviewType; accent: string }) {
  if (type === 'ringkasan') return <RingkasanPreview accent={accent} />
  if (type === 'lahan') return <LahanPreview accent={accent} />
  if (type === 'panen') return <PanenPreview accent={accent} />
  if (type === 'perawatan') return <PerawatanPreview accent={accent} />
  if (type === 'jadwal') return <JadwalPreview accent={accent} />
  if (type === 'kalkulator') return <KalkulatorPreview accent={accent} />
  return <LaporanPreview accent={accent} />
}

export default function Landing() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const activeFeature = featureItems[activeFeatureIndex] ?? featureItems[0]
  const ActiveFeatureIcon = activeFeature.icon

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard')
  }, [user, isLoading, navigate])

  const handleSignupClick = (location: string) => {
    trackEvent(GAEvents.CLICK_SIGNUP, {
      button_location: location,
      page: 'landing',
    })
    navigate('/signup')
  }

  const handleLoginClick = () => {
    trackEvent(GAEvents.CLICK_LOGIN, {
      button_location: 'header',
      page: 'landing',
    })
    navigate('/login')
  }

  return (
    <div
      className="min-h-screen bg-[#06100c] text-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
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
            description: 'Gratis 3 bulan pertama, kemudian Rp 30.000 per bulan',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '127',
          },
          description:
            'Platform digital untuk petani sawit Indonesia. Kelola lahan, catat panen TBS, hitung pupuk, dan buat laporan keuangan otomatis. Ekspor Excel & PDF langsung ke email.',
          screenshot: 'https://sawithub.com/og-image.png',
          author: {
            '@type': 'Organization',
            name: 'SawitHub',
            url: 'https://sawithub.com',
          },
        }}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SawitHub',
          url: 'https://sawithub.com',
          logo: 'https://sawithub.com/logo.png',
          description:
            'Platform manajemen kebun sawit digital untuk petani Indonesia',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'support@sawithub.com',
          },
          sameAs: [
            'https://www.facebook.com/sawithub',
            'https://www.instagram.com/sawithub',
            'https://twitter.com/sawithub',
          ],
        }}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Apa itu SawitHub?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'SawitHub adalah aplikasi manajemen kebun sawit digital yang membantu petani mengelola lahan, mencatat panen TBS, menghitung kebutuhan pupuk, membuat jadwal perawatan, dan menghasilkan laporan keuangan otomatis.',
              },
            },
            {
              '@type': 'Question',
              name: 'Apakah SawitHub gratis?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, SawitHub gratis untuk 3 bulan pertama. Setelah itu biaya berlangganan sekitar Rp 30.000 per bulan.',
              },
            },
            {
              '@type': 'Question',
              name: 'Fitur apa saja yang ada di SawitHub?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'SawitHub menyediakan fitur catat lahan, catat panen, catat perawatan, jadwal kerja, kalkulator pupuk, dan laporan keuangan otomatis dengan ekspor Excel & PDF.',
              },
            },
            {
              '@type': 'Question',
              name: 'Apakah data saya aman?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, semua data disimpan dengan enkripsi dan hanya Anda yang dapat mengaksesnya. Kami tidak membagikan data Anda kepada pihak ketiga.',
              },
            },
          ],
        }}
      />
      <PublicHeader
        className="absolute inset-x-0 top-0 z-30"
        rightSlot={(
          <>
            <button
              onClick={handleLoginClick}
              className="rounded-lg border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Masuk
            </button>
            <button
              onClick={() => handleSignupClick('header')}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400"
            >
              Coba Gratis
            </button>
          </>
        )}
      />

      <main>
        <section className="relative flex min-h-[84svh] items-center overflow-hidden px-4 pb-14 pt-24 sm:px-8 lg:px-10">
          <picture className="absolute inset-0">
            <source srcSet="/sawit-hero-hd.webp" type="image/webp" />
            <img
              src="/sawit-hero-hd.jpg"
              alt="Kebun sawit"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,9,7,0.92)_0%,rgba(3,9,7,0.72)_48%,rgba(3,9,7,0.35)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#06100c] to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur">
                Gratis 3 bulan pertama untuk petani sawit mandiri
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
                Kelola kebun sawit lebih mudah, untung lebih jelas.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                Catat panen, kontrol biaya, atur jadwal perawatan. Lihat untung bersih tanpa hitung manual. Semua data kebun Anda dalam satu aplikasi.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => handleSignupClick('hero_section')}
                  className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400"
                >
                  Mulai gratis 3 bulan
                </button>
                <a
                  href="#harga"
                  className="rounded-lg border border-white/25 bg-black/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Lihat harga
                </a>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {quickWins.map(item => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur">
                    <p className="text-sm font-bold leading-tight text-white">{item.value}</p>
                    <p className="mt-1 text-xs leading-snug text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#07150f] px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                ['📊', 'Laporan otomatis', 'Excel & PDF langsung kirim ke email'],
                ['💰', 'Untung jelas', 'Hitung laba bersih tanpa ribet'],
                ['⏰', 'Jadwal rapi', 'Pengingat pupuk & perawatan'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-2xl">
                    {icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm text-white/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="fitur" className="bg-[#06100c] px-4 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase text-emerald-300">Fitur lengkap</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Semua yang Anda butuhkan untuk kelola kebun sawit.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/60">
                Klik fitur di bawah untuk lihat cara kerjanya. Semua dibuat sederhana dan mudah dipakai.
              </p>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {featureItems.map((feature, index) => {
                  const Icon = feature.icon
                  const active = index === activeFeatureIndex
                  return (
                    <button
                      key={feature.title}
                      type="button"
                      onClick={() => setActiveFeatureIndex(index)}
                      className="rounded-lg border p-4 text-left transition"
                      style={{
                        borderColor: active ? `${feature.accent}55` : 'rgba(255,255,255,0.1)',
                        background: active ? `${feature.accent}14` : 'rgba(255,255,255,0.03)',
                        boxShadow: active ? `0 18px 44px ${feature.accent}12` : 'none',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                          style={{ borderColor: `${feature.accent}42`, background: `${feature.accent}18` }}
                        >
                          <Icon color={feature.accent} size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase" style={{ color: active ? feature.accent : 'rgba(255,255,255,0.45)' }}>
                            {feature.shortTitle}
                          </p>
                          <p className="mt-1 text-base font-semibold leading-tight text-white">{feature.title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/55">{feature.eyebrow}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                <div className="mb-5 flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
                    style={{ borderColor: `${activeFeature.accent}48`, background: `${activeFeature.accent}16` }}
                  >
                    <ActiveFeatureIcon color={activeFeature.accent} size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase" style={{ color: activeFeature.accent }}>{activeFeature.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{activeFeature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">{activeFeature.desc}</p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <FeaturePreview type={activeFeature.preview} accent={activeFeature.accent} />

                  <div className="rounded-lg border border-white/10 bg-[#07120d] p-4">
                    <p className="text-xs font-semibold uppercase text-white/42">Yang didapat</p>
                    <div className="mt-4 space-y-3">
                      {activeFeature.bullets.map(bullet => (
                        <div key={bullet} className="flex gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 text-sm leading-6 text-white/72">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: activeFeature.accent }} />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="harga" className="bg-[#091911] px-4 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-300">Rencana harga</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Mulai gratis, lanjut murah kalau sudah terasa manfaatnya.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/60">
                SawitHub direncanakan memakai langganan bulanan yang ringan untuk petani mandiri. Tiga bulan pertama gratis supaya pengguna bisa mencoba dengan tenang.
              </p>
            </div>

            <div className="rounded-lg border border-emerald-300/25 bg-[#07120d] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-200">Paket Petani Mandiri</p>
                  <p className="mt-3 text-3xl font-semibold text-white">Gratis 3 bulan</p>
                  <p className="mt-2 text-sm text-white/60">Setelah itu sekitar Rp 30.000 per bulan.</p>
                </div>
                <button
                  onClick={() => handleSignupClick('pricing_section')}
                  className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400"
                >
                  Daftar sekarang
                </button>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {pricingBenefits.map(item => (
                  <div key={item} className="flex gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#06100c] px-4 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Cara kerjanya sangat sederhana</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                ['1', 'Daftar gratis', 'Buat akun dalam 30 detik. Tidak perlu kartu kredit.'],
                ['2', 'Isi data kebun', 'Masukkan info dasar: luas lahan, lokasi, jumlah pohon.'],
                ['3', 'Mulai catat', 'Catat panen, biaya, jadwal. Laporan otomatis tersedia.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-bold text-emerald-300">
                    {num}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-white/60">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Siap coba catatan kebun yang lebih rapi?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Mulai dari satu kebun dulu. Kalau sudah cocok, lanjutkan untuk semua kebun.
            </p>
            <button
              onClick={() => handleSignupClick('bottom_cta')}
              className="mt-6 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400"
            >
              Coba gratis 3 bulan
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40 sm:px-8">
        © {new Date().getFullYear()} SawitHub / Untuk petani sawit mandiri Indonesia
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/about')} className="bg-transparent p-0 text-white/50 transition hover:text-white">Tentang Kami</button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/privacy')} className="bg-transparent p-0 text-white/50 transition hover:text-white">Privasi</button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/terms')} className="bg-transparent p-0 text-white/50 transition hover:text-white">Syarat</button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/help')} className="bg-transparent p-0 text-white/50 transition hover:text-white">Bantuan</button>
      </footer>
    </div>
  )
}
