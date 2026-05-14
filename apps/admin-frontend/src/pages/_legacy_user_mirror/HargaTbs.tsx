import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'

interface HargaItem {
  id_harga: string
  tanggal: string
  harga_per_kg: number
  sumber: string
  created_at: string
}

export default function HargaTbs() {
  const [hargas, setHargas] = useState<HargaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 })

  useEffect(() => {
    fetchHargas()
  }, [])

  const fetchHargas = async () => {
    setLoading(true)
    try {
      const res = await api.get('/harga-tbs')
      const data = res.data || []
      setHargas(data)

      if (data.length > 0) {
        const prices = data.map((h: HargaItem) => h.harga_per_kg)
        setStats({
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length)
        })
      }
    } catch {
      toast.error('Gagal memuat data harga')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage title="Historis Harga TBS" subtitle="Tracking harga TBS dari panen Anda">
      <div className="space-y-6">
        {/* Stats */}
        {hargas.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
              <p className="text-blue-400 text-sm font-semibold">Harga Minimum</p>
              <p className="text-white text-2xl font-bold">Rp {stats.min.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center">
              <p className="text-yellow-400 text-sm font-semibold">Harga Rata-rata</p>
              <p className="text-white text-2xl font-bold">Rp {stats.avg.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
              <p className="text-green-400 text-sm font-semibold">Harga Maksimum</p>
              <p className="text-white text-2xl font-bold">Rp {stats.max.toLocaleString('id-ID')}</p>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">Memuat data...</div>
        ) : hargas.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Belum ada data harga. Mulai input panen untuk tracking harga!</div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Daftar Harga ({hargas.length})</h3>
            {hargas.map((harga, idx) => (
              <div key={harga.id_harga} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/[0.08] transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-400">#{idx + 1}</span>
                      <h4 className="text-white font-semibold">{new Date(harga.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}</h4>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{harga.sumber}</span>
                    </div>
                    <p className="text-2xl text-green-400 font-bold">Rp {harga.harga_per_kg.toLocaleString('id-ID')}/kg</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Dicatat: {new Date(harga.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })} {new Date(harga.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormPage>
  )
}
