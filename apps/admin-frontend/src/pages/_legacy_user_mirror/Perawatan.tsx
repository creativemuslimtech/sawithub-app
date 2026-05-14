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

export default function Perawatan() {
  const [loading, setLoading] = useState(false)
  const [lahans, setLahans] = useState<Lahan[]>([])

  const [form, setForm] = useState({
    id_lahan: '', tanggal_perawatan: '', jenis_perawatan: '',
    bahan: '', jumlah: '', satuan: 'kg', harga_satuan: '', biaya_pekerja: '', keterangan: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  const setCurrency = (k: 'harga_satuan' | 'biaya_pekerja') =>
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
      const jumlah = parseFloat(form.jumlah) || 0
      const hargaSatuan = parseRupiahInput(form.harga_satuan)
      const biayaPekerja = parseRupiahInput(form.biaya_pekerja)

      const data = {
        id_lahan: form.id_lahan,
        tanggal_perawatan: form.tanggal_perawatan,
        jenis_perawatan: form.jenis_perawatan,
        bahan: form.bahan,
        jumlah: jumlah,
        satuan: form.satuan,
        harga_satuan: hargaSatuan,
        biaya_pekerja: biayaPekerja,
        keterangan: form.keterangan,
      }
      await api.post('/perawatan', data)
      toast.success('Data perawatan berhasil disimpan!')
      setForm({ id_lahan: '', tanggal_perawatan: '', jenis_perawatan: '', bahan: '', jumlah: '', satuan: 'kg', harga_satuan: '', biaya_pekerja: '', keterangan: '' })
    } catch {
      toast.error('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const jumlah = parseFloat(form.jumlah) || 0
  const hargaSatuan = parseRupiahInput(form.harga_satuan)
  const biayaPekerja = parseRupiahInput(form.biaya_pekerja)
  const totalMaterial = jumlah * hargaSatuan
  const totalBiaya = totalMaterial + biayaPekerja


  return (
    <FormPage
      title="Data Perawatan"
      subtitle="Catat pupuk, semprot, pruning, dan kerja lain supaya biaya kebun mudah dilihat."
      eyebrow="Catat Rawat"
      accent="#a78bfa"
      stats={[
        { label: 'Isi Data', value: 'Biaya Rawat', hint: 'Bahan, tenaga kerja, dan catatan pekerjaan.' },
        { label: 'Tujuan', value: 'Lebih Hemat', hint: 'Membantu melihat biaya rawat terhadap hasil kebun.' },
        { label: 'Dipakai Di', value: 'Grafik Biaya', hint: 'Langsung masuk ke ringkasan biaya di dashboard.' },
      ]}
      insights={[
        'Pisahkan jenis kerja supaya biaya pupuk, semprot, dan kerja lain tidak campur.',
        'Kalau ada upah pekerja tambahan, isi di hari yang sama supaya total biaya tidak kurang.',
        'Tulis catatan singkat yang jelas supaya nanti mudah diingat.',
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
          <label className={LBL_CLS} style={LBL_ST}>Tanggal Perawatan *</label>
          <input type="date" className={INP} value={form.tanggal_perawatan} onChange={set('tanggal_perawatan')} required />
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Jenis Perawatan *</label>
          <input className={INP} value={form.jenis_perawatan} onChange={set('jenis_perawatan')} required placeholder="cth: Pemupukan, Penyiangan" />
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Bahan/Material *</label>
          <input className={INP} value={form.bahan} onChange={set('bahan')} required placeholder="cth: Pupuk Urea, Herbisida" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Jumlah</label>
            <input type="number" step="0.01" min="0" className={INP} value={form.jumlah} onChange={set('jumlah')} />
          </div>
          <div>
            <label className={LBL_CLS} style={LBL_ST}>Satuan</label>
            <select className={INP} value={form.satuan} onChange={set('satuan')}>
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="gram">gram</option>
              <option value="unit">unit</option>
              <option value="zak">zak</option>
              <option value="botol">botol</option>
            </select>
          </div>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Harga per Satuan</label>
          <RupiahInput className={INP} value={form.harga_satuan} onValueChange={setCurrency('harga_satuan')} placeholder="0" />
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <p className="text-xs text-gray-500 mb-1">Total Harga Material</p>
          <p className="text-lg font-bold text-green-400">
            Rp {totalMaterial.toLocaleString('id-ID')}
          </p>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Biaya Pekerja/Tenaga Kerja</label>
          <RupiahInput className={INP} value={form.biaya_pekerja} onValueChange={setCurrency('biaya_pekerja')} placeholder="0" />
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <p className="text-xs text-gray-500 mb-1">Total Biaya Perawatan</p>
          <p className="text-lg font-bold text-yellow-400">
            Rp {totalBiaya.toLocaleString('id-ID')}
          </p>
        </div>
        <div>
          <label className={LBL_CLS} style={LBL_ST}>Keterangan</label>
          <textarea className={INP} rows={2} value={form.keterangan} onChange={set('keterangan')} placeholder="Catatan tambahan" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 text-white font-bold rounded-xl transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #9333ea)' }}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </FormPage>
  )
}
