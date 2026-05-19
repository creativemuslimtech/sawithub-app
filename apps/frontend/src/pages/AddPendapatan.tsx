import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import type { Lahan } from '../types'
import { parseRupiahInput } from '../utils/rupiah'

const INP = 'w-full px-4 py-3 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-forest transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'var(--ink-3)' }

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

  useEffect(() => { api.get('/CorePlotService').then((r) => setLahanList(r.data)) }, [])

  const resetForm = (keepLahan = true) => setForm((current) => ({
    id_lahan: keepLahan ? current.id_lahan : '',
    tanggal_panen: '',
    total_janjang: '',
    total_berat_kg: '',
    pendapatan_kotor: '',
    biaya_total: '',
    catatan: '',
  }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === 'add-another'
    setLoading(true)
    try {
      await api.post('/FinanceIncomeService', {
        id_lahan: parseInt(form.id_lahan),
        tanggal_panen: form.tanggal_panen,
        total_janjang: parseInt(form.total_janjang) || 0,
        total_berat_kg: parseFloat(form.total_berat_kg) || 0,
        pendapatan_kotor: parseRupiahInput(form.pendapatan_kotor),
        biaya_total: parseRupiahInput(form.biaya_total),
        catatan: form.catatan,
      })
      toast.success(addAnother ? 'Data pendapatan tersimpan. Silakan catat uang masuk berikutnya.' : 'Data pendapatan berhasil disimpan!')
      if (addAnother) {
        resetForm(true)
      } else {
        navigate('/dashboard')
      }
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
    <FormPage title="Catat Uang Masuk" subtitle="Isi hasil timbang, uang masuk, dan biaya agar hasil bersih terlihat.">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Janjang</label>
            <input type="number" min="0" className={INP} value={form.total_janjang} onChange={set('total_janjang')} placeholder="Contoh: 850" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Berat (kg)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.total_berat_kg} onChange={set('total_berat_kg')} placeholder="Contoh: 1800" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Pendapatan Kotor (Rp)</label>
            <RupiahInput className={INP} value={form.pendapatan_kotor} onValueChange={setCurrency('pendapatan_kotor')} placeholder="Contoh: 4.410.000" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Total Biaya (Rp)</label>
            <RupiahInput className={INP} value={form.biaya_total} onValueChange={setCurrency('biaya_total')} placeholder="Contoh: 250.000" />
          </div>
        </div>

        {/* Net preview */}
        {(form.pendapatan_kotor || form.biaya_total) && (
          <div className={`rounded-xl px-4 py-3 ${bersih >= 0 ? 'border border-forest-soft bg-forest-tint' : 'border border-terra-soft bg-terra-soft'}`}>
            <div className="flex justify-between text-sm">
              <span className="text-ink-3">Pendapatan Bersih</span>
              <span className={`font-bold ${bersih >= 0 ? 'text-forest' : 'text-terracotta-2'}`}>
                Rp {bersih.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Catatan</label>
          <textarea className={INP} rows={3} value={form.catatan} onChange={set('catatan')} placeholder="Contoh: Harga dari pabrik/koperasi, pembayaran tunai" />
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button type="submit" value="dashboard" disabled={loading}
            className="app-submit-button app-submit-button--emerald"
            onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
            {loading ? 'Menyimpan...' : 'Simpan Data Pendapatan'}
          </button>
          <button type="submit" value="add-another" disabled={loading}
            className="w-full rounded-xl border border-line bg-paper-2 py-3 font-bold text-ink-3 transition hover:bg-line disabled:opacity-50">
            Simpan & Tambah Lagi
          </button>
        </div>
      </form>
    </FormPage>
  )
}
