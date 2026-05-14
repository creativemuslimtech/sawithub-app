import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import type { Lahan } from '../types'
import { parseRupiahInput } from '../utils/rupiah'
import { trackEvent, GAEvents } from '../utils/analytics'

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

export default function AddPanen() {
  const navigate = useNavigate()
  const [lahanList, setLahanList] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    id_lahan: '', tanggal_panen: '', luas_panen_ha: '',
    jumlah_janjang: '', berat_kg: '', harga_per_kg: '', biaya_panen: '',
  })
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  const setCurrency = (k: 'harga_per_kg' | 'biaya_panen') =>
    (value: string) =>
      setForm((f) => ({ ...f, [k]: value }))

  const handleLahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    const lahan = lahanList.find(l => String(l.id_lahan) === id)
    setForm(f => ({ ...f, id_lahan: id, luas_panen_ha: lahan ? String(lahan.luas_ha) : f.luas_panen_ha }))
  }

  useEffect(() => { api.get('/lahan').then((r) => setLahanList(r.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/panen', {
        id_lahan: parseInt(form.id_lahan),
        tanggal_panen: form.tanggal_panen,
        luas_panen_ha: parseFloat(form.luas_panen_ha) || 0,
        jumlah_janjang: parseInt(form.jumlah_janjang) || 0,
        berat_kg: parseFloat(form.berat_kg) || 0,
        harga_per_kg: parseRupiahInput(form.harga_per_kg),
        biaya_panen: parseRupiahInput(form.biaya_panen),
      })

      // Track harvest recording (core feature usage)
      trackEvent(GAEvents.ADD_PANEN, {
        feature_name: 'panen',
        action_type: 'add',
        berat_kg: parseFloat(form.berat_kg) || 0,
        estimasi_pendapatan: beratKg * hargaPerKg,
      })

      toast.success('Data panen berhasil disimpan!')
      navigate('/dashboard')
    } catch {
      toast.error('Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  const beratKg = parseFloat(form.berat_kg) || 0
  const hargaPerKg = parseRupiahInput(form.harga_per_kg)
  const biayaPanen = parseRupiahInput(form.biaya_panen)
  const estimasiPendapatan = beratKg * hargaPerKg
  const estimasiBersih = estimasiPendapatan - biayaPanen

  return (
    <FormPage title="Catat Hasil Panen" subtitle="Input data panen TBS harian">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Pilih Lahan *</label>
          <select className={INP} value={form.id_lahan} onChange={handleLahanChange} required>
            <option value="">-- Pilih Lahan --</option>
            {lahanList.map((l) => (
              <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun} ({l.jenis_bibit})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Tanggal Panen *</label>
            <input type="date" className={INP} value={form.tanggal_panen} onChange={set('tanggal_panen')} required />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas Panen (Ha)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.luas_panen_ha} onChange={set('luas_panen_ha')} placeholder="0.00"
              title="Otomatis dari data lahan, bisa diubah manual" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Janjang</label>
            <input type="number" min="0" className={INP} value={form.jumlah_janjang} onChange={set('jumlah_janjang')} placeholder="0" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Berat (kg)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.berat_kg} onChange={set('berat_kg')} placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Harga / Kg (Rp)</label>
            <RupiahInput className={INP} value={form.harga_per_kg} onValueChange={setCurrency('harga_per_kg')} placeholder="0" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Biaya Panen (Rp)</label>
            <RupiahInput className={INP} value={form.biaya_panen} onValueChange={setCurrency('biaya_panen')} placeholder="0" />
          </div>
        </div>

        {/* Auto-calc preview */}
        {form.berat_kg && form.harga_per_kg && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <div className="flex justify-between text-white/60 mb-1">
              <span>Estimasi pendapatan</span>
              <span className="text-white font-semibold">
                Rp {estimasiPendapatan.toLocaleString('id-ID')}
              </span>
            </div>
            {form.biaya_panen && (
              <div className="flex justify-between text-white/60">
                <span>Estimasi bersih</span>
                <span className="font-semibold" style={{ color: '#4ade80' }}>
                  Rp {estimasiBersih.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
          onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
          onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
          {loading ? 'Menyimpan...' : 'Simpan Data Panen'}
        </button>
      </form>
    </FormPage>
  )
}
