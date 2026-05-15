import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <PublicHeader bordered />

      {/* Content */}
      <main className="flex-1 px-6 sm:px-10 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white text-3xl sm:text-4xl font-bold mb-8">Syarat & Ketentuan</h1>

          <div className="space-y-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">1. Penerimaan Syarat</h2>
              <p>
                Dengan menggunakan SawitHub, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan syarat ini, silakan jangan gunakan aplikasi kami.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">2. Lisensi Penggunaan</h2>
              <p>
                Kami memberi Anda lisensi terbatas, non-eksklusif, tidak dapat dialihkan untuk menggunakan SawitHub untuk tujuan pribadi dalam mengelola kebun sawit Anda. Anda tidak boleh mereproduksi, mendistribusikan, atau mengirimkan kembali aplikasi ini tanpa izin tertulis dari kami.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">3. Akun Pengguna</h2>
              <p className="mb-3">Ketika membuat akun, Anda bertanggung jawab untuk:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Menyediakan informasi yang akurat dan lengkap</li>
                <li>Menjaga kerahasiaan password Anda</li>
                <li>Segera memberi tahu kami tentang penggunaan tidak sah</li>
                <li>Mematuhi semua hukum dan peraturan yang berlaku</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">4. Penggunaan Dilarang</h2>
              <p className="mb-3">Anda tidak boleh menggunakan SawitHub untuk:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Aktivitas ilegal atau melanggar hukum</li>
                <li>Mengganggu atau merusak sistem kami</li>
                <li>Mengakses data pengguna lain tanpa izin</li>
                <li>Mengirim malware atau kode berbahaya</li>
                <li>Spam atau penyalahgunaan komunikasi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">5. Data dan Konten Anda</h2>
              <p>
                Anda mempertahankan semua hak atas data yang Anda masukkan ke SawitHub. Dengan menyimpan data pada platform kami, Anda memberi kami izin untuk memproses, menyimpan, dan melindungi data tersebut untuk memberikan layanan.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">6. Pembatasan Tanggung Jawab</h2>
              <p>
                SawitHub disediakan "sebagaimana adanya" tanpa jaminan. Kami tidak bertanggung jawab atas kerugian tidak langsung, kebetulan, khusus, atau konsekuensial dari penggunaan aplikasi kami.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">7. Gangguan Layanan</h2>
              <p>
                Meskipun kami berusaha untuk menjaga ketersediaan layanan, kami tidak menjamin bahwa SawitHub akan selalu tersedia tanpa gangguan atau bebas dari kesalahan.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">8. Perubahan Syarat</h2>
              <p>
                Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan. Penggunaan berkelanjutan berarti Anda menerima perubahan tersebut.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">9. Penghentian Akun</h2>
              <p>
                Kami berhak untuk menghentikan akun Anda jika Anda melanggar Syarat dan Ketentuan ini atau menggunakan layanan dengan cara yang merugikan pengguna lain.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">10. Hukum Berlaku</h2>
              <p>
                Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
              </p>
            </section>

            <section>
              <p className="text-xs mt-12" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Terakhir diperbarui: {new Date().getFullYear()}
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t px-6 py-5 text-center text-xs"
        style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
        © {new Date().getFullYear()} SawitHub &nbsp;·&nbsp; Untuk petani sawit mandiri Indonesia
        &nbsp;·&nbsp;
        <Link to="/about" className="text-white/50 transition hover:text-white">Tentang Kami</Link>
      </footer>
    </div>
  )
}
