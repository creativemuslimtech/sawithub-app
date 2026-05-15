import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import type { Lahan } from '../types'

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function AddInventory() {
  const navigate = useNavigate()
  const [lahanList, setLahanList] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    id_lahan: '', jenis_barang: '',
    stok_awal: '0', masuk: '0', keluar: '0', tanggal_update: '',
  })
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => { api.get('/lahan').then((r) => setLahanList(r.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/inventory', {
        id_lahan: parseInt(form.id_lahan),
        jenis_barang: form.jenis_barang,
        stok_awal: parseFloat(form.stok_awal) || 0,
        masuk: parseFloat(form.masuk) || 0,
        keluar: parseFloat(form.keluar) || 0,
        tanggal_update: form.tanggal_update,
      })
      toast.success('Data inventory berhasil disimpan!')
      navigate('/dashboard')
    } catch {
      toast.error('Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage title="Tambah Data Inventory" subtitle="Catat stok bahan dan peralatan kebun">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Pilih Lahan *</label>
          <select className={INP} value={form.id_lahan} onChange={set('id_lahan')} required>
            <option value="">-- Pilih Lahan --</option>
            {lahanList.map((l) => (
              <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun} ({l.jenis_bibit})</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Jenis Barang *</label>
          <input className={INP} value={form.jenis_barang} onChange={set('jenis_barang')} required placeholder="cth: Pupuk NPK, Herbisida" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Stok Awal</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.stok_awal} onChange={set('stok_awal')} placeholder="0" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Masuk (+)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.masuk} onChange={set('masuk')} placeholder="0" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Keluar (-)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.keluar} onChange={set('keluar')} placeholder="0" />
          </div>
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Tanggal Update *</label>
          <input type="date" className={INP} value={form.tanggal_update} onChange={set('tanggal_update')} required />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
          onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
          onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
          {loading ? 'Menyimpan...' : 'Simpan Data Inventory'}
        </button>
      </form>
    </FormPage>
  )
}
