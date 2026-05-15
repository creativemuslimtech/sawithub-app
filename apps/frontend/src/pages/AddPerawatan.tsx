import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import type { Lahan } from '../types'
import { parseRupiahInput } from '../utils/rupiah'
import { trackEvent, GAEvents } from '../utils/analytics'

const INP = 'w-full px-4 py-3 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'var(--ink-3)' }

export default function AddPerawatan() {
  const navigate = useNavigate()
  const [lahanList, setLahanList] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    id_lahan: '', tanggal_perawatan: '', jenis_perawatan: '',
    bahan: '', jumlah: '', satuan: 'kg', biaya: '', keterangan: '',
  })
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  const setCurrency = (value: string) =>
    setForm((f) => ({ ...f, biaya: value }))

  useEffect(() => { api.get('/CorePlotService').then((r) => setLahanList(r.data)) }, [])

  const resetForm = (keepLahan = true) => setForm((current) => ({
    id_lahan: keepLahan ? current.id_lahan : '',
    tanggal_perawatan: '',
    jenis_perawatan: '',
    bahan: '',
    jumlah: '',
    satuan: 'kg',
    biaya: '',
    keterangan: '',
  }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === 'add-another'
    setLoading(true)
    try {
      await api.post('/CoreMaintenanceService', {
        ...form,
        id_lahan: parseInt(form.id_lahan),
        jumlah: parseFloat(form.jumlah) || 0,
        biaya: parseRupiahInput(form.biaya),
      })

      // Track maintenance activity (feature usage)
      trackEvent(GAEvents.ADD_PERAWATAN, {
        feature_name: 'perawatan',
        action_type: 'add',
        jenis_perawatan: form.jenis_perawatan,
        biaya: parseRupiahInput(form.biaya),
      })

      toast.success(addAnother ? 'Data perawatan tersimpan. Silakan catat pekerjaan berikutnya.' : 'Data perawatan berhasil disimpan!')
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

  return (
    <FormPage title="Catat Kerja Perawatan" subtitle="Catat tanggal kerja, bahan, jumlah, satuan, dan biaya pekerja.">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Tanggal *</label>
            <input type="date" className={INP} value={form.tanggal_perawatan} onChange={set('tanggal_perawatan')} required />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jenis Perawatan *</label>
            <select className={INP} value={form.jenis_perawatan} onChange={set('jenis_perawatan')} required>
              <option value="">-- Pilih --</option>
              <option value="pupuk">Pemupukan</option>
              <option value="tebas_rumput">Tebas Rumput</option>
              <option value="semprot_rumput">Semprot Rumput</option>
              <option value="pruning">Pruning</option>
            </select>
          </div>
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Bahan / Material</label>
          <input className={INP} value={form.bahan} onChange={set('bahan')} placeholder="Contoh: NPK 12-12-17, dolomit, herbisida" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.jumlah} onChange={set('jumlah')} placeholder="Contoh: 50" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Satuan</label>
            <select className={INP} value={form.satuan} onChange={set('satuan')}>
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="gram">gram</option>
              <option value="unit">unit</option>
            </select>
          </div>
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Biaya (Rp)</label>
          <RupiahInput className={INP} value={form.biaya} onValueChange={setCurrency} placeholder="Contoh: 250.000" />
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Keterangan</label>
          <textarea className={INP} rows={3} value={form.keterangan} onChange={set('keterangan')} placeholder="Contoh: Blok barat selesai, ulangi bulan depan" />
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button type="submit" value="dashboard" disabled={loading}
            className="app-submit-button app-submit-button--emerald"
            onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
            {loading ? 'Menyimpan...' : 'Simpan Data Perawatan'}
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
