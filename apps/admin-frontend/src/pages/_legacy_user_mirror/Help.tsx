import { Link, useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { trackEvent, GAEvents } from '../utils/analytics'

export default function Help() {
  const navigate = useNavigate()

  const handleContactClick = () => {
    trackEvent(GAEvents.CLICK_CONTACT, {
      source: 'help_page',
      button_location: 'not_found_section',
    })
    navigate('/about')
  }

  const faqs = [
    {
      q: 'Bagaimana cara mendaftar akun SawitHub?',
      a: 'Klik tombol "Daftar Gratis" di halaman utama. Isi email dan password Anda, lalu verifikasi email untuk menyelesaikan pendaftaran. Tidak diperlukan kartu kredit.'
    },
    {
      q: 'Bagaimana cara mencatat panen TBS?',
      a: 'Masuk ke dashboard, pilih menu "Panen", klik tombol tambah (+), kemudian isi data panen meliputi: lahan, tanggal, berat, janjang, dan harga per kg. Sistem akan menghitung otomatis pendapatan kotor.'
    },
    {
      q: 'Bisakah saya menggunakan SawitHub offline?',
      a: 'Saat ini SawitHub memerlukan koneksi internet untuk semua operasi. Pastikan Anda terhubung ke internet untuk menggunakan semua fitur aplikasi.'
    },
    {
      q: 'Bagaimana cara menghapus akun saya?',
      a: 'Buka menu pengaturan, gulir ke bawah, dan pilih "Hapus Akun". Data Anda akan dihapus secara permanen setelah konfirmasi. Tindakan ini tidak dapat dibatalkan.'
    },
    {
      q: 'Bagaimana keamanan data saya?',
      a: 'Kami menggunakan enkripsi AES-256-GCM untuk melindungi data pribadi Anda. Password disimpan dengan hash aman dan tidak dapat dibaca oleh siapapun, bahkan tim kami.'
    },
    {
      q: 'Berapa biaya untuk menggunakan SawitHub?',
      a: 'SawitHub bisa dicoba gratis selama 3 bulan pertama. Setelah masa coba selesai, rencana biaya langganan sekitar Rp 30.000 per bulan untuk paket petani mandiri.'
    },
    {
      q: 'Bisakah saya menggunakan SawitHub di HP Android?',
      a: 'Ya, SawitHub tersedia di Android melalui Progressive Web App (PWA). Buka aplikasi di browser, pilih "Install App", dan akses langsung dari home screen HP Anda.'
    },
    {
      q: 'Bagaimana cara menghubungi dukungan pelanggan?',
      a: 'Buka halaman "Tentang Kami", lalu isi form kontak. Pesan Anda akan masuk ke email tim kami dan kami balas melalui email yang Anda tulis.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <PublicHeader bordered />

      {/* Content */}
      <main className="flex-1 px-6 sm:px-10 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-white text-3xl sm:text-4xl font-bold mb-3">Pusat Bantuan</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Temukan jawaban untuk pertanyaan umum tentang SawitHub di sini.
            </p>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl p-6 border transition"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                <h3 className="text-white font-semibold mb-3 text-base">{faq.q}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 rounded-2xl p-8"
            style={{ background: 'linear-gradient(135deg, rgba(122,92,255,0.15) 0%, rgba(167,139,250,0.15) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-white text-xl font-bold mb-3">Tidak menemukan jawaban?</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-4">
              Buka halaman Tentang Kami lalu kirim pesan Anda. Pesan akan masuk ke email tim kami untuk ditindaklanjuti.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-block px-6 py-2.5 rounded-lg text-white font-semibold transition text-sm"
              style={{ background: 'var(--color-primary)' }}
              onMouseOver={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
              Buka Halaman Kontak
            </button>
          </div>

          {/* Resources */}
          <div className="mt-12">
            <h2 className="text-white text-xl font-bold mb-6">Lihat Juga</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => navigate('/privacy')}
                className="text-left rounded-xl p-5 border transition"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                <h3 className="text-white font-semibold mb-1">Kebijakan Privasi</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
                  Pelajari bagaimana kami melindungi data Anda
                </p>
              </button>
              <button onClick={() => navigate('/terms')}
                className="text-left rounded-xl p-5 border transition"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                <h3 className="text-white font-semibold mb-1">Syarat & Ketentuan</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
                  Pahami syarat penggunaan layanan kami
                </p>
              </button>
              <button onClick={() => navigate('/about')}
                className="text-left rounded-xl p-5 border transition"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                <h3 className="text-white font-semibold mb-1">Tentang Kami</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
                  Lihat cerita singkat SawitHub dan kirim pesan ke tim kami
                </p>
              </button>
            </div>
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
