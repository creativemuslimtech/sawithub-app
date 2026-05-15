import AppLayout from '../components/AppLayout'

export default function BantuanAkses() {
  return (
    <AppLayout>
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container max-w-3xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-ink">Memahami batas trial</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              SawitHub dapat membatasi beberapa aksi saat akun masih trial atau pembayaran belum selesai. Jika Anda melihat pesan pembatasan,
              buka halaman Langganan untuk melihat status terbaru atau menyelesaikan pembayaran.
            </p>
          </div>

          <ul className="space-y-4 rounded-xl-1 border border-line bg-surface p-6 text-sm leading-relaxed text-ink-3 shadow-card-sm">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald" />
              <span>
                <strong className="text-ink">Panen & kebun:</strong> tambah panen atau kebun baru dapat dibatasi oleh paket atau status pembayaran.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: '#0284c7' }} />
              <span>
                <strong className="text-ink">Ekspor laporan:</strong> mengirim laporan ke email dapat memakai kuota trial terpisah.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: '#d97706' }} />
              <span>
                <strong className="text-ink">Multi-kebun:</strong> jika Anda punya lebih dari satu kebun, pilih kebun aktif di bilah atas agar laporan konsisten.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}
