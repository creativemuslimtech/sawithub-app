import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/PublicPageLayout'

const prohibited = [
  'Menggunakan SawitHub untuk aktivitas ilegal atau melanggar hukum.',
  'Mencoba mengakses akun atau data pengguna lain tanpa izin.',
  'Mengirim malware, spam, atau tindakan yang mengganggu sistem.',
  'Menyalin, menjual ulang, atau menyalahgunakan layanan tanpa izin tertulis.',
]

export default function Terms() {
  return (
    <PublicPageLayout
      eyebrow="Syarat & Ketentuan"
      title="Aturan penggunaan SawitHub dibuat agar layanan tetap aman dan jelas."
      description="Dokumen ini menjelaskan trial 14 hari, akun, data, pembayaran, batasan layanan, dan hak pengguna dalam bahasa yang ringkas."
    >
      <div className="space-y-6 text-[15px] leading-7 text-ink-3 sm:text-base">
        <section className="rounded-xl-1 border border-emerald-soft bg-emerald-tint p-6">
          <h2 className="text-xl font-semibold text-ink">Ringkasan singkat</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              'Trial gratis 14 hari tanpa kartu kredit.',
              'Setelah trial, paket Petani Mandiri direncanakan sekitar Rp 30.000/bulan jika cocok.',
              'Data kebun yang Anda masukkan tetap milik Anda.',
              'SawitHub membantu pencatatan; keputusan kebun tetap menjadi tanggung jawab pengguna.',
            ].map(item => (
              <li key={item} className="rounded-xl border border-emerald-soft bg-surface p-3 text-ink-3">{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-5 shadow-card-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terra">Baca cepat</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Baca cepat untuk pengguna baru</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-ink-3">Kalau layar HP terasa penuh, mulai dari tiga hal ini dulu.</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ['1', 'Coba dulu', 'Trial 14 hari gratis. Tidak perlu kartu kredit untuk mulai mencoba.'],
              ['2', 'Data tetap milik Anda', 'Catatan kebun dipakai agar fitur berjalan, bukan untuk dijual ke pihak lain.'],
              ['3', 'Keputusan tetap di tangan Anda', 'SawitHub membantu mencatat dan menghitung; keputusan kebun tetap milik pengguna.'],
            ].map(([number, title, copy]) => (
              <article key={title} className="rounded-xl border border-line bg-paper-2 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terra-soft text-sm font-bold text-terra">{number}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-base leading-7 text-ink-3">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">1. Penerimaan syarat</h2>
          <p className="mt-3">Dengan membuat akun atau menggunakan SawitHub, Anda menyetujui Syarat & Ketentuan ini. Jika tidak setuju, jangan gunakan layanan.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">2. Trial 14 hari, biaya, dan pembatalan</h2>
          <p className="mt-3">SawitHub menyediakan masa coba gratis 14 hari. Trial tidak meminta kartu kredit. Setelah masa coba selesai, pengguna dapat memilih melanjutkan paket berbayar jika cocok. Rencana harga paket Petani Mandiri sekitar Rp 30.000 per bulan dan dapat berubah dengan pemberitahuan yang wajar.</p>
          <p className="mt-3">Jika di kemudian hari pembayaran otomatis tersedia, mekanisme pembatalan, invoice, dan refund akan dijelaskan sebelum pengguna melakukan pembayaran.</p>
          <div className="mt-5 rounded-xl border border-terra-soft bg-terra-soft p-4">
            <p className="text-sm font-semibold text-terra">Sebelum billing aktif</p>
            <p className="mt-2 text-[15px] leading-7 text-ink-3">Sebelum peluncuran paket berbayar otomatis, SawitHub akan memperbarui halaman ini dengan detail perpanjangan langganan, tanggal penagihan, cara pembatalan, kebijakan refund, akses invoice, kanal sengketa pembayaran, dan pemberitahuan perubahan harga.</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {['Perpanjangan langganan dan tanggal tagihan', 'Pembatalan sebelum periode berikutnya', 'Refund bila ada kesalahan penagihan', 'Invoice dan bukti pembayaran', 'Sengketa pembayaran dan waktu respons', 'Pemberitahuan sebelum harga berubah'].map(item => (
                <li key={item} className="rounded-xl border border-line bg-surface p-3 text-ink-3">{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">3. Akun pengguna</h2>
          <p className="mt-3">Anda bertanggung jawab menjaga email, password, dan akses akun. Beri tahu kami jika ada dugaan akun digunakan tanpa izin.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">4. Data dan konten Anda</h2>
          <p className="mt-3">Data kebun, panen, biaya, jadwal, dan laporan yang Anda masukkan tetap menjadi milik Anda. Anda memberi SawitHub izin terbatas untuk menyimpan, memproses, dan menampilkan data tersebut agar fitur berjalan.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">5. Penggunaan yang dilarang</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {prohibited.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">6. Batasan layanan dan tanggung jawab</h2>
          <p className="mt-3">SawitHub membantu pencatatan dan perhitungan berdasarkan data yang Anda masukkan. SawitHub bukan pengganti nasihat agronomi, hukum, pajak, atau keuangan profesional. Keputusan kebun, pembelian pupuk, penjualan TBS, dan tindakan bisnis lain tetap menjadi tanggung jawab pengguna.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">7. Gangguan layanan dan perubahan fitur</h2>
          <p className="mt-3">Kami berusaha menjaga layanan tetap tersedia, tetapi tidak menjamin layanan selalu bebas gangguan. Fitur dapat diperbaiki, diubah, atau dihentikan untuk menjaga kualitas dan keamanan layanan.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">8. Penghentian akun dan penghapusan data</h2>
          <p className="mt-3">Kami dapat menonaktifkan akun yang melanggar syarat, mengganggu layanan, atau membahayakan pengguna lain. Anda dapat meminta penghapusan akun dan data melalui email <a href="mailto:privacy@sawithub.com" className="font-semibold text-emerald hover:text-emerald-2">privacy@sawithub.com</a> atau halaman <Link to="/tentang-kami#kontak" className="font-semibold text-emerald hover:text-emerald-2">Tentang Kami</Link>. Kami menargetkan respons awal maksimal 7 hari kerja dan penghapusan/anonimisasi data maksimal 30 hari kalender setelah verifikasi selesai, kecuali data tertentu wajib disimpan lebih lama oleh hukum.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">9. Hukum berlaku dan penyelesaian sengketa</h2>
          <p className="mt-3">Syarat ini diatur oleh hukum Republik Indonesia. Jika ada sengketa, pengguna dan SawitHub akan berupaya menyelesaikannya terlebih dahulu melalui komunikasi yang baik sebelum menempuh jalur hukum yang berlaku.</p>
        </section>

        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="text-xl font-semibold text-ink">10. Perubahan syarat</h2>
          <p className="mt-3">Kami dapat memperbarui syarat ini. Perubahan penting akan diinformasikan melalui situs atau kanal komunikasi yang tersedia.</p>
          <p className="mt-6 text-xs text-ink-4">Terakhir diperbarui: {new Date().getFullYear()}</p>
        </section>
      </div>
    </PublicPageLayout>
  )
}
