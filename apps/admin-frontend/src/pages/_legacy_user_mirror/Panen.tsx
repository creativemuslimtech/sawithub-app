import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import { parseRupiahInput } from '../utils/rupiah'

interface Lahan {
  id_lahan: string
  nama_kebun: string
  luas_ha: number
}

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function Panen() {
  const [loading, setLoading] = useState(false)
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [form, setForm] = useState({
    id_lahan: '', tanggal_panen: '', luas_panen_ha: '',
    jumlah_janjang: '', berat_kg: '', harga_per_kg: '', biaya_panen: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value
      if (k === 'id_lahan') {
        const selectedLahan = lahans.find(l => l.id_lahan === value)
        setForm((f) => ({
          ...f,
          id_lahan: value,
          luas_panen_ha: selectedLahan ? String(selectedLahan.luas_ha) : ''
        }))
      } else {
        setForm((f) => ({ ...f, [k]: value }))
      }
    }
  const setCurrency = (k: 'harga_per_kg' | 'biaya_panen') =>
    (value: string) =>
      setForm((f) => ({ ...f, [k]: value }))

  useEffect(() => {
    fetchLahans()
  }, [])

  const fetchLahans = async () => {
    try {
      const res = await api.get('/lahan')
      setLahans(res.data || [])
    } catch {
      toast.error('Gagal memuat data lahan')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        id_lahan: form.id_lahan,
        tanggal_panen: form.tanggal_panen,
        luas_panen_ha: parseFloat(form.luas_panen_ha),
        jumlah_janjang: parseInt(form.jumlah_janjang),
        berat_kg: parseFloat(form.berat_kg),
        harga_per_kg: parseRupiahInput(form.harga_per_kg),
        biaya_panen: parseRupiahInput(form.biaya_panen),
      }
      await api.post('/panen', data)
      toast.success('Data panen berhasil disimpan!')
      setForm({ id_lahan: '', tanggal_panen: '', luas_panen_ha: '', jumlah_janjang: '', berat_kg: '', harga_per_kg: '', biaya_panen: '' })
    } catch {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage
      title="Data Panen"
      subtitle="Catat hasil panen supaya berat, harga, dan uang masuk mudah dilihat."
      eyebrow="Catat Panen"
      accent="#4ade80"
      stats={[
        { label: 'Isi Data', value: 'Hasil Panen', hint: 'Tanggal, berat, janjang, harga, dan biaya panen.' },
        { label: 'Tujuan', value: 'Mudah Dilihat', hint: 'Sekali isi, hasilnya langsung masuk ke ringkasan kebun.' },
        { label: 'Dipakai Di', value: 'Harga & Untung', hint: 'Catatan panen dipakai untuk melihat harga jual dan hasil bersih.' },
      ]}
      insights={[
        'Isi harga per kg dan biaya panen di hari yang sama supaya hitungannya lebih pas.',
        'Kalau luas yang dipanen tidak sama dengan luas kebun, isi sesuai area yang benar-benar dikerjakan.',
        'Catat panen secara rutin supaya lebih mudah tahu bulan dengan hasil terbaik.',
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas Panen (Ha)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.luas_panen_ha} onChange={set('luas_panen_ha')} />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Janjang</label>
            <input type="number" min="0" className={INP} value={form.jumlah_janjang} onChange={set('jumlah_janjang')} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Berat (Kg) *</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.berat_kg} onChange={set('berat_kg')} required />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Harga/Kg *</label>
            <RupiahInput className={INP} value={form.harga_per_kg} onValueChange={setCurrency('harga_per_kg')} required />
          </div>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Biaya Panen</label>
          <RupiahInput className={INP} value={form.biaya_panen} onValueChange={setCurrency('biaya_panen')} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </FormPage>
  )
}
