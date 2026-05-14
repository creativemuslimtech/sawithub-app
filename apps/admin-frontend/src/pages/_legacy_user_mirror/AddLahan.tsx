import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import { trackEvent, GAEvents } from '../utils/analytics'

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function AddLahan() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama_kebun: '', jenis_bibit: '', lokasi: '',
    luas_ha: '', jumlah_pohon: '', tahun_tanam: '',
  })
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/lahan', {
        ...form,
        luas_ha: parseFloat(form.luas_ha),
        jumlah_pohon: parseInt(form.jumlah_pohon),
        tahun_tanam: parseInt(form.tahun_tanam),
      })

      // Track user activation - adding first lahan (CRITICAL CONVERSION)
      trackEvent(GAEvents.ADD_LAHAN, {
        feature_name: 'lahan',
        action_type: 'add',
        luas_ha: parseFloat(form.luas_ha),
        jumlah_pohon: parseInt(form.jumlah_pohon),
      })

      toast.success('Data lahan berhasil disimpan!')
      navigate('/dashboard')
    } catch {
      toast.error('Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage title="Tambah Data Lahan" subtitle="Daftarkan kebun sawit baru Anda">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Nama Kebun *</label>
          <input className={INP} value={form.nama_kebun} onChange={set('nama_kebun')} required placeholder="cth: Kebun Utama" />
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Jenis Bibit *</label>
          <input className={INP} value={form.jenis_bibit} onChange={set('jenis_bibit')} required placeholder="cth: DxP, Tenera, Simalungun" />
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Lokasi *</label>
          <textarea className={INP} rows={3} value={form.lokasi} onChange={set('lokasi')} required placeholder="Alamat atau koordinat kebun" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas (Ha) *</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.luas_ha} onChange={set('luas_ha')} required placeholder="0.00" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Pohon *</label>
            <input type="number" min="0" className={INP} value={form.jumlah_pohon} onChange={set('jumlah_pohon')} required placeholder="0" />
          </div>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Tahun Tanam *</label>
          <input type="number" min="1900" max={new Date().getFullYear()} className={INP} value={form.tahun_tanam} onChange={set('tahun_tanam')} required placeholder={String(new Date().getFullYear())} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
          onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
          onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
          {loading ? 'Menyimpan...' : 'Simpan Data Lahan'}
        </button>
      </form>
    </FormPage>
  )
}
