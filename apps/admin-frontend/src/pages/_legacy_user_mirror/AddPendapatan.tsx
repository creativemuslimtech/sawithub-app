import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import type { Lahan } from '../types'
import { parseRupiahInput } from '../utils/rupiah'

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function AddPendapatan() {
  const navigate = useNavigate()
  const [lahanList, setLahanList] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => { api.get('/lahan').then((r) => setLahanList(r.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/pendapatan', {
        id_lahan: parseInt(form.id_lahan),
        tanggal_panen: form.tanggal_panen,
        total_janjang: parseInt(form.total_janjang) || 0,
        total_berat_kg: parseFloat(form.total_berat_kg) || 0,
        pendapatan_kotor: parseRupiahInput(form.pendapatan_kotor),
        biaya_total: parseRupiahInput(form.biaya_total),
        catatan: form.catatan,
      })
      toast.success('Data pendapatan berhasil disimpan!')
      navigate('/dashboard')
    } catch {
      toast.error('Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  const pendapatanKotor = parseRupiahInput(form.pendapatan_kotor)
  const biayaTotal = parseRupiahInput(form.biaya_total)
  const bersih = pendapatanKotor - biayaTotal

  return (
    <FormPage title="Catat Pendapatan" subtitle="Rekap pendapatan dan biaya kebun">
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
          <label className={LBL_CLS} style={LBL_ST}>Tanggal Panen *</label>
          <input type="date" className={INP} value={form.tanggal_panen} onChange={set('tanggal_panen')} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Janjang</label>
            <input type="number" min="0" className={INP} value={form.total_janjang} onChange={set('total_janjang')} placeholder="0" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Berat (kg)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.total_berat_kg} onChange={set('total_berat_kg')} placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Pendapatan Kotor (Rp)</label>
            <RupiahInput className={INP} value={form.pendapatan_kotor} onValueChange={setCurrency('pendapatan_kotor')} placeholder="0" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Biaya (Rp)</label>
            <RupiahInput className={INP} value={form.biaya_total} onValueChange={setCurrency('biaya_total')} placeholder="0" />
          </div>
        </div>

        {/* Net preview */}
        {(form.pendapatan_kotor || form.biaya_total) && (
          <div className="rounded-xl px-4 py-3" style={{
            background: bersih >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${bersih >= 0 ? 'rgba(22,163,74,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Pendapatan Bersih</span>
              <span className="font-bold" style={{ color: bersih >= 0 ? '#4ade80' : '#f87171' }}>
                Rp {bersih.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Catatan</label>
          <textarea className={INP} rows={3} value={form.catatan} onChange={set('catatan')} placeholder="Catatan tambahan..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
          onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
          onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
          {loading ? 'Menyimpan...' : 'Simpan Data Pendapatan'}
        </button>
      </form>
    </FormPage>
  )
}
