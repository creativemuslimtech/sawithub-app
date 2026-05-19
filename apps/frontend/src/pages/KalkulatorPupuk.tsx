import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import SunRays from '../components/ds/botanical/SunRays'
import api from '../api/client'
import { useAuth } from '../context/useAuth'
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

const INP = 'w-full px-4 py-3 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-forest transition'
const LBL = 'block text-xs font-medium uppercase tracking-wide mb-1.5'
const LBL_ST = { color: 'var(--ink-3)' }

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

function parsePositiveNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function fmtKg(value: number) {
  return `${value.toLocaleString('id-ID', { minimumFractionDigits: value >= 100 ? 1 : 2, maximumFractionDigits: value >= 100 ? 1 : 2 })} kg`
}

function nutrientLevel(nutrient: NutrientKey, value: number): { level: string; pct: number } {
  const scales: Record<NutrientKey, [number, number]> = {
    N: [0.08, 0.3],
    P: [0.03, 0.2],
    K: [0.08, 0.5],
  }
  const [lo, hi] = scales[nutrient]
  const pct = Math.min(100, ((value - lo) / (hi - lo)) * 100)
  if (value < lo) return { level: 'rendah', pct: Math.max(5, pct) }
  if (value > hi * 0.7) return { level: 'tinggi', pct: Math.min(95, pct) }
  return { level: 'sedang', pct: Math.max(10, Math.min(90, pct)) }
}

const NUTRIENT_COLORS: Record<NutrientKey, string> = {
  N: 'var(--c2)',
  P: 'var(--c1)',
  K: 'var(--c4)',
}

const LEVEL_CHIPS: Record<string, string> = {
  rendah: 'sh-chip-amber',
  sedang: 'sh-chip-forest',
  tinggi: 'sh-chip-terra',
}

