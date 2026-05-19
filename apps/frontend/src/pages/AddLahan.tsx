import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import SubscriptionGateSheet from '../components/SubscriptionGateSheet'
import { getSubscriptionGateMessage, isSubscriptionRequiredError } from '../utils/apiError'
import { trackEvent, GAEvents } from '../utils/analytics'
import { lahanSchema, type LahanInput } from '../schemas/lahan'

const INP = 'w-full px-4 py-3 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-forest transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'var(--ink-3)' }
const ERR_CLS = 'mt-1 text-xs text-red-400'

export default function AddLahan() {
  const navigate = useNavigate()
  const [subscriptionGate, setSubscriptionGate] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LahanInput>({
    resolver: zodResolver(lahanSchema),
  })

  const onSubmit = async (data: LahanInput, addAnother: boolean) => {
    try {
      await api.post('/CorePlotService', {
        ...data,
        luas_ha: parseFloat(data.luas_ha),
        jumlah_pohon: parseInt(data.jumlah_pohon),
        tahun_tanam: parseInt(data.tahun_tanam),
      })

      // Track user activation - adding first lahan (CRITICAL CONVERSION)
      trackEvent(GAEvents.ADD_LAHAN, {
        feature_name: 'lahan',
        action_type: 'add',
        luas_ha: parseFloat(data.luas_ha),
        jumlah_pohon: parseInt(data.jumlah_pohon),
      })
      trackEvent(GAEvents.FIRST_LAHAN_CREATED, {
        funnel_step: 'first_lahan',
        feature_name: 'lahan',
        luas_ha: parseFloat(data.luas_ha),
        jumlah_pohon: parseInt(data.jumlah_pohon),
      })

      toast.success(addAnother ? 'Data lahan tersimpan. Silakan tambah kebun berikutnya.' : 'Data lahan berhasil disimpan!')
      if (addAnother) {
        reset()
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
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === 'add-another'
    handleSubmit((data) => onSubmit(data, addAnother))(e)
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
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Nama Kebun *</label>
          <input className={INP} {...register('nama_kebun')} placeholder="cth: Kebun Utama" />
          {errors.nama_kebun && <p className={ERR_CLS}>{errors.nama_kebun.message}</p>}
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Jenis Bibit *</label>
          <input className={INP} {...register('jenis_bibit')} placeholder="cth: DxP, Tenera, Simalungun" />
          {errors.jenis_bibit && <p className={ERR_CLS}>{errors.jenis_bibit.message}</p>}
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Lokasi *</label>
          <textarea className={INP} rows={3} {...register('lokasi')} placeholder="Contoh: Desa Suka Maju, Riau atau koordinat kebun" />
          {errors.lokasi && <p className={ERR_CLS}>{errors.lokasi.message}</p>}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Luas (Ha) *</label>
            <input type="number" step="0.01" min="0" className={INP} {...register('luas_ha')} placeholder="Contoh: 2.50" />
            {errors.luas_ha && <p className={ERR_CLS}>{errors.luas_ha.message}</p>}
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah Pohon *</label>
            <input type="number" min="0" className={INP} {...register('jumlah_pohon')} placeholder="Contoh: 340" />
            {errors.jumlah_pohon && <p className={ERR_CLS}>{errors.jumlah_pohon.message}</p>}
          </div>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Tahun Tanam *</label>
          <input type="number" min="1900" max={new Date().getFullYear()} className={INP} {...register('tahun_tanam')} placeholder={String(new Date().getFullYear())} />
          {errors.tahun_tanam && <p className={ERR_CLS}>{errors.tahun_tanam.message}</p>}
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button type="submit" value="dashboard" disabled={isSubmitting}
            className="app-submit-button app-submit-button--emerald"
            onMouseOver={e => !isSubmitting && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={e => (e.currentTarget.style.filter = 'brightness(1)')}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data Lahan'}
          </button>
          <button type="submit" value="add-another" disabled={isSubmitting}
            className="w-full rounded-xl border border-line bg-paper-2 py-3 font-bold text-ink-3 transition hover:bg-line disabled:opacity-50">
            Simpan & Tambah Lagi
          </button>
        </div>
      </form>
    </FormPage>
  )
}
