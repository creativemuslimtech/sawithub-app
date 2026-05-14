import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FormPage from '../components/FormPage'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Lahan } from '../types'
import {
  AVERAGE_SOIL_VALUES,
  FERTILIZER_OPTIONS,
  PERIOD_OPTIONS,
  calculateFertilizerRecommendation,
  getFertilizerOptionByValue,
  type FertilizerCalculationResult,
  type NutrientKey,
} from '../utils/fertilizerCalculator'

const INP = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-lime-400/55 focus:bg-white/[0.07] focus:outline-none transition'
const LBL = 'mb-1.5 block text-xs font-medium uppercase tracking-wide'
const LBL_ST = { color: 'rgba(255,255,255,0.45)' }

type CalculatorForm = {
  id_lahan: string
  umur_tanaman: string
  jumlah_pohon: string
  kadar_n: string
  kadar_p: string
  kadar_k: string
  jenis_pupuk: string
  pupuk_n: string
  pupuk_p: string
  pupuk_k: string
  periode_pemupukan: string
}

type CalculatorCache = {
  form: CalculatorForm
  result: FertilizerCalculationResult | null
}

const defaultForm: CalculatorForm = {
  id_lahan: '',
  umur_tanaman: '',
  jumlah_pohon: '',
  kadar_n: '',
  kadar_p: '',
  kadar_k: '',
  jenis_pupuk: 'npk-12-12-27',
  pupuk_n: '',
  pupuk_p: '',
  pupuk_k: '',
  periode_pemupukan: '3',
}

const toneByLevel: Record<string, { bg: string; border: string; color: string }> = {
  rendah: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.24)', color: '#fcd34d' },
  sedang: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.24)', color: '#86efac' },
  tinggi: { bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.24)', color: '#7dd3fc' },
}