export default function KalkulatorPupuk() {
  const { user } = useAuth()
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [form, setForm] = useState<CalculatorForm>(defaultForm)
  const [result, setResult] = useState<FertilizerCalculationResult | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const storageKey = useMemo(() => {
    const tokenTail = localStorage.getItem('sawit_token')?.slice(-12) || 'guest'
    const userKey = user?.user_id || user?.email || 'guest'
    return `sawithub:kalkulator-pupuk:${userKey}:${tokenTail}`
  }, [user?.email, user?.user_id])

  useEffect(() => {
    api.get('/CorePlotService')
      .then(res => setLahans(res.data || []))
      .catch(() => toast.error('Data lahan belum berhasil dimuat.', { id: 'kalkulator-pupuk-lahan' }))
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
    sessionStorage.setItem(storageKey, JSON.stringify({ form, result }))
  }, [form, hydrated, result, storageKey])

  const fertilizer = getFertilizerOptionByValue(form.jenis_pupuk)
  const isManual = form.jenis_pupuk === 'manual'

  const setField = (key: keyof CalculatorForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(cur => ({ ...cur, [key]: event.target.value }))
      setResult(null)
    }

  const applyAverageSoilValues = () => {
    setForm(cur => ({
      ...cur,
      kadar_n: String(AVERAGE_SOIL_VALUES.N),
      kadar_p: String(AVERAGE_SOIL_VALUES.P),
      kadar_k: String(AVERAGE_SOIL_VALUES.K),
    }))
    setResult(null)
  }

  const handleLahanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const selected = lahans.find(item => item.id_lahan === value)
    const currentYear = new Date().getFullYear()
    setForm(cur => ({
      ...cur,
      id_lahan: value,
      umur_tanaman: value === '' ? '' : selected?.tahun_tanam ? String(Math.max(currentYear - selected.tahun_tanam, 0)) : cur.umur_tanaman,
      jumlah_pohon: value === '' ? '' : selected?.jumlah_pohon ? String(selected.jumlah_pohon) : cur.jumlah_pohon,
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

    if (ageYears <= 0) { toast.error('Umur tanaman harus diisi lebih dari 0 tahun.'); return }
    if (treeCount <= 0) { toast.error('Jumlah pohon harus diisi lebih dari 0.'); return }
    if (soilN <= 0 || soilP <= 0 || soilK <= 0) { toast.error('Kadar N, P, dan K tanah perlu diisi lebih dulu.'); return }
    if (periodsPerYear <= 0) { toast.error('Periode pemupukan harus dipilih.'); return }
    if (fertilizerN <= 0 && fertilizerP <= 0 && fertilizerK <= 0) { toast.error('Isi kadar pupuk yang dipakai lebih dulu.'); return }

    setResult(calculateFertilizerRecommendation({
      ageYears, treeCount, soilN, soilP, soilK,
      fertilizerN, fertilizerP, fertilizerK, periodsPerYear,
    }))
  }

  const selectedLahan = lahans.find(item => item.id_lahan === form.id_lahan)
  const nLevel = form.kadar_n ? nutrientLevel('N', parsePositiveNumber(form.kadar_n)) : null
  const pLevel = form.kadar_p ? nutrientLevel('P', parsePositiveNumber(form.kadar_p)) : null
  const kLevel = form.kadar_k ? nutrientLevel('K', parsePositiveNumber(form.kadar_k)) : null

  const PERIOD_BUTTONS = ['1', '2', '3', '4', '6']

  return (
    <AppLayout>
      <AppTopbar
        title="Kalkulator Pupuk"
        headerActions={
          <Link to="/jadwal-perawatan/add" className="sh-btn sh-btn-ghost sh-btn-sm" style={{ textDecoration: 'none' }}>
            Riwayat perhitungan
          </Link>
        }
      />
      <div style={{ padding: '32px 36px 48px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 28, position: 'relative' }}>
          <SunRays size={160} style={{ position: 'absolute', right: 80, top: -40, color: 'var(--amber)', opacity: 0.08, pointerEvents: 'none' }} />
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Kalkulator pupuk presisi · v2026</div>
            <h1 className="sh-h-2">
              Berapa pupuk yang <em className="sh-italic" style={{ color: 'var(--forest)' }}>kebun&nbsp;kamu</em> perlukan?
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, maxWidth: 640 }}>
              Masukkan jenis bibit, umur tanaman, dan target hasil — kami hitung dosis NPK per pohon, kebutuhan tahunan, dan estimasi biaya.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: input form */}
          <form onSubmit={handleCalculate} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>Input data</div>
            <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 20 }}>Profil kebun &amp; tanah</h3>

            {/* Auto-fill from kebun */}
            <div
              className="flex items-center gap-3 rounded-xl p-3 mb-5"
              style={{ background: 'var(--forest-soft)', border: '1px solid rgba(10,120,71,0.18)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--forest-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <p className="text-sm flex-1" style={{ color: 'var(--ink-2)' }}>Pilih kebun untuk auto-isi umur tanaman &amp; jumlah pohon</p>
              <select
                className="text-sm font-semibold px-3 py-1.5 bg-white border border-line rounded-lg focus:outline-none focus:border-forest"
                value={form.id_lahan}
                onChange={handleLahanChange}
              >
                <option value="">Pilih lahan</option>
                {lahans.map(l => (
                  <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun}</option>
                ))}
              </select>
            </div>

            {selectedLahan && (
              <p className="text-xs text-ink-3 mb-4 -mt-2">
                Auto-isi dari <strong className="text-ink">{selectedLahan.nama_kebun}</strong>. Nilai masih bisa diubah.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={LBL} style={LBL_ST}>Umur tanaman *</label>
                <div className="flex items-center border border-line rounded-xl bg-white overflow-hidden">
                  <input
                    type="number" min="1" step="1"
                    className="flex-1 px-3 py-2.5 text-sm font-bold bg-transparent focus:outline-none num"
                    value={form.umur_tanaman} onChange={setField('umur_tanaman')}
                    placeholder="8"
                  />
                  <span className="px-3 text-xs text-ink-4 font-semibold">tahun</span>
                </div>
              </div>
              <div>
                <label className={LBL} style={LBL_ST}>Jumlah pohon *</label>
                <div className="flex items-center border border-line rounded-xl bg-white overflow-hidden">
                  <input
                    type="number" min="1" step="1"
                    className="flex-1 px-3 py-2.5 text-sm font-bold bg-transparent focus:outline-none num"
                    value={form.jumlah_pohon} onChange={setField('jumlah_pohon')}
                    placeholder="480"
                  />
                  <span className="px-3 text-xs text-ink-4 font-semibold">pohon</span>
                </div>
              </div>
            </div>

            {/* NPK soil levels */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="sh-eyebrow">Kadar tanah (hasil uji)</p>
                <button
                  type="button"
                  onClick={applyAverageSoilValues}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-line hover:bg-paper-2 transition"
                  style={{ color: 'var(--forest-3)' }}
                >
                  Pakai nilai rata-rata
                </button>
              </div>
              {([
                { key: 'kadar_n' as const, nutrient: 'N' as NutrientKey, label: 'Nitrogen (N)', lvl: nLevel, scale: '0,08 – 0,3%' },
                { key: 'kadar_p' as const, nutrient: 'P' as NutrientKey, label: 'Fosfor (P)', lvl: pLevel, scale: '0,03 – 0,2%' },
                { key: 'kadar_k' as const, nutrient: 'K' as NutrientKey, label: 'Kalium (K)', lvl: kLevel, scale: '0,08 – 0,5%' },
              ]).map(({ key, nutrient, label, lvl, scale }) => (
                <div key={key} className="mb-3.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-ink">{label}</span>
                    <span className="text-sm flex items-center gap-2">
                      <span className="num font-bold">{form[key] || '—'}</span>
                      {lvl && <span className={`chip ${LEVEL_CHIPS[lvl.level]} text-[10px] px-1.5 py-0.5`}>{lvl.level}</span>}
                    </span>
                  </div>
                  <input
                    type="number" min="0" step="0.01"
                    className={INP + ' mb-1.5'}
                    value={form[key]} onChange={setField(key)}
                    placeholder="Contoh: 0.18"
                  />
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: lvl ? `${lvl.pct}%` : '0%',
                        background: NUTRIENT_COLORS[nutrient],
                      }}
                    />
                  </div>
                  <p className="text-[10.5px] text-ink-4 mt-1 font-mono">Skala referensi: {scale}</p>
                </div>
              ))}
            </div>

            {/* Fertilizer radio cards */}
            <div className="mb-5">
              <label className={LBL} style={LBL_ST}>Jenis pupuk</label>
              <div className="grid grid-cols-2 gap-2">
                {FERTILIZER_OPTIONS.filter(o => o.value !== 'manual').slice(0, 4).map((opt) => {
                  const active = form.jenis_pupuk === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setForm(cur => ({ ...cur, jenis_pupuk: opt.value })); setResult(null) }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition"
                      style={{
                        borderColor: active ? 'var(--forest-3)' : 'var(--line)',
                        borderWidth: active ? 1.5 : 1,
                        background: active ? 'var(--forest-soft)' : 'white',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 shrink-0"
                        style={{ borderColor: active ? 'var(--forest)' : 'var(--line)', background: active ? 'var(--forest)' : 'white' }}
                      />
                      <span className="text-sm font-semibold text-ink">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
              {/* Manual option */}
              <button
                type="button"
                onClick={() => { setForm(cur => ({ ...cur, jenis_pupuk: 'manual' })); setResult(null) }}
                className="mt-2 w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition"
                style={{
                  borderColor: isManual ? 'var(--forest-3)' : 'var(--line)',
                  borderWidth: isManual ? 1.5 : 1,
                  background: isManual ? 'var(--forest-soft)' : 'white',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 shrink-0"
                  style={{ borderColor: isManual ? 'var(--forest)' : 'var(--line)', background: isManual ? 'var(--forest)' : 'white' }}
                />
                <span className="text-sm font-semibold text-ink">Pupuk manual (isi kadar sendiri)</span>
              </button>
              {isManual && (
                <div className="mt-2 grid grid-cols-3 gap-2 p-3 rounded-xl border border-line bg-paper-2">
                  {(['pupuk_n', 'pupuk_p', 'pupuk_k'] as const).map((k, i) => (
                    <div key={k}>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">{['N', 'P', 'K'][i]} (%)</label>
                      <input type="number" min="0" step="0.1" className={INP + ' mt-1'} value={form[k]} onChange={setField(k)} placeholder={['15', '10', '20'][i]} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Period buttons */}
            <div className="mb-6">
              <label className={LBL} style={LBL_ST}>Periode pemupukan</label>
              <div className="flex gap-2">
                {PERIOD_BUTTONS.map((p) => {
                  const active = form.periode_pemupukan === p
                  const opt = PERIOD_OPTIONS.find(o => String(o.value) === p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setForm(cur => ({ ...cur, periode_pemupukan: p })); setResult(null) }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition"
                      style={{
                        background: active ? 'var(--ink)' : 'white',
                        color: active ? 'white' : 'var(--ink-2)',
                        borderColor: active ? 'var(--ink)' : 'var(--line)',
                      }}
                    >
                      {opt?.label.replace(' kali/tahun', 'x') || `${p}x`}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: 'var(--forest)' }}
              >
                Hitung dosis pupuk →
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-line bg-paper-2 px-4 text-sm font-semibold text-ink-3 transition hover:bg-line hover:text-ink"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Right: result */}
          <div className="flex flex-col gap-4">
            {/* Dark result card */}
            <div
              className="rounded-lg-1 p-7 relative overflow-hidden"
              style={{ background: 'linear-gradient(140deg, var(--ink) 0%, #14241c 100%)', color: 'white', border: 'none' }}
            >
              <div className="relative">
                <p className="sh-eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Hasil perhitungan · {fertilizer.label}
                </p>
                <h3 className="sh-h-4" style={{ color: "var(--paper)", marginTop: 6, marginBottom: 24 }}>
                  Dosis Pupuk Direkomendasikan
                </h3>

                {result ? (
                  <>
                    {/* 3 KPI result boxes */}
                    <div
                      className="grid grid-cols-3 gap-4 mb-6"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16 }}
                    >
                      {[
                        { label: 'Per pohon / periode', value: result.dosePerPeriodPerTreeKg.toFixed(2), unit: 'kg', color: 'var(--terra)' },
                        { label: 'Total per periode', value: Math.round(result.dosePerPeriodTotalKg).toLocaleString('id-ID'), unit: 'kg', color: 'var(--c1)' },
                        { label: 'Total per tahun', value: (result.annualDoseTotalKg / 1000).toFixed(2), unit: 'ton', color: 'var(--c3)' },
                      ].map(({ label, value, unit, color }) => (
                        <div key={label}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {label}
                          </p>
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="num font-black text-4xl leading-none" style={{ color, letterSpacing: '-0.03em' }}>
                              {value}
                            </span>
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* N/P/K composition boxes */}
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex justify-between mb-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          Komposisi Nutrisi
                        </p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>per kg pupuk</p>
                      </div>
                      <div className="flex gap-3">
                        {(['N', 'P', 'K'] as NutrientKey[]).map((nutrient) => {
                          const grams = Math.round(result.fertilizerContent[nutrient] * 10)
                          return (
                            <div
                              key={nutrient}
                              className="flex-1 rounded-xl p-3"
                              style={{ background: NUTRIENT_COLORS[nutrient] }}
                            >
                              <p className="text-[11px] font-black text-white" style={{ opacity: 0.85 }}>{nutrient}</p>
                              <p className="num text-lg font-black text-white mt-0.5">{grams}g</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className="rounded-xl border border-dashed py-12 text-center"
                    style={{ borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Isi data dan klik Hitung dosis pupuk
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Hasil muncul di sini
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cost estimation */}
            {result && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
                <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Perkiraan biaya</p>
                <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Biaya pupuk satu rotasi</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Per pohon / tahun', value: fmtKg(result.annualDosePerTreeKg), color: 'var(--ink)' },
                    { label: 'Total per periode', value: fmtKg(result.dosePerPeriodTotalKg), color: 'var(--c2)' },
                    { label: 'Total per tahun', value: fmtKg(result.annualDoseTotalKg), color: 'var(--c1)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3.5 rounded-xl border border-line" style={{ background: 'var(--paper)' }}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-4">{label}</p>
                      <p className="num text-xl font-bold mt-1" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Nutrient status */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4 mb-2.5">Status hara tanah</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['N', 'P', 'K'] as NutrientKey[]).map((nutrient) => {
                      const item = result.nutrientStatus[nutrient]
                      const chipClass = LEVEL_CHIPS[item.level]
                      return (
                        <div key={nutrient} className="rounded-xl border border-line p-3 bg-paper">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-bold text-ink">{nutrient}</p>
                            <span className={`chip ${chipClass} text-[10px] px-1.5 py-0.5`}>{item.label}</span>
                          </div>
                          <p className="text-xs text-ink-3">{item.value.toFixed(3)}%</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Warning */}
                <div
                  className="mt-4 rounded-xl p-3"
                  style={{ background: 'var(--terra-soft)', border: '1px solid rgba(217,106,44,0.2)' }}
                >
                  <p className="text-xs text-ink-2 leading-relaxed">
                    <strong>Catatan:</strong> Perhitungan ini adalah <strong>estimasi awal</strong>. Sesuaikan dengan kondisi nyata dan saran agronom lapangan.
                  </p>
                </div>
              </div>
            )}

            {!result && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
                <p className="sh-eyebrow" style={{ marginBottom: 8 }}>Panduan</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { symbol: 'N', name: 'Nitrogen', desc: 'Pertumbuhan daun dan batang. Kekurangan membuat tanaman pucat.' },
                    { symbol: 'P', name: 'Fosfor', desc: 'Akar dan pembentukan energi tanaman pada fase pertumbuhan.' },
                    { symbol: 'K', name: 'Kalium', desc: 'Pembentukan buah, ketahanan, dan kualitas produksi TBS.' },
                  ].map(({ symbol, name, desc }) => (
                    <div key={symbol} className="rounded-xl border border-line p-3" style={{ background: 'var(--paper)' }}>
                      <p className="text-base font-bold text-ink">{symbol} <span className="text-xs font-semibold text-ink-3">{name}</span></p>
                      <p className="text-xs text-ink-4 mt-1 leading-5">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
