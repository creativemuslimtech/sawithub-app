import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <PublicHeader bordered />

      {/* Content */}
      <main className="flex-1 px-6 sm:px-10 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white text-3xl sm:text-4xl font-bold mb-8">Kebijakan Privasi</h1>

          <div className="space-y-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">1. Pendahuluan</h2>
              <p>
                SawitHub berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda ketika Anda menggunakan aplikasi kami.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">2. Informasi yang Kami Kumpulkan</h2>
              <p className="mb-3">Kami mengumpulkan informasi berikut:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Informasi profil: nama, email, nomor telepon</li>
                <li>Data kebun: lokasi, luas lahan, jenis tanaman</li>
                <li>Data operasional: panen, perawatan, tenaga kerja</li>
                <li>Data keuangan: pendapatan, biaya operasional</li>
                <li>Informasi teknis: log aktivitas, IP address</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">3. Penggunaan Informasi</h2>
              <p className="mb-3">Informasi yang kami kumpulkan digunakan untuk:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Menyediakan layanan aplikasi yang diminta</li>
                <li>Meningkatkan pengalaman pengguna</li>
                <li>Menganalisis tren dan pola penggunaan</li>
                <li>Mengirimkan notifikasi dan update penting</li>
                <li>Mencegah fraud dan memastikan keamanan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">4. Perlindungan Data</h2>
              <p>
                Kami menggunakan enkripsi AES-256-GCM untuk melindungi informasi pribadi Anda (email, nama lengkap, nomor telepon). Data Anda disimpan secara aman di server dengan akses terbatas dan dimonitor secara berkala.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">5. Berbagi Data</h2>
              <p>
                Kami tidak akan membagikan atau menjual informasi pribadi Anda kepada pihak ketiga tanpa persetujuan eksplisit dari Anda, kecuali diharuskan oleh hukum.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">6. Hak Anda</h2>
              <p className="mb-3">Anda memiliki hak untuk:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Mengakses data pribadi Anda</li>
                <li>Memperbaiki atau memperbarui informasi Anda</li>
                <li>Menghapus akun dan data terkait</li>
                <li>Menarik persetujuan pengolahan data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">7. Kontak Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan atau kekhawatiran tentang privasi Anda, silakan hubungi kami di bantuan@sawithub.app
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