function fmtNumber(value: number, digits = 2) {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function fmtKg(value: number) {
  return `${fmtNumber(value, value >= 100 ? 1 : 2)} kg`
}

function fmtPercent(value: number) {
  return `${fmtNumber(value, 2)}%`
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function ResultCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(7,12,16,0.44)',
        border: `1px solid ${accent}24`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 16px 34px ${accent}10`,
      }}
    >
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: `${accent}d9` }}>{label}</p>
      <p className="mt-2 break-words text-xl font-semibold leading-tight text-white">{value}</p>
      <p className="mt-2 text-xs leading-6 text-white/48">{hint}</p>
    </div>
  )
}

export default function KalkulatorPupuk() {
  const { user } = useAuth()
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [form, setForm] = useState<CalculatorForm>(defaultForm)
  const [result, setResult] = useState<FertilizerCalculationResult | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [isReferenceOpen, setIsReferenceOpen] = useState(false)

  const storageKey = useMemo(() => {
    const tokenTail = localStorage.getItem('sawit_token')?.slice(-12) || 'guest'
    const userKey = user?.user_id || user?.email || 'guest'
    return `sawithub:kalkulator-pupuk:${userKey}:${tokenTail}`
  }, [user?.email, user?.user_id])

  useEffect(() => {
    let mounted = true

    api.get('/lahan')
      .then((response) => {
        if (mounted) setLahans(response.data || [])
      })
      .catch(() => {
        toast.error('Data lahan belum berhasil dimuat.', { id: 'kalkulator-pupuk-lahan' })
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const cache = JSON.parse(raw) as CalculatorCache
        setForm({ ...defaultForm, ...cache.form })
        setResult(cache.result || null)
      } else {
        setForm(defaultForm)
        setResult(null)
      }
    } catch {
      setForm(defaultForm)
      setResult(null)
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    const payload: CalculatorCache = { form, result }
    sessionStorage.setItem(storageKey, JSON.stringify(payload))
  }, [form, hydrated, result, storageKey])

  const fertilizer = getFertilizerOptionByValue(form.jenis_pupuk)
  const isManual = form.jenis_pupuk === 'manual'

  const setField = (key: keyof CalculatorForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value
      setForm((current) => ({ ...current, [key]: nextValue }))
      setResult(null)
    }

  const applyAverageSoilValues = () => {
    setForm((current) => ({
      ...current,
      kadar_n: String(AVERAGE_SOIL_VALUES.N),
      kadar_p: String(AVERAGE_SOIL_VALUES.P),
      kadar_k: String(AVERAGE_SOIL_VALUES.K),
    }))
    setResult(null)
  }

  const handleLahanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const selected = lahans.find((item) => item.id_lahan === value)
    const currentYear = new Date().getFullYear()
    const isAutoFillDisabled = value === ''

    setForm((current) => ({
      ...current,
      id_lahan: value,
      umur_tanaman: isAutoFillDisabled
        ? '0'
        : selected?.tahun_tanam
          ? String(Math.max(currentYear - selected.tahun_tanam, 0))
          : current.umur_tanaman,
      jumlah_pohon: isAutoFillDisabled
        ? '0'
        : selected?.jumlah_pohon
          ? String(selected.jumlah_pohon)
          : current.jumlah_pohon,
      kadar_n: isAutoFillDisabled ? '' : current.kadar_n,
      kadar_p: isAutoFillDisabled ? '' : current.kadar_p,
      kadar_k: isAutoFillDisabled ? '' : current.kadar_k,
    }))
    setResult(null)
  }

  const handleReset = () => {
    setForm(defaultForm)
    setResult(null)
    sessionStorage.removeItem(storageKey)
  }

  const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const ageYears = parsePositiveNumber(form.umur_tanaman)
    const treeCount = parsePositiveNumber(form.jumlah_pohon)
    const soilN = parsePositiveNumber(form.kadar_n)
    const soilP = parsePositiveNumber(form.kadar_p)
    const soilK = parsePositiveNumber(form.kadar_k)
    const periodsPerYear = parsePositiveNumber(form.periode_pemupukan)
    const fertilizerN = isManual ? parsePositiveNumber(form.pupuk_n) : fertilizer.n
    const fertilizerP = isManual ? parsePositiveNumber(form.pupuk_p) : fertilizer.p
    const fertilizerK = isManual ? parsePositiveNumber(form.pupuk_k) : fertilizer.k

    if (ageYears <= 0) {
      toast.error('Umur tanaman harus diisi lebih dari 0 tahun.')
      return
    }
    if (treeCount <= 0) {
      toast.error('Jumlah pohon harus diisi lebih dari 0.')
      return
    }
    if (soilN <= 0 || soilP <= 0 || soilK <= 0) {
      toast.error('Kadar N, P, dan K tanah perlu diisi lebih dulu.')
      return
    }
    if (periodsPerYear <= 0) {
      toast.error('Periode pemupukan harus dipilih.')
      return
    }
    if (fertilizerN <= 0 && fertilizerP <= 0 && fertilizerK <= 0) {
      toast.error('Isi kadar pupuk yang dipakai lebih dulu.')
      return
    }

    const nextResult = calculateFertilizerRecommendation({
      ageYears,
      treeCount,
      soilN,
      soilP,
      soilK,
      fertilizerN,
      fertilizerP,
      fertilizerK,
      periodsPerYear,
    })

    setResult(nextResult)
  }

  const selectedLahan = lahans.find((item) => item.id_lahan === form.id_lahan)
  const missingNutrientLabels = result?.missingNutrients.map((item) => item).join(', ') || ''

  return (
    <FormPage
      title="Kalkulator Pupuk Sawit"
      subtitle="Hitung kebutuhan awal pupuk berdasarkan umur tanaman, jumlah pohon, hara tanah, jenis pupuk, dan periode pemupukan. Data hanya disimpan di sesi ini, tidak masuk database."
      eyebrow="Kalkulator Pupuk"
      accent="#84cc16"
      stats={[
        { label: 'Hitung', value: 'Dosis Awal', hint: 'Membantu membuat perkiraan awal kebutuhan pupuk per pohon dan total kebun.' },
        { label: 'Auto Isi', value: 'Dari Lahan', hint: 'Umur tanaman dan jumlah pohon bisa diambil dari data lahan yang sudah ada.' },
        { label: 'Tersimpan', value: 'Sesi Ini', hint: 'Hitungan tidak disimpan permanen dan hanya bertahan selama sesi aktif.' },
      ]}
      insights={[
        'Gunakan hasil kalkulator ini sebagai hitungan awal, lalu cocokkan lagi dengan kondisi daun, tanah, dan rekomendasi lapangan.',
        'Kalau data uji tanah belum ada, pakai nilai rata-rata wilayah lebih dulu lalu perbarui saat hasil uji sudah keluar.',
        'Untuk pupuk manual, isi kadar N, P, dan K sesuai label pupuk yang benar.',
      ]}
      contentClassName="mx-auto w-full max-w-[1180px]"
    >
      <div className="grid items-start gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleCalculate}
          className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:p-5 lg:col-start-1 lg:row-start-1 lg:row-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LBL} style={LBL_ST}>Pilih Lahan (opsional)</label>
              <select className={INP} value={form.id_lahan} onChange={handleLahanChange}>
                <option value="">Pilih lahan bila ingin auto isi</option>
                {lahans.map((item) => (
                  <option key={item.id_lahan} value={item.id_lahan}>
                    {item.nama_kebun} · {item.jumlah_pohon} pohon
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs leading-5 text-white/40">
                {selectedLahan
                  ? `Lahan ${selectedLahan.nama_kebun} dipilih. Umur tanaman dan jumlah pohon otomatis diisi, tetapi masih bisa Anda ubah.`
                  : 'Bagian ini boleh dikosongkan bila Anda ingin menghitung manual.'}
              </p>
            </div>

            <div>
              <label className={LBL} style={LBL_ST}>Umur Tanaman (tahun) *</label>
              <input type="number" min="1" step="1" className={INP} value={form.umur_tanaman} onChange={setField('umur_tanaman')} placeholder="Contoh: 5" />
            </div>
            <div>
              <label className={LBL} style={LBL_ST}>Jumlah Pohon *</label>
              <input type="number" min="1" step="1" className={INP} value={form.jumlah_pohon} onChange={setField('jumlah_pohon')} placeholder="Contoh: 100" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#08120d] p-3.5">
            <div className="mb-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Kadar hara tanah</p>
                  <button
                    type="button"
                    aria-label={isReferenceOpen ? 'Sembunyikan referensi kadar hara' : 'Lihat referensi kadar hara'}
                    onClick={() => setIsReferenceOpen(true)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-lime-300/30 bg-lime-300/10 text-lime-200 transition hover:bg-lime-300/20"
                  >
                    {isReferenceOpen ? (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 3l18 18" strokeLinecap="round" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
                        <path d="M9.9 4.2A10.2 10.2 0 0 1 12 4c5.6 0 9.4 5.3 9.9 6-.4.6-2.3 3.5-5.2 5" strokeLinecap="round" />
                        <path d="M6.2 6.3C3.9 7.8 2.4 10 2.1 10.5c.3.5 2.6 3.9 6.2 5.2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M2.1 12c.5-.7 4.3-6 9.9-6s9.4 5.3 9.9 6c-.5.7-4.3 6-9.9 6s-9.4-5.3-9.9-6Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs leading-6 text-white/45">Isi kadar N, P, dan K tanah. Bila belum tahu, Anda bisa pakai nilai rata-rata wilayah sebagai perkiraan awal.</p>
              </div>
              <button
                type="button"
                onClick={applyAverageSoilValues}
                className="rounded-xl border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/15"
              >
                Pakai Nilai Rata-rata
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className={LBL} style={LBL_ST}>Kadar N (%) *</label>
                <input type="number" min="0" step="0.01" className={INP} value={form.kadar_n} onChange={setField('kadar_n')} placeholder="Contoh: 0.10" />
                <p className="mt-1.5 text-[11px] text-white/35">Rata-rata wilayah: 0,08% - 0,15%</p>
              </div>
              <div>
                <label className={LBL} style={LBL_ST}>Kadar P (%) *</label>
                <input type="number" min="0" step="0.01" className={INP} value={form.kadar_p} onChange={setField('kadar_p')} placeholder="Contoh: 0.05" />
                <p className="mt-1.5 text-[11px] text-white/35">Rata-rata wilayah: 0,03% - 0,08%</p>
              </div>
              <div>
                <label className={LBL} style={LBL_ST}>Kadar K (%) *</label>
                <input type="number" min="0" step="0.01" className={INP} value={form.kadar_k} onChange={setField('kadar_k')} placeholder="Contoh: 0.12" />
                <p className="mt-1.5 text-[11px] text-white/35">Rata-rata wilayah: 0,08% - 0,15%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LBL} style={LBL_ST}>Jenis Pupuk *</label>
              <select className={INP} value={form.jenis_pupuk} onChange={setField('jenis_pupuk')}>
                {FERTILIZER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs leading-5 text-white/40">{fertilizer.note}</p>
            </div>
            <div>
              <label className={LBL} style={LBL_ST}>Periode Pemupukan *</label>
              <select className={INP} value={form.periode_pemupukan} onChange={setField('periode_pemupukan')}>
                {PERIOD_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isManual && (
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/8 p-3.5">
              <p className="text-sm font-semibold text-white">Isi kadar pupuk manual</p>
              <p className="mt-1 text-xs leading-6 text-white/45">Contoh: bila pupuk memiliki N 15%, P 10%, dan K 20%, isi sesuai angka tersebut.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LBL} style={LBL_ST}>Kadar N Pupuk (%)</label>
                  <input type="number" min="0" step="0.1" className={INP} value={form.pupuk_n} onChange={setField('pupuk_n')} placeholder="15" />
                </div>
                <div>
                  <label className={LBL} style={LBL_ST}>Kadar P Pupuk (%)</label>
                  <input type="number" min="0" step="0.1" className={INP} value={form.pupuk_p} onChange={setField('pupuk_p')} placeholder="10" />
                </div>
                <div>
                  <label className={LBL} style={LBL_ST}>Kadar K Pupuk (%)</label>
                  <input type="number" min="0" step="0.1" className={INP} value={form.pupuk_k} onChange={setField('pupuk_k')} placeholder="20" />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[linear-gradient(135deg,#84cc16,#65a30d)] px-4 py-2.5 text-sm font-bold text-[#08110d] transition hover:brightness-110"
            >
              Hitung Rekomendasi
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-4 lg:col-start-2 lg:row-start-1">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(150deg,rgba(132,204,22,0.08),rgba(7,12,16,0.96)_52%)] p-4 md:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-lime-200/80">Hasil Perhitungan</p>
                <h2 className="mt-1.5 text-xl font-semibold text-white md:text-2xl">Rekomendasi pupuk awal</h2>
              </div>
              <span className="self-start rounded-full border border-lime-400/20 bg-lime-400/10 px-2.5 py-1 text-[11px] text-lime-200">
                Sesi ini saja
              </span>
            </div>

            {result ? (
              <>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <ResultCard label="Per Pohon / Tahun" value={fmtKg(result.annualDosePerTreeKg)} hint="Jumlah pupuk yang dibutuhkan satu pohon dalam setahun." accent="#84cc16" />
                  <ResultCard label="Total Tahunan" value={fmtKg(result.annualDoseTotalKg)} hint="Jumlah pupuk untuk seluruh pohon dalam setahun." accent="#38bdf8" />
                  <ResultCard label="Per Periode" value={fmtKg(result.dosePerPeriodTotalKg)} hint="Jumlah pupuk setiap kali aplikasi pemupukan." accent="#f59e0b" />
                  <ResultCard label="Per Pohon / Periode" value={fmtKg(result.dosePerPeriodPerTreeKg)} hint="Jumlah pupuk tiap pohon pada satu kali aplikasi." accent="#a78bfa" />
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">Dasar hitung</p>
                      <div className="mt-2.5 space-y-1.5 text-sm leading-6 text-white/68">
                        <p>Umur tanaman masuk kelompok <span className="font-semibold text-white">{result.ageProfile}</span>.</p>
                        <p>Pupuk yang dipakai: <span className="font-semibold text-white">{isManual ? `Manual (${fmtPercent(result.fertilizerContent.N)} N / ${fmtPercent(result.fertilizerContent.P)} P / ${fmtPercent(result.fertilizerContent.K)} K)` : fertilizer.label}</span>.</p>
                        <p>Periode pemupukan: <span className="font-semibold text-white">{form.periode_pemupukan} kali/tahun</span>.</p>
                        <p>Unsur pembatas terbesar berasal dari <span className="font-semibold text-white">{result.limitingNutrient || '-'}</span>.</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">Kebutuhan dasar / pohon / tahun</p>
                      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                        {(['N', 'P', 'K'] as NutrientKey[]).map((nutrient) => (
                          <div key={nutrient} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{nutrient}</p>
                            <p className="mt-1 text-base font-semibold text-white">{fmtKg(result.baseNeeds[nutrient])}</p>
                            <p className="mt-1 text-[11px] text-white/35">Setelah koreksi: {fmtKg(result.adjustedNeeds[nutrient])}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-[#08120d] p-3.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">Status hara tanah</p>
                  <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
                    {(['N', 'P', 'K'] as NutrientKey[]).map((nutrient) => {
                      const item = result.nutrientStatus[nutrient]
                      const tone = toneByLevel[item.level]
                      return (
                        <div key={nutrient} className="rounded-xl border p-3" style={{ background: tone.bg, borderColor: tone.border }}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">{nutrient}</p>
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: tone.color, background: 'rgba(6,10,14,0.22)' }}>
                              {item.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white/72">Nilai tanah: {fmtPercent(item.value)}</p>
                          <p className="mt-1 text-xs leading-6 text-white/42">Kisaran rujukan: {item.referenceLabel}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {result.missingNutrients.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-amber-400/22 bg-amber-400/8 p-3.5">
                    <p className="text-sm font-semibold text-amber-200">Catatan penting</p>
                    <p className="mt-2 text-sm leading-7 text-white/70">
                      Pupuk yang dipilih tidak memiliki unsur <span className="font-semibold text-white">{missingNutrientLabels}</span>. Hasil ini tetap berguna sebagai perkiraan, tetapi unsur yang kosong tetap perlu dipenuhi dari pupuk lain.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm leading-7 text-white/55">
                Isi data di sebelah kiri, lalu klik <span className="font-semibold text-white">Hitung Rekomendasi</span>. Hasil tidak disimpan ke database dan hanya bertahan di sesi aktif Anda.
              </div>
            )}
          </div>

        </div>
      </div>
      {isReferenceOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#02060a]/78 px-4" role="dialog" aria-modal="true" aria-label="Referensi kadar hara">
          <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#08120d] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-lime-200/80">Referensi kadar hara</p>
                <h3 className="mt-1.5 text-base font-semibold text-white">Patokan Bengkulu & Sumatra</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReferenceOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Tutup referensi kadar hara"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {[
                ['N', '0,08%-0,15% (0-30 cm) / 0,05%-0,10% (30-60 cm).'],
                ['P', '0,03%-0,08% (0-30 cm) / 0,02%-0,05% (30-60 cm).'],
                ['K', '0,08%-0,15% (0-30 cm) / 0,05%-0,10% (30-60 cm).'],
              ].map((item) => (
                <div key={item[0]} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-xs font-semibold text-white">{item[0]}</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">{item[1]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </FormPage>
  )
}
