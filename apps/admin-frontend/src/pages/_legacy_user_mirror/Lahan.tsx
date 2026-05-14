import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function Lahan() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama_kebun: '', jenis_bibit: '', lokasi: '',
    luas_ha: '', jumlah_pohon: '', tahun_tanam: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        nama_kebun: form.nama_kebun,
        jenis_bibit: form.jenis_bibit,
        lokasi: form.lokasi,
        luas_ha: parseFloat(form.luas_ha),
        jumlah_pohon: parseInt(form.jumlah_pohon),
        tahun_tanam: parseInt(form.tahun_tanam),
      }
      await api.post('/lahan', data)
      toast.success('Data lahan berhasil disimpan!')
      setForm({ nama_kebun: '', jenis_bibit: '', lokasi: '', luas_ha: '', jumlah_pohon: '', tahun_tanam: '' })
    } catch {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage
      title="Data Lahan"
      subtitle="Isi data kebun seperti nama, lokasi, luas, jumlah pohon, dan tahun tanam."
      eyebrow="Data Kebun"
      accent="#38bdf8"
      stats={[
        { label: 'Isi Data', value: 'Data Kebun', hint: 'Nama kebun, lokasi, luas, jumlah pohon, dan tahun tanam.' },
        { label: 'Tujuan', value: 'Lebih Jelas', hint: 'Data lahan yang rapi membuat hasil kebun lebih mudah dibaca.' },
        { label: 'Dipakai Di', value: 'Ringkasan', hint: 'Dipakai untuk pilih kebun di ringkasan dan laporan.' },
      ]}
      insights={[
        'Mulai dari kebun yang paling sering dikerjakan lebih dulu.',
        'Isi lokasi dan luas dengan benar supaya hasil per hektare tidak meleset.',
        'Kalau satu area beda kondisi, pisahkan jadi kebun lain agar catatannya tidak campur.',
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Nama Kebun *</label>
          <input className={INP} value={form.nama_kebun} onChange={set('nama_kebun')} required placeholder="cth: Kebun Utama" />
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Jenis Bibit *</label>
          <input className={INP} value={form.jenis_bibit} onChange={set('jenis_bibit')} required placeholder="cth: DxP, Tenera" />
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Lokasi *</label>
          <textarea className={INP} rows={3} value={form.lokasi} onChange={set('lokasi')} required placeholder="Alamat atau koordinat" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas (Ha) *</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.luas_ha} onChange={set('luas_ha')} required />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Pohon *</label>
            <input type="number" min="0" className={INP} value={form.jumlah_pohon} onChange={set('jumlah_pohon')} required />
          </div>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Tahun Tanam *</label>
          <input type="number" min="1900" max={new Date().getFullYear()} className={INP} value={form.tahun_tanam} onChange={set('tahun_tanam')} required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #0891b2)' }}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </FormPage>
  )
}
