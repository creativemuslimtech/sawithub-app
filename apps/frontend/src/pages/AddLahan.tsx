import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import SubscriptionGateSheet from '../components/SubscriptionGateSheet'
import { getSubscriptionGateMessage, isSubscriptionRequiredError } from '../utils/apiError'
import { trackEvent, GAEvents } from '../utils/analytics'

const INP = 'w-full px-4 py-3 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'var(--ink-3)' }

export default function AddLahan() {
  const navigate = useNavigate()
  const [subscriptionGate, setSubscriptionGate] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama_kebun: '', jenis_bibit: '', lokasi: '',
    luas_ha: '', jumlah_pohon: '', tahun_tanam: '',
  })
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const resetForm = () => setForm({
    nama_kebun: '', jenis_bibit: '', lokasi: '',
    luas_ha: '', jumlah_pohon: '', tahun_tanam: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === 'add-another'
    setLoading(true)
    try {
      await api.post('/CorePlotService', {
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
      trackEvent(GAEvents.FIRST_LAHAN_CREATED, {
        funnel_step: 'first_lahan',
        feature_name: 'lahan',
        luas_ha: parseFloat(form.luas_ha),
        jumlah_pohon: parseInt(form.jumlah_pohon),
      })

      toast.success(addAnother ? 'Data lahan tersimpan. Silakan tambah kebun berikutnya.' : 'Data lahan berhasil disimpan!')
      if (addAnother) {
        resetForm()
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      if (isSubscriptionRequiredError(err)) {
        setSubscriptionGate({
          open: true,
          message: getSubscriptionGateMessage(err, 'Penambahan kebun dibatasi oleh paket atau pembayaran.'),
        })
        return
      }
      toast.error('Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPage
      title="Tambah Kebun"
      subtitle="Isi data kebun seperti nama, lokasi, luas, jumlah pohon, dan tahun tanam."
      backTo="/lahan"
      backLabel="Kembali ke daftar lahan"
    >
      <SubscriptionGateSheet
        open={subscriptionGate.open}
        onClose={() => setSubscriptionGate((s) => ({ ...s, open: false }))}
        message={subscriptionGate.message}
        surface="add_lahan"
      />
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
          <textarea className={INP} rows={3} value={form.lokasi} onChange={set('lokasi')} required placeholder="Contoh: Desa Suka Maju, Riau atau koordinat kebun" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas (Ha) *</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.luas_ha} onChange={set('luas_ha')} required placeholder="Contoh: 2.50" />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Pohon *</label>
            <input type="number" min="0" className={INP} value={form.jumlah_pohon} onChange={set('jumlah_pohon')} required placeholder="Contoh: 340" />
          </div>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Tahun Tanam *</label>
          <input type="number" min="1900" max={new Date().getFullYear()} className={INP} value={form.tahun_tanam} onChange={set('tahun_tanam')} required placeholder={String(new Date().getFullYear())} />
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button type="submit" value="dashboard" disabled={loading}
            className="app-submit-button app-submit-button--emerald"
            onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
            {loading ? 'Menyimpan...' : 'Simpan Data Lahan'}
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
