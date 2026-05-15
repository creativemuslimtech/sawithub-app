import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import RupiahInput from '../components/RupiahInput'
import { parseRupiahInput } from '../utils/rupiah'

interface Lahan {
  id_lahan: string
  nama_kebun: string
}

const INP = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/[0.07] transition'
const LBL_CLS = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

const FREQUENSI_OPTIONS = [
  { value: 'mingguan', label: '1 Minggu Sekali' },
  { value: 'dua_mingguan', label: '2 Minggu Sekali' },
  { value: 'bulanan', label: '1 Bulan Sekali' },
  { value: 'dua_bulanan', label: '2 Bulan Sekali' },
  { value: 'tiga_bulanan', label: '3 Bulan Sekali' },
  { value: 'empat_bulanan', label: '4 Bulan Sekali' },
  { value: 'enam_bulanan', label: '6 Bulan Sekali' },
  { value: 'tahunan', label: '1 Tahun Sekali' },
  { value: 'custom', label: 'Atur sendiri (isi hari)' },
]

function normalizeFrequencyType(frequensiTipe: string) {
  switch (frequensiTipe) {
    case 'dua_kali_tahunan':
      return 'enam_bulanan'
    case 'tiga_kali_tahunan':
      return 'tiga_bulanan'
    default:
      return frequensiTipe
  }
}

