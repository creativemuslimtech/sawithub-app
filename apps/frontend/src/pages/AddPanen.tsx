import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import SubscriptionGateSheet from '../components/SubscriptionGateSheet'
import { getSubscriptionGateMessage, isSubscriptionRequiredError } from '../utils/apiError'
import type { Lahan } from '../types'
import { parseRupiahInput } from '../utils/rupiah'
import { trackEvent, GAEvents } from '../utils/analytics'

const INP = 'w-full px-4 py-3 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'var(--ink-3)' }

export default function AddPanen() {
  const navigate = useNavigate()
  const [subscriptionGate, setSubscriptionGate] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })
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

  useEffect(() => { api.get('/CorePlotService').then((r) => setLahanList(r.data)) }, [])

  const resetForm = (keepLahan = true) => setForm((current) => ({
    id_lahan: keepLahan ? current.id_lahan : '',
    tanggal_panen: '',
    luas_panen_ha: keepLahan ? current.luas_panen_ha : '',
    jumlah_janjang: '',
    berat_kg: '',
    harga_per_kg: '',
    biaya_panen: '',
  }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === 'add-another'
    setLoading(true)
    try {
      await api.post('/CoreHarvestService', {
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
      trackEvent(GAEvents.FIRST_PANEN_CREATED, {
        funnel_step: 'first_panen',
        feature_name: 'panen',
        berat_kg: parseFloat(form.berat_kg) || 0,
        estimasi_pendapatan: beratKg * hargaPerKg,
      })

      toast.success(addAnother ? 'Data panen tersimpan. Silakan catat panen berikutnya.' : 'Data panen berhasil disimpan!')
      if (addAnother) {
        resetForm(true)
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      if (isSubscriptionRequiredError(err)) {
        setSubscriptionGate({
          open: true,
          message: getSubscriptionGateMessage(err, 'Pencatatan panen dibatasi oleh paket atau trial.'),
        })
        return
      }
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
    <FormPage
      title="Catat Panen TBS"
      subtitle="Isi tanggal panen, berat, harga, dan biaya dari hasil timbang."
      backTo="/panen"
      backLabel="Kembali ke daftar panen"
    >
      <SubscriptionGateSheet
        open={subscriptionGate.open}
        onClose={() => setSubscriptionGate((s) => ({ ...s, open: false }))}
        message={subscriptionGate.message}
        surface="add_panen"
      />
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Tanggal Panen *</label>
            <input type="date" className={INP} value={form.tanggal_panen} onChange={set('tanggal_panen')} required />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas Panen (Ha)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.luas_panen_ha} onChange={set('luas_panen_ha')} placeholder="Contoh: 2.50"
              title="Otomatis dari data lahan, bisa diubah manual" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Janjang</label>
            <input type="number" min="0" className={INP} value={form.jumlah_janjang} onChange={set('jumlah_janjang')} placeholder="Contoh: 850" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Berat (kg)</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.berat_kg} onChange={set('berat_kg')} placeholder="Contoh: 1800" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Harga / Kg (Rp)</label>
            <RupiahInput className={INP} value={form.harga_per_kg} onValueChange={setCurrency('harga_per_kg')} placeholder="Contoh: 2.450" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Biaya Panen (Rp)</label>
            <RupiahInput className={INP} value={form.biaya_panen} onValueChange={setCurrency('biaya_panen')} placeholder="Contoh: 150.000" />
          </div>
        </div>

        {/* Auto-calc preview */}
        {form.berat_kg && form.harga_per_kg && (
          <div className="rounded-xl px-4 py-3 text-sm border border-emerald-soft bg-emerald-tint">
            <div className="flex justify-between text-ink-3 mb-1">
              <span>Estimasi pendapatan</span>
              <span className="text-ink font-semibold">
                Rp {estimasiPendapatan.toLocaleString('id-ID')}
              </span>
            </div>
            {form.biaya_panen && (
              <div className="flex justify-between text-ink-3">
                <span>Estimasi bersih</span>
                <span className="font-semibold text-emerald">
                  Rp {estimasiBersih.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button type="submit" value="dashboard" disabled={loading}
            className="app-submit-button app-submit-button--emerald"
            onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
            {loading ? 'Menyimpan...' : 'Simpan Data Panen'}
          </button>
          <button type="submit" value="add-another" disabled={loading}
            className="w-full rounded-xl border border-line bg-paper-2 py-3 font-bold text-ink-3 transition hover:bg-line disabled:opacity-50">
            Simpan & Tambah Panen Lagi
          </button>
        </div>
      </form>
    </FormPage>
  )
}
