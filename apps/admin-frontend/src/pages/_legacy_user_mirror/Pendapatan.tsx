import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import { parseRupiahInput, toRupiahInputRaw } from '../utils/rupiah'

interface PendapatanItem {
  id_pendapatan: string
  id_lahan: string
  tanggal_panen: string
  total_janjang: number
  total_berat_kg: number
  pendapatan_kotor: number
  biaya_total: number
  pendapatan_bersih: number
  catatan: string
}

interface Lahan {
  id_lahan: string
  nama_kebun: string
  luas_ha: number
}

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function Pendapatan() {
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState(false)
  const [pendapatans, setPendapatans] = useState<PendapatanItem[]>([])
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    id_lahan: '', tanggal_panen: '', total_janjang: '',
    total_berat_kg: '', pendapatan_kotor: '', biaya_total: '', catatan: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  const setCurrency = (k: 'pendapatan_kotor' | 'biaya_total') =>
    (value: string) =>
      setForm((f) => ({ ...f, [k]: value }))

  const fetchLahans = async () => {
    try {
      const res = await api.get('/lahan')
      setLahans(res.data || [])
    } catch {
      toast.error('Gagal memuat data lahan')
    }
  }

  const fetchPendapatans = async () => {
    setListing(true)
    try {
      const res = await api.get('/pendapatan')
      setPendapatans(res.data || [])
    } catch {
      toast.error('Gagal memuat data pendapatan')
    } finally {
      setListing(false)
    }
  }

  useEffect(() => {
    fetchLahans()
    fetchPendapatans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        id_lahan: form.id_lahan,
        tanggal_panen: form.tanggal_panen,
        total_janjang: parseInt(form.total_janjang) || 0,
        total_berat_kg: parseFloat(form.total_berat_kg),
        pendapatan_kotor: parseRupiahInput(form.pendapatan_kotor),
        biaya_total: parseRupiahInput(form.biaya_total),
        catatan: form.catatan,
      }
      if (editingId) {
        await api.put(`/pendapatan/${editingId}`, data)
        toast.success('Data pendapatan berhasil diperbarui!')
        setEditingId(null)
      } else {
        await api.post('/pendapatan', data)
        toast.success('Data pendapatan berhasil disimpan!')
      }
      setForm({ id_lahan: '', tanggal_panen: '', total_janjang: '', total_berat_kg: '', pendapatan_kotor: '', biaya_total: '', catatan: '' })
      fetchPendapatans()
    } catch {
      toast.error(editingId ? 'Gagal memperbarui data' : 'Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pendapatan: PendapatanItem) => {
    setForm({
      id_lahan: pendapatan.id_lahan,
      tanggal_panen: pendapatan.tanggal_panen,
      total_janjang: String(pendapatan.total_janjang),
      total_berat_kg: String(pendapatan.total_berat_kg),
      pendapatan_kotor: toRupiahInputRaw(pendapatan.pendapatan_kotor),
      biaya_total: toRupiahInputRaw(pendapatan.biaya_total),
      catatan: pendapatan.catatan,
    })
    setEditingId(pendapatan.id_pendapatan)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    try {
      await api.delete(`/pendapatan/${id}`)
      toast.success('Data pendapatan berhasil dihapus!')
      fetchPendapatans()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  const handleCancel = () => {
    setForm({ id_lahan: '', tanggal_panen: '', total_janjang: '', total_berat_kg: '', pendapatan_kotor: '', biaya_total: '', catatan: '' })
    setEditingId(null)
  }

  return (
    <FormPage title={editingId ? "Edit Data Pendapatan" : "Kelola Pendapatan"} subtitle="Catat data pendapatan panen">
      <div className="space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Lahan *</label>
            <select className={INP} value={form.id_lahan} onChange={set('id_lahan')} required>
              <option value="">Pilih lahan</option>
              {lahans.map(l => <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Tanggal Panen *</label>
            <input type="date" className={INP} value={form.tanggal_panen} onChange={set('tanggal_panen')} required />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Janjang</label>
            <input type="number" min="0" className={INP} value={form.total_janjang} onChange={set('total_janjang')} />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Berat (Kg) *</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.total_berat_kg} onChange={set('total_berat_kg')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LBL_CLS} style={LBL_ST}>Pendapatan Kotor *</label>
              <RupiahInput className={INP} value={form.pendapatan_kotor} onValueChange={setCurrency('pendapatan_kotor')} required />
            </div>
            <div>
              <label className={LBL_CLS} style={LBL_ST}>Biaya Total *</label>
              <RupiahInput className={INP} value={form.biaya_total} onValueChange={setCurrency('biaya_total')} required />
            </div>
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Catatan</label>
            <textarea className={INP} rows={2} value={form.catatan} onChange={set('catatan')} placeholder="Catatan tambahan" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 text-white font-bold rounded-xl transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
              {loading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel}
                className="flex-1 py-3 text-white font-bold rounded-xl bg-white/10 hover:bg-white/20 transition">
                Batal
              </button>
            )}
          </div>
        </form>

        {/* List */}
        {listing ? (
          <div className="text-center py-8 text-gray-400">Memuat data...</div>
        ) : pendapatans.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Belum ada data pendapatan</div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Daftar Pendapatan</h3>
            {pendapatans.map(pendapatan => (
              <div key={pendapatan.id_pendapatan} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/[0.08] transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">{new Date(pendapatan.tanggal_panen).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}</h4>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">{pendapatan.total_berat_kg} kg</span>
                      {pendapatan.total_janjang > 0 && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">{pendapatan.total_janjang} janjang</span>}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-gray-500">Pendapatan Kotor</p>
                        <p className="text-green-400 font-semibold">Rp {pendapatan.pendapatan_kotor.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-gray-500">Biaya Total</p>
                        <p className="text-yellow-400 font-semibold">Rp {pendapatan.biaya_total.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="bg-green-500/10 p-2 rounded border border-green-500/20 col-span-2">
                        <p className="text-green-400">Pendapatan Bersih</p>
                        <p className="text-green-400 font-bold text-base">Rp {pendapatan.pendapatan_bersih.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    {pendapatan.catatan && <p className="text-xs text-gray-400 italic mt-2">{pendapatan.catatan}</p>}
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button onClick={() => handleEdit(pendapatan)}
                      className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 text-xs font-medium transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(pendapatan.id_pendapatan)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs font-medium transition">
                      Hapus
                    </button>
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