function normalizeDateOnly(date: Date) {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

function nextDateByDays(start: Date, intervalDays: number, fromDate: Date) {
  let next = normalizeDateOnly(start)
  const reference = normalizeDateOnly(fromDate)
  while (next <= reference) {
    next = new Date(next)
    next.setDate(next.getDate() + intervalDays)
  }
  return next
}

function nextDateByMonths(start: Date, intervalMonths: number, fromDate: Date) {
  let next = normalizeDateOnly(start)
  const reference = normalizeDateOnly(fromDate)
  while (next <= reference) {
    const candidate = new Date(next)
    candidate.setMonth(candidate.getMonth() + intervalMonths)
    next = candidate
  }
  return next
}

function getNextScheduleDate(tanggal_mulai: string, frequensi_tipe: string, custom_hari: number): string {
  if (!tanggal_mulai) return ''
  const start = new Date(tanggal_mulai)
  if (isNaN(start.getTime())) return ''

  const today = new Date()
  const normalizedFrequency = normalizeFrequencyType(frequensi_tipe)
  let next: Date

  switch (normalizedFrequency) {
    case 'mingguan':
      next = nextDateByDays(start, 7, today)
      break
    case 'dua_mingguan':
      next = nextDateByDays(start, 14, today)
      break
    case 'bulanan':
      next = nextDateByMonths(start, 1, today)
      break
    case 'dua_bulanan':
      next = nextDateByMonths(start, 2, today)
      break
    case 'tiga_bulanan':
      next = nextDateByMonths(start, 3, today)
      break
    case 'empat_bulanan':
      next = nextDateByMonths(start, 4, today)
      break
    case 'enam_bulanan':
      next = nextDateByMonths(start, 6, today)
      break
    case 'tahunan':
      next = nextDateByMonths(start, 12, today)
      break
    case 'custom':
      if (custom_hari <= 0) return ''
      next = nextDateByDays(start, custom_hari, today)
      break
    default:
      return ''
  }

  return next.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function JadwalPerawatan() {
  const [loading, setLoading] = useState(false)
  const [lahans, setLahans] = useState<Lahan[]>([])

  const [form, setForm] = useState({
    id_lahan: '',
    jenis_perawatan: '',
    deskripsi: '',
    frequensi_tipe: 'bulanan',
    frequensi_custom_hari: '',
    tanggal_mulai: '',
    estimasi_biaya: '',
    catatan: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  const setEstimasiBiaya = (value: string) =>
    setForm((f) => ({ ...f, estimasi_biaya: value }))

  const fetchLahans = async () => {
    try {
      const res = await api.get('/lahan')
      setLahans(res.data || [])
    } catch {
      toast.error('Gagal memuat data lahan')
    }
  }

  useEffect(() => {
    fetchLahans()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        id_lahan: form.id_lahan,
        jenis_perawatan: form.jenis_perawatan,
        deskripsi: form.deskripsi,
        frequensi_tipe: form.frequensi_tipe,
        frequensi_custom_hari: form.frequensi_tipe === 'custom' ? parseInt(form.frequensi_custom_hari) || 0 : 0,
        tanggal_mulai: form.tanggal_mulai,
        estimasi_biaya: parseRupiahInput(form.estimasi_biaya),
        catatan: form.catatan,
      }
      await api.post('/jadwal-perawatan', data)
      toast.success('Jadwal perawatan berhasil dibuat!')
      resetForm()
    } catch {
      toast.error('Gagal menyimpan jadwal')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      id_lahan: '',
      jenis_perawatan: '',
      deskripsi: '',
      frequensi_tipe: 'bulanan',
      frequensi_custom_hari: '',
      tanggal_mulai: '',
      estimasi_biaya: '',
      catatan: '',
    })
  }

  const nextSchedule = getNextScheduleDate(
    form.tanggal_mulai,
    form.frequensi_tipe,
    parseInt(form.frequensi_custom_hari) || 0,
  )

  return (
    <FormPage
      title="Jadwal Perawatan"
      subtitle="Atur jadwal kerja kebun supaya pekerjaan rutin tidak terlewat."
      eyebrow="Jadwal Kerja"
      accent="#f59e0b"
      stats={[
        { label: 'Isi Data', value: 'Jadwal Kerja', hint: 'Jenis kerja, jarak jadwal, tanggal mulai, dan perkiraan biaya.' },
        { label: 'Tujuan', value: 'Tidak Terlewat', hint: 'Membantu pekerjaan rutin tetap jalan tepat waktu.' },
        { label: 'Dipakai Di', value: 'Ringkasan', hint: 'Jadwal yang dekat akan muncul di ringkasan kebun.' },
      ]}
      insights={[
        'Pilih jarak jadwal yang sesuai dengan keadaan kebun.',
        'Perkiraan biaya membantu melihat beban kerja ke depan.',
        'Tanggal berikutnya dihitung otomatis dari tanggal mulai dan jarak jadwal.',
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Lahan *</label>
            <select className={INP} value={form.id_lahan} onChange={set('id_lahan')} required>
              <option value="">Pilih lahan</option>
              {lahans.map(l => <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jenis Perawatan *</label>
            <input className={INP} value={form.jenis_perawatan} onChange={set('jenis_perawatan')} required placeholder="cth: Pemupukan, Penyemprotan" />
          </div>
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Deskripsi</label>
          <textarea className={INP} rows={2} value={form.deskripsi} onChange={set('deskripsi')} placeholder="Jelaskan singkat pekerjaan yang akan dilakukan" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Frekuensi *</label>
            <select className={INP} value={form.frequensi_tipe} onChange={set('frequensi_tipe')} required>
              {FREQUENSI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {form.frequensi_tipe === 'custom' && (
            <div>
              <label className={LBL_CLS} style={LBL_ST}>Jumlah Hari *</label>
              <input type="number" min="1" className={INP} value={form.frequensi_custom_hari} onChange={set('frequensi_custom_hari')} placeholder="Berapa hari sekali?" />
            </div>
          )}
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Tanggal Mulai *</label>
          <input type="date" className={INP} value={form.tanggal_mulai} onChange={set('tanggal_mulai')} required />
        </div>

        {nextSchedule && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: 'rgba(251,191,36,0.65)' }}>Jadwal Selanjutnya</p>
            <p className="text-sm font-semibold text-white">{nextSchedule}</p>
          </div>
        )}

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Estimasi Biaya</label>
          <RupiahInput className={INP} value={form.estimasi_biaya} onValueChange={setEstimasiBiaya} placeholder="0" />
        </div>

        <div>
          <label className={LBL_CLS} style={LBL_ST}>Catatan</label>
          <textarea className={INP} rows={2} value={form.catatan} onChange={set('catatan')} placeholder="Catatan tambahan" />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #a78bfa, #9333ea)' }}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </FormPage>
  )
}
