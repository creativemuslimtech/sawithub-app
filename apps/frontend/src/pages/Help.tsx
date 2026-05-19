import { Link, useNavigate } from 'react-router-dom'
import PublicPageLayout from '../components/PublicPageLayout'
import { trackEvent, GAEvents } from '../utils/analytics'
import { MarketingCard, PrimaryButton } from '../components/design-system'

type FaqItem = { q: string; a: string; links?: { to: string; label: string }[] }

const guideSteps = [
  {
    title: '1. Tambah kebun pertama',
    desc: 'Isi nama kebun, luas, lokasi, tahun tanam, dan jumlah pohon agar laporan punya dasar.',
    to: '/lahan',
    link: 'Buka fitur Lahan setelah login',
    mock: ['Nama kebun', 'Luas lahan', 'Jumlah pohon'],
  },
  {
    title: '2. Catat panen atau perawatan',
    desc: 'Masukkan berat TBS, harga/kg, biaya panen, pupuk, semprot, atau biaya pekerja.',
    to: '/panen',
    link: 'Buka fitur Panen setelah login',
    mock: ['Berat TBS', 'Harga/kg', 'Biaya panen'],
  },
  {
    title: '3. Baca laporan awal',
    desc: 'Lihat uang masuk, total biaya, estimasi bersih, lalu unduh laporan bila perlu.',
    to: '/laporan-keuangan',
    link: 'Buka Laporan setelah login',
    mock: ['Pendapatan', 'Biaya', 'Bersih'],
  },
]

const faqGroups: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Mulai menggunakan SawitHub',
    items: [
      {
        q: 'Bagaimana cara mulai trial gratis 14 hari?',
        a: 'Klik tombol "Coba Gratis 14 Hari", buat akun dengan email dan password, lalu mulai isi data kebun pertama. Tidak perlu kartu kredit untuk mulai mencoba.',
        links: [{ to: '/signup', label: 'Mulai trial 14 hari' }],
      },
      {
        q: 'SawitHub cocok untuk siapa?',
        a: 'SawitHub cocok untuk petani sawit mandiri, pemilik kebun keluarga, dan pengelola beberapa lahan yang ingin tahu berat panen, biaya, dan hasil bersih dari HP.',
      },
      {
        q: 'Apa yang terjadi setelah 14 hari?',
        a: 'Jika cocok, Anda bisa lanjut paket Petani Mandiri sekitar Rp 30.000 per bulan. Jika belum cocok, trial berhenti tanpa tagihan kartu di awal karena trial tidak meminta kartu kredit.',
      },
    ],
  },
  {
    title: 'Catatan kebun dan laporan',
    items: [
      {
        q: 'Bagaimana cara mencatat panen TBS?',
        a: 'Masuk ke dashboard, pilih menu Panen, lalu tambah data panen. Isi kebun, tanggal, berat TBS, jumlah janjang, harga per kg, dan biaya panen. SawitHub membantu menghitung hasilnya.',
        links: [{ to: '/panen', label: 'Buka fitur Panen setelah login' }],
      },
      {
        q: 'Apakah bisa mencatat biaya pupuk dan perawatan?',
        a: 'Bisa. Gunakan menu Perawatan untuk mencatat pupuk, semprot, pruning, biaya bahan, biaya pekerja, dan keterangan kerja lapangan.',
        links: [{ to: '/perawatan', label: 'Buka fitur Perawatan setelah login' }],
      },
      {
        q: 'Apakah laporan bisa diunduh?',
        a: 'Ya. Laporan keuangan dapat diunduh sebagai Excel atau PDF agar mudah disimpan, dibawa, atau dikirim ke pihak yang membutuhkan.',
        links: [{ to: '/laporan-keuangan', label: 'Buka Laporan setelah login' }],
      },
    ],
  },
  {
    title: 'Akun, keamanan, dan koneksi',
    items: [
      {
        q: 'Apakah data kebun saya aman?',
        a: 'Kami melindungi data akun dan data kebun Anda. Data kebun Anda tidak kami jual. Gunakan password yang kuat dan jangan bagikan akun kepada orang lain.',
      },
      {
        q: 'Apakah SawitHub bisa dipakai offline?',
        a: 'Saat ini SawitHub membutuhkan internet agar data tersimpan dengan benar. Jika sinyal lemah, catat angka penting dulu di catatan HP atau kertas, lalu masukkan ke SawitHub saat koneksi sudah stabil.',
      },
      {
        q: 'Bagaimana jika sinyal di kebun sering lemah?',
        a: 'Buka SawitHub saat berada di tempat dengan koneksi lebih stabil, misalnya rumah, koperasi, atau area yang sinyalnya lebih kuat. Untuk kerja lapangan, simpan dulu tanggal, berat, harga, dan biaya di catatan HP agar bisa dimasukkan nanti.',
        links: [{ to: '/panen', label: 'Masukkan catatan panen setelah login' }],
      },
      {
        q: 'Apakah data aman jika saya ganti HP?',
        a: 'Data tersimpan di akun SawitHub, bukan hanya di satu HP. Setelah ganti HP, masuk kembali memakai email atau username. Tambahkan nomor telepon di halaman Profil agar ada opsi login tambahan.',
        links: [{ to: '/profile', label: 'Lengkapi Profil setelah login' }],
      },
      {
        q: 'Apa yang harus dilakukan sebelum menjual atau mengganti HP lama?',
        a: 'Pastikan Anda ingat email/username dan password SawitHub, lalu keluar dari akun di browser HP lama. Jangan berikan password kepada orang lain.',
      },
      {
        q: 'Bisakah SawitHub dipasang di HP Android?',
        a: 'Bisa. SawitHub dapat dibuka dari browser HP dan dipasang di layar utama HP seperti aplikasi.',
      },
      {
        q: 'Bagaimana cara menghapus akun atau data?',
        a: 'Anda dapat meminta penghapusan akun atau data melalui halaman Tentang Kami. Tim akan memverifikasi permintaan agar data tidak dihapus oleh pihak yang tidak berwenang.',
      },
    ],
  },
]

