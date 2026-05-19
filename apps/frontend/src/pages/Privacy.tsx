import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/PublicPageLayout'

const dataTypes = [
  ['Data akun', 'Nama, email, nomor telepon, dan informasi login.'],
  ['Data kebun', 'Nama kebun, lokasi, luas lahan, tahun tanam, jumlah pohon, dan data lahan lain yang Anda isi.'],
  ['Data operasional', 'Catatan panen, perawatan, jadwal kerja, pupuk, pekerja, dan aktivitas kebun.'],
  ['Data keuangan', 'Pendapatan, biaya panen, biaya perawatan, dan laporan yang dihitung dari data Anda.'],
  ['Data teknis', 'Alamat IP, perangkat, browser, halaman yang dibuka, dan log keamanan.'],
]

const rights = [
  'Meminta akses ke data pribadi Anda.',
  'Memperbaiki data yang tidak akurat.',
  'Meminta penghapusan akun dan data terkait dengan target penyelesaian yang jelas.',
  'Menarik persetujuan untuk pemrosesan tertentu.',
  'Meminta informasi tentang tujuan penggunaan data.',
]

export default function Privacy() {
  return (
    <PublicPageLayout
      eyebrow="Kebijakan Privasi"
      title="Data kebun Anda tetap milik Anda."
      description="Kebijakan ini menjelaskan data apa yang dikumpulkan SawitHub, untuk apa digunakan, siapa yang membantu memprosesnya, dan bagaimana Anda dapat meminta akses, koreksi, atau penghapusan data."
    >
      <div className="space-y-6 text-[15px] leading-7 text-ink-3 sm:text-base">
        <section className="rounded-xl-1 border border-forest-soft bg-forest-tint p-6">
          <h2 className="text-xl font-semibold text-ink">Ringkasan singkat</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              'Kami tidak menjual data kebun Anda.',
              'Data dipakai untuk menjalankan fitur catatan, laporan, keamanan, dan dukungan pelanggan.',
              'Analitik hanya dipakai jika Anda menyetujui cookie analitik.',
              'Anda dapat meminta akses, koreksi, atau penghapusan data melalui privacy@sawithub.com atau halaman kontak.',
            ].map(item => (
              <li key={item} className="rounded-xl border border-forest-soft bg-surface p-3 text-ink-3">{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-5 shadow-card-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">Baca cepat</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Baca cepat tentang data Anda</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-ink-3">Tiga pegangan utama sebelum membaca detail kebijakan.</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ['1', 'Data kebun tidak dijual', 'Kami tidak menjual data pribadi, data kebun, panen, biaya, atau laporan Anda.'],
              ['2', 'Dipakai untuk fitur dan keamanan', 'Data diproses agar catatan, laporan, dukungan, dan perlindungan akun berjalan.'],
              ['3', 'Anda bisa meminta tindakan', 'Anda dapat meminta akses, koreksi, atau penghapusan data melalui privacy@sawithub.com. Kami menargetkan respons awal maksimal 7 hari kerja.'],
            ].map(([number, title, copy]) => (
              <article key={title} className="rounded-xl border border-line bg-paper-2 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest-tint text-sm font-bold text-forest">{number}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-base leading-7 text-ink-3">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">1. Data yang kami kumpulkan</h2>
          <div className="mt-4 grid gap-3">
            {dataTypes.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-paper-2 p-4">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-ink-3">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">2. Tujuan penggunaan data</h2>
          <p className="mt-3">Data digunakan untuk menyediakan fitur SawitHub, menyimpan catatan kebun, menghitung laporan, menjaga keamanan akun, membantu dukungan pelanggan, memperbaiki produk, dan memenuhi kewajiban hukum jika diperlukan.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">3. Dasar pemrosesan dan persetujuan</h2>
          <p className="mt-3">Kami memproses data berdasarkan persetujuan Anda saat membuat akun, kebutuhan menjalankan layanan yang Anda minta, kepentingan yang sah untuk keamanan dan peningkatan layanan, serta kewajiban hukum yang berlaku di Indonesia termasuk UU Perlindungan Data Pribadi.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">4. Penyimpanan, keamanan, dan retensi</h2>
          <p className="mt-3">Kami menerapkan kontrol akses, koneksi aman, dan perlindungan teknis untuk menjaga data. Data akun dan kebun disimpan selama akun aktif atau selama diperlukan untuk menyediakan layanan. Jika akun dihapus, kami menargetkan penghapusan atau anonimisasi data operasional maksimal 30 hari kalender setelah verifikasi selesai, kecuali data tertentu wajib disimpan lebih lama untuk kewajiban hukum, audit, keamanan, atau penyelesaian sengketa.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">5. Berbagi data dan pihak pemroses</h2>
          <p className="mt-3">Kami tidak menjual data pribadi atau data kebun Anda. Untuk menjalankan layanan, SawitHub dapat memakai penyedia infrastruktur, hosting, basis data, email, analitik, dan pemantauan performa. Pihak tersebut hanya boleh memproses data sesuai kebutuhan layanan dan instruksi SawitHub.</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Kategori pemroses data SawitHub dan status vendor</caption>
              <thead className="bg-paper-2 text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Contoh fungsi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-3">
                {[
                  ['Hosting & infrastruktur', 'Menjalankan aplikasi dan API SawitHub.', 'Vendor final akan dicantumkan setelah infrastruktur produksi dikunci.'],
                  ['Basis data & penyimpanan', 'Menyimpan akun, catatan kebun, dan laporan.', 'Vendor final akan dicantumkan setelah infrastruktur produksi dikunci.'],
                  ['Email transaksional', 'Mengirim OTP, reset password, dan notifikasi penting.', 'Vendor final akan dicantumkan setelah infrastruktur produksi dikunci.'],
                  ['Analitik pilihan', 'Memahami halaman/tombol yang membantu pengguna setelah consent.', 'Hanya aktif jika pengguna menyetujui cookie analitik.'],
                ].map(([category, purpose, status]) => (
                  <tr key={category}>
                    <th scope="row" className="px-4 py-3 font-semibold text-ink">{category}</th>
                    <td className="px-4 py-3">{purpose}</td>
                    <td className="px-4 py-3">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-3">Daftar vendor/subprocessor bernama akan ditambahkan di halaman ini setelah penyedia infrastruktur, email, analitik, dan pemantauan performa difinalkan.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">6. Cookie dan analitik</h2>
          <p className="mt-3">Cookie penting dipakai agar situs berjalan. Cookie analitik dipakai untuk memahami halaman dan tombol mana yang membantu pengguna, tetapi hanya setelah Anda menyetujui banner cookie. Anda dapat menolak analitik tanpa kehilangan akses ke fitur utama. Setelah memilih, Anda bisa membuka ulang pilihan melalui tautan "Pengaturan cookie" di footer situs.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">7. Hak Anda</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {rights.map(right => <li key={right}>{right}</li>)}
          </ul>
          <p className="mt-4">Untuk menjaga keamanan, kami dapat meminta verifikasi identitas sebelum menjalankan permintaan akses atau penghapusan data. Kami menargetkan respons awal maksimal 7 hari kerja setelah permintaan diterima. Untuk permintaan penghapusan, target penyelesaian adalah maksimal 30 hari kalender setelah verifikasi selesai, kecuali data tertentu wajib disimpan lebih lama oleh hukum.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">8. Kontak privasi</h2>
          <p className="mt-3">Jika Anda ingin bertanya tentang privasi, meminta penghapusan data, atau mengajukan koreksi, hubungi email privasi <a href="mailto:privacy@sawithub.com" className="font-semibold text-forest hover:text-forest-3">privacy@sawithub.com</a> atau halaman <Link to="/tentang-kami#kontak" className="font-semibold text-forest hover:text-forest-3">Tentang Kami</Link>.</p>
          <p className="mt-3">Untuk menjaga keamanan, permintaan akses, koreksi, atau penghapusan data akan diverifikasi terlebih dahulu. Respons awal ditargetkan maksimal 7 hari kerja dan penghapusan/anonimisasi data ditargetkan maksimal 30 hari kalender setelah verifikasi selesai, kecuali ada kewajiban hukum yang mengharuskan penyimpanan lebih lama.</p>
          <p className="mt-6 text-xs text-ink-4">Terakhir diperbarui: {new Date().getFullYear()}</p>
        </section>
      </div>
    </PublicPageLayout>
  )
}