export default function Help() {
  const navigate = useNavigate()

  const handleContactClick = () => {
    trackEvent(GAEvents.CLICK_CONTACT, {
      source: 'help_page',
      button_location: 'not_found_section',
    })
    navigate('/tentang-kami#kontak')
  }

  return (
    <PublicPageLayout
      eyebrow="Pusat Bantuan"
      title="Jawaban cepat untuk mulai memakai SawitHub."
      description="Pelajari cara daftar, mencatat panen, membuat laporan, menjaga data, dan menghubungi tim SawitHub dengan bahasa yang sederhana."
    >
      <section className="rounded-xl-1 border border-forest-soft bg-forest-tint p-5 sm:p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">Panduan 3 langkah</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">Dari kebun pertama sampai laporan awal.</h2>
          <p className="mt-3 text-[15px] leading-7 text-ink-3">Panduan visual ini memakai contoh screenshot sederhana agar pengguna baru tahu apa yang perlu dilakukan setelah login.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {guideSteps.map(step => (
            <article key={step.title} className="rounded-xl border border-line bg-surface p-4 shadow-card-sm">
              <div role="img" aria-label={`Contoh screenshot ${step.title} di SawitHub`} className="rounded-xl border border-line bg-paper-2 p-3">
                <div className="mb-3 h-2 w-20 rounded-full bg-forest/40" />
                <div className="space-y-2">
                  {step.mock.map((item, index) => (
                    <div key={item} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-xs text-ink-3">
                      <span>{item}</span>
                      <span className="font-semibold text-forest">{index === 2 ? 'OK' : 'Isi'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-3">{step.desc}</p>
              <Link to={step.to} className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-forest-soft px-3 text-sm font-semibold text-forest transition hover:bg-forest-tint hover:text-forest-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">{step.link}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {faqGroups.map(group => (
          <MarketingCard key={group.title} className="p-5 sm:p-6 bg-surface border-line">
            <h2 className="text-xl font-semibold text-ink">{group.title}</h2>
            <div className="mt-4 space-y-3">
              {group.items.map(faq => (
                <details key={faq.q} className="group rounded-xl border border-line bg-paper open:border-forest-soft open:bg-forest-tint">
                  <summary className="cursor-pointer list-none p-4 text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                    <span className="inline-flex w-full items-center justify-between gap-3">
                      {faq.q}
                      <span className="text-forest transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-[15px] leading-7 text-ink-3">{faq.a}</p>
                  {faq.links ? (
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                      {faq.links.map(link => (
                        <Link key={link.to} to={link.to} className="inline-flex min-h-10 items-center rounded-lg border border-forest-soft px-3 text-sm font-semibold text-forest transition hover:bg-forest-tint hover:text-forest-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </details>
              ))}
            </div>
          </MarketingCard>
        ))}
      </section>

      <MarketingCard as="section" className="mt-8 border-forest-soft bg-forest-tint">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Tidak menemukan jawaban?</h2>
            <p className="mt-2 text-[15px] leading-7 text-ink-3">Kirim pesan ke tim SawitHub. Jelaskan kendala Anda, kebun yang ingin dicatat, atau pertanyaan tentang trial 14 hari.</p>
          </div>
          <PrimaryButton onClick={handleContactClick}>Hubungi Kami</PrimaryButton>
        </div>
      </MarketingCard>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['/privasi', 'Kebijakan Privasi', 'Cara SawitHub melindungi dan memakai data Anda.'],
          ['/syarat', 'Syarat & Ketentuan', 'Aturan trial, akun, langganan, dan penggunaan layanan.'],
          ['/tentang-kami', 'Tentang SawitHub', 'Kenapa SawitHub dibuat untuk petani sawit mandiri.'],
        ].map(([to, title, desc]) => (
          <Link key={to} to={to} className="rounded-xl-1 border border-line bg-surface p-5 shadow-card-sm transition hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
            <h3 className="font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-[15px] leading-7 text-ink-3">{desc}</p>
          </Link>
        ))}
      </section>
    </PublicPageLayout>
  )
}
