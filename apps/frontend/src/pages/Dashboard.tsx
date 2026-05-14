import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import RupiahInput from '../components/RupiahInput'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/client'
import type { DashboardData, LahanInfo, PanenRow, PerawatanRow, PendapatanRow } from '../types'
import { formatRupiahDisplay, parseRupiahInput, toRupiahInputRaw } from '../utils/rupiah'
import { trackEvent, GAEvents } from '../utils/analytics'
import useStandalonePWA from '../hooks/useStandalonePWA'
import { AppMetricIcon, type AppMetricIconKind } from '../components/design-system'
import { useFarm } from '../context/useFarm'
import { useAuth } from '../context/useAuth'
import TrialBanner from '../components/TrialBanner'
import OnboardingWizard from '../components/OnboardingWizard'
import { isOnboardingDoneLocal, migrateOnboardingLocalStorage, setOnboardingDoneLocal } from '../utils/onboardingStorage'
import { formatReportPeriodLabel } from '../utils/reportFormat'
import { getApiErrorMessage } from '../utils/apiError'

const rupiah = formatRupiahDisplay
const safeDivide = (value: number, divisor: number) => divisor === 0 ? 0 : value / divisor
const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}
const fmtDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
const fmtRupiahFull = (n: number) => rupiah(n)
const fmtCompactPlainNumber = (n: number) => {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} M`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} jt`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} rb`
  return Math.round(n).toLocaleString('id-ID')
}
const fmtTonCompact = (n: number) => n >= 10 ? `${n.toFixed(1)} ton` : `${n.toFixed(2)} ton`
const fmtMetricAxis = (value: number, metric: Metric) => {
  if (metric === 'total') return value >= 10 ? `${value.toFixed(0)} t` : `${value.toFixed(1)} t`
  if (metric === 'janjang') return fmtCompactPlainNumber(value)
  if (metric === 'harga_avg') return rupiah(value)
  return rupiah(value)
}
const fmtBiayaAxis = (value: number) => rupiah(value)
const metricAxisWidth = (metric: Metric) => metric === 'total' || metric === 'janjang' ? 52 : 96

const fmtDateShort = (s: string) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' })
}
const fmtDateShortWithYear = (s: string) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
}
const fmtDateFull = (s: string) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

const JENIS_LABEL: Record<string,string> = {
  pemupukan:'Pupuk', penyemprotan:'Pestisida', weeding:'Weeding',
  upah_tk:'Upah TK', transport:'Transport', lainnya:'Lainnya',
  pupuk:'Pupuk', tebas_rumput:'Tebas Rumput', semprot_rumput:'Semprot',
  pruning:'Pruning',
}

const LINE_COLORS = ['#22c55e','#38bdf8','#f97316','#f43f5e','#a78bfa','#34d399']
/** Distinct stroke patterns for multi-kebun series (BI-03 — not color-only). */
const LINE_DASH_PATTERNS = ['0', '6 4', '3 3', '8 4', '4 2 2 2', '6 2 2 2'] as const
const UP_COLORS   = ['#f97316','#22c55e','#38bdf8','#a855f7','#ec4899']

const CARD = { background: 'var(--surface)', border: '1px solid var(--line)' }

type Period = 'week' | 'month' | 'year'
type Metric = 'total' | 'pendapatan' | 'net_income' | 'janjang' | 'harga_avg'
type PerawatanMetric = 'all' | 'material' | 'pekerja' | 'total'
type ChartTooltipPayloadEntry = {
  name?: string | number
  color?: string
  value?: number | string | readonly (number | string)[]
  payload?: {
    agendaCount?: number
    material?: number
    pekerja?: number
    total?: number
    bahanPreview?: string[]
  }
}
type ChartTooltipArgs = {
  active?: boolean
  label?: string | number
  payload?: readonly ChartTooltipPayloadEntry[]
}

const emptyDashboardData = (period: Period, selectedLahan: string): DashboardData => ({
  period,
  selected_lahan: selectedLahan,
  lahan_list: [],
  total_berat_ton: 0,
  total_pendapatan: 0,
  total_biaya: 0,
  net_income: 0,
  chart_data: [],
  biaya_breakdown: [],
  upcoming_perawatan: [],
  last_harga_per_kg: 0,
  avg_ton_per_period: 0,
  recent_panen: [],
  recent_perawatan: [],
  recent_pendapatan: [],
})

const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).reverse()
const PERFORMANCE_METRICS: { key: Metric; label: string; color: string; fmt: (v: number) => string; unit: string }[] = [
  { key: 'total',      label: 'Produksi',   color: '#22c55e', fmt: v => `${v.toFixed(2)} ton`, unit: 'ton' },
  { key: 'janjang',    label: 'Janjang',    color: '#38bdf8', fmt: v => `${Math.round(v).toLocaleString('id-ID')} jjg`, unit: 'jjg' },
  { key: 'harga_avg',  label: 'Harga TBS',  color: '#fbbf24', fmt: v => `${rupiah(v)}/kg`, unit: 'Rp/kg' },
  { key: 'pendapatan', label: 'Pendapatan', color: '#facc15', fmt: v => rupiah(v), unit: 'Rp' },
  { key: 'net_income', label: 'Bersih',     color: '#4ade80', fmt: v => rupiah(v), unit: 'Rp' },
]

function deltaTone(value: number) {
  if (value > 0) return { color: 'var(--emerald)', bg: 'var(--emerald-soft)', border: 'var(--emerald-soft)' }
  if (value < 0) return { color: 'var(--terra)', bg: 'var(--terra-soft)', border: 'var(--terra-soft)' }
  return { color: 'var(--ink-3)', bg: 'rgba(123,138,131,0.08)', border: 'rgba(123,138,131,0.18)' }
}

function SnapshotPill({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div
      className="rounded-xl-1 p-4 bg-surface border border-line shadow-card-sm"
    >
      <p className="text-[10px] uppercase tracking-[0.18em] mb-1.5 font-semibold" style={{ color: accent }}>{label}</p>
      <p className="text-[15px] font-semibold text-ink leading-tight break-words sm:text-base">{value}</p>
      <p className="text-xs mt-2 leading-relaxed text-ink-4">{hint}</p>
    </div>
  )
}

function PremiumStatCard({
  label,
  shortLabel,
  value,
  sub,
  accent,
  iconKind,
  delta,
  insight,
}: {
  label: string
  shortLabel: string
  value: string
  sub: string
  accent: string
  iconKind: AppMetricIconKind
  delta: number
  insight: string
}) {
  const tone = deltaTone(delta)

  return (
    <div className="relative overflow-hidden rounded-xl-1 bg-surface border border-line shadow-card p-4 md:p-5 transition">
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl-1" style={{ background: accent }} />
      <div className="pt-1">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
            >
              <AppMetricIcon kind={iconKind} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-ink-4">
                <span className="md:hidden">{shortLabel}</span>
                <span className="hidden md:inline">{label}</span>
              </p>
              <p className="mt-1 text-xl font-bold leading-tight text-ink break-words md:text-2xl">{value}</p>
            </div>
          </div>
          <span
            className="self-start rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:self-auto"
            style={{ color: tone.color, background: tone.bg, borderColor: tone.border }}
          >
            {fmtDelta(delta)}
          </span>
        </div>
        <p className="text-xs md:text-sm leading-relaxed text-ink-3">{sub}</p>
        <p className="text-[11px] mt-3 leading-relaxed text-ink-4">{insight}</p>
      </div>
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const farm = useFarm()
  const { user, refreshUser } = useAuth()
  const [data, setData]       = useState<DashboardData | null>(null)
  const isStandalonePWA = useStandalonePWA()
  const [period, setPeriod]   = useState<Period>('month')
  const [lahanId, setLahanId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal]     = useState<{ mode: 'view' | 'edit'; row: PanenRow } | null>(null)
  const [lahanModal, setLahanModal] = useState<{ mode: 'view' | 'edit'; row: LahanInfo } | null>(null)
  const [perawatanModal, setPerawatanModal] = useState<{ mode: 'view' | 'edit'; row: PerawatanRow } | null>(null)
  const [pendapatanModal, setPendapatanModal] = useState<{ mode: 'view' | 'edit'; row: PendapatanRow } | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [lahanEditForm, setLahanEditForm] = useState<Record<string, string>>({})
  const [perawatanEditForm, setPerawatanEditForm] = useState<Record<string, string>>({})
  const [pendapatanEditForm, setPendapatanEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving]   = useState(false)
  const [metric, setMetric] = useState<Metric>('total')
  const [perawatanMetric, setPerawatanMetric] = useState<PerawatanMetric>('all')
  const [selYear, setSelYear]   = useState(currentYear)
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1) // 1-12
  const [selWeek, setSelWeek]   = useState(0) // 0-based week of month
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(() => {
    if (typeof window === 'undefined') return false
    migrateOnboardingLocalStorage()
    return !isOnboardingDoneLocal()
  })

  const weeksInMonth = (year: number, month: number) => {
    const lastDay  = new Date(year, month, 0)
    const weeks: { label: string; value: number }[] = []
    for (let w = 0; w < 5; w++) {
      const start = new Date(year, month - 1, 1 + w * 7)
      if (start > lastDay) break
      const end = new Date(year, month - 1, Math.min(7 + w * 7, lastDay.getDate()))
      weeks.push({ label: `Mg ${w + 1} (${start.getDate()}–${end.getDate()} ${MONTHS_FULL[month-1].slice(0,3)})`, value: w })
    }
    return weeks
  }
  const today = new Date()

  useEffect(() => {
    if (farm.activeFarmLimit <= 1) return
    const id = farm.activeFarmId.trim()
    setLahanId(id)
  }, [farm.activeFarmId, farm.activeFarmLimit])

  const openView = (row: PanenRow) => setModal({ mode: 'view', row })
  const openEdit = (row: PanenRow) => {
    setEditForm({
      id_lahan:      String(row.id_lahan),
      tanggal_panen: row.tanggal_panen,
      luas_panen_ha: String(row.luas_panen_ha),
      jumlah_janjang: String(row.jumlah_janjang),
      berat_kg:      String(row.berat_kg),
      harga_per_kg:  toRupiahInputRaw(row.harga_per_kg),
      biaya_panen:   toRupiahInputRaw(row.biaya_panen),
    })
    setModal({ mode: 'edit', row })
  }

  const openViewLahan = (row: LahanInfo) => setLahanModal({ mode: 'view', row })
  const openEditLahan = (row: LahanInfo) => {
    setLahanEditForm({
      nama_kebun:   row.nama_kebun,
      jenis_bibit:  row.jenis_bibit,
      lokasi:       row.lokasi,
      luas_ha:      String(row.luas_ha),
      jumlah_pohon: String(row.jumlah_pohon),
      tahun_tanam:  String(row.tahun_tanam),
    })
    setLahanModal({ mode: 'edit', row })
  }

  const handleSaveEditLahan = async () => {
    if (!lahanModal) return
    setSaving(true)
    try {
      await api.put(`/CorePlotService/${lahanModal.row.id_lahan}`, {
        nama_kebun:   lahanEditForm.nama_kebun,
        jenis_bibit:  lahanEditForm.jenis_bibit,
        lokasi:       lahanEditForm.lokasi,
        luas_ha:      parseFloat(lahanEditForm.luas_ha) || 0,
        jumlah_pohon: parseInt(lahanEditForm.jumlah_pohon) || 0,
        tahun_tanam:  parseInt(lahanEditForm.tahun_tanam) || 0,
      })
      setLahanModal(null)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menyimpan.') }
    finally { setSaving(false) }
  }

  const handleDeleteLahan = async (id: string) => {
    if (!confirm('Hapus data lahan ini?')) return
    try {
      await api.delete(`/CorePlotService/${id}`)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, 'Gagal menghapus.'))
    }
  }

  const openViewPerawatan = (row: PerawatanRow) => setPerawatanModal({ mode: 'view', row })
  const openEditPerawatan = (row: PerawatanRow) => {
    setPerawatanEditForm({
        jenis_perawatan: row.jenis_perawatan,
        bahan: row.bahan,
        jumlah: String(row.jumlah),
        satuan: row.satuan,
        harga_satuan: toRupiahInputRaw(row.harga_satuan),
        biaya_pekerja: toRupiahInputRaw(row.biaya_pekerja),
        keterangan: row.keterangan || '',
      })
    setPerawatanModal({ mode: 'edit', row })
  }

  const handleSaveEditPerawatan = async () => {
    if (!perawatanModal) return
    setSaving(true)
    try {
      await api.put(`/CoreMaintenanceService/${perawatanModal.row.id_perawatan}`, {
        jenis_perawatan: perawatanEditForm.jenis_perawatan,
        bahan: perawatanEditForm.bahan,
        jumlah: parseFloat(perawatanEditForm.jumlah) || 0,
        satuan: perawatanEditForm.satuan,
        harga_satuan: parseRupiahInput(perawatanEditForm.harga_satuan),
        biaya_pekerja: parseRupiahInput(perawatanEditForm.biaya_pekerja),
        keterangan: perawatanEditForm.keterangan,
      })
      setPerawatanModal(null)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menyimpan.') }
    finally { setSaving(false) }
  }

  const handleDeletePerawatan = async (id: string) => {
    if (!confirm('Hapus data perawatan ini?')) return
    try {
      await api.delete(`/CoreMaintenanceService/${id}`)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menghapus.') }
  }

  const openViewPendapatan = (row: PendapatanRow) => setPendapatanModal({ mode: 'view', row })
  const openEditPendapatan = (row: PendapatanRow) => {
    setPendapatanEditForm({
      total_berat_kg: String(row.total_berat_kg),
      total_janjang: String(row.total_janjang || 0),
      pendapatan_kotor: toRupiahInputRaw(row.pendapatan_kotor),
      biaya_total: toRupiahInputRaw(row.biaya_total),
      catatan: row.catatan || '',
    })
    setPendapatanModal({ mode: 'edit', row })
  }

  const handleSaveEditPendapatan = async () => {
    if (!pendapatanModal) return
    setSaving(true)
    try {
      await api.put(`/FinanceIncomeService/${pendapatanModal.row.id_pendapatan}`, {
        total_berat_kg: parseFloat(pendapatanEditForm.total_berat_kg) || 0,
        total_janjang: parseInt(pendapatanEditForm.total_janjang) || 0,
        pendapatan_kotor: parseRupiahInput(pendapatanEditForm.pendapatan_kotor),
        biaya_total: parseRupiahInput(pendapatanEditForm.biaya_total),
        catatan: pendapatanEditForm.catatan,
      })
      setPendapatanModal(null)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menyimpan.') }
    finally { setSaving(false) }
  }

  const handleDeletePendapatan = async (id: string) => {
    if (!confirm('Hapus data pendapatan ini?')) return
    try {
      await api.delete(`/FinanceIncomeService/${id}`)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menghapus.') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data panen ini?')) return
    try {
      await api.delete(`/CoreHarvestService/${id}`)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menghapus.') }
  }
  const handleSaveEdit = async () => {
    if (!modal) return
    setSaving(true)
    try {
      await api.put(`/CoreHarvestService/${modal.row.id_panen}`, {
        id_lahan:       editForm.id_lahan,
        tanggal_panen:  editForm.tanggal_panen,
        luas_panen_ha:  parseFloat(editForm.luas_panen_ha) || 0,
        jumlah_janjang: parseInt(editForm.jumlah_janjang) || 0,
        berat_kg:       parseFloat(editForm.berat_kg) || 0,
        harga_per_kg:   parseRupiahInput(editForm.harga_per_kg),
        biaya_panen:    parseRupiahInput(editForm.biaya_panen),
      })
      setModal(null)
      fetchDashboard(period, lahanId, selYear, selMonth, selWeek)
    } catch { alert('Gagal menyimpan.') }
    finally { setSaving(false) }
  }

  const fetchDashboard = (p: Period, lid: string, yr: number, mo: number, wk: number) => {
    setLoading(true)
    api.get(`/ReportingDashboardService?period=${p}&lahan_id=${lid}&year=${yr}&month=${mo}&week=${wk}`)
      .then(r => setData(r.data))
      .catch(() => setData(emptyDashboardData(p, lid)))
      .finally(() => setLoading(false))
  }

  // Track dashboard view
  useEffect(() => {
    trackEvent(GAEvents.VIEW_DASHBOARD, {
      page: 'dashboard',
    })
  }, [])

  useEffect(() => { fetchDashboard(period, lahanId, selYear, selMonth, selWeek) },
    [period, lahanId, selYear, selMonth, selWeek])

  useEffect(() => {
    migrateOnboardingLocalStorage()
    if (user?.preferences?.onboarding_done === true) {
      setOnboardingDoneLocal()
      setShowOnboardingWizard(false)
    }
  }, [user?.user_id, user?.preferences?.onboarding_done])

  const completeOnboarding = async () => {
    setOnboardingDoneLocal()
    setShowOnboardingWizard(false)
    try {
      await api.put('/IdentityProfileService/preferences', { onboarding_done: true })
      await refreshUser()
    } catch {
      /* offline or API error: local flag still set */
    }
  }

  const { lahanNames, chartRows } = useMemo(() => {
    if (!data) return { lahanNames: [], chartRows: [] }
    const namesSet = new Set<string>()
    data.chart_data.forEach(pt => Object.keys(pt.per_lahan ?? {}).forEach(k => namesSet.add(k)))
    const names = Array.from(namesSet)
    const rows = data.chart_data.map(pt => {
      const row: Record<string, number | string> = {
        label: pt.label,
        total: pt.total,
        pendapatan: pt.pendapatan,
        net_income: pt.net_income,
        janjang: pt.janjang,
        harga_avg: pt.harga_avg,
      }
      names.forEach(n => { row[n] = pt.per_lahan?.[n] ?? 0 })
      return row
    })
    return { lahanNames: names, chartRows: rows }
  }, [data])

  const hariIni = today.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
  const hour = today.getHours()
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'
  const firstName = user?.full_name?.split(' ')[0] ?? ''
  const selectedLahanName = data?.lahan_list.find(l => l.id_lahan === lahanId)?.nama_kebun ?? 'Semua Kebun'
  const estimasiPanen = (data?.avg_ton_per_period ?? 0) * (data?.last_harga_per_kg ?? 0) * 1000
  const dashboardPeriodLabel = formatReportPeriodLabel(period, selYear, selMonth, selWeek)

  const performanceSummary = useMemo(() => {
    if (!data) {
      return {
        latestPoint: null as DashboardData['chart_data'][number] | null,
        previousPoint: null as DashboardData['chart_data'][number] | null,
        bestRevenuePoint: null as DashboardData['chart_data'][number] | null,
        bestProductionPoint: null as DashboardData['chart_data'][number] | null,
        productionDelta: 0,
        revenueDelta: 0,
        costDelta: 0,
        netDelta: 0,
        marginPct: 0,
        avgHargaAll: 0,
        biayaPerTon: 0,
        recentAvgHarga: 0,
        recentAvgTon: 0,
        nearestUpcoming: null as DashboardData['upcoming_perawatan'][number] | null,
        totalUpcoming: 0,
        totalLahan: 0,
      }
    }

    const nonZeroPoints = data.chart_data.filter(p => p.total > 0 || p.pendapatan > 0 || p.janjang > 0)
    const latestPoint = nonZeroPoints.length > 0
      ? nonZeroPoints[nonZeroPoints.length - 1]
      : (data.chart_data[data.chart_data.length - 1] ?? null)
    const latestIdx = latestPoint ? data.chart_data.indexOf(latestPoint) : -1
    const previousPoint = latestIdx > 0 ? data.chart_data[latestIdx - 1] : null
    const bestRevenuePoint = data.chart_data.reduce<DashboardData['chart_data'][number] | null>((best, point) => {
      if (!best || point.pendapatan > best.pendapatan) return point
      return best
    }, null)
    const bestProductionPoint = data.chart_data.reduce<DashboardData['chart_data'][number] | null>((best, point) => {
      if (!best || point.total > best.total) return point
      return best
    }, null)
    const nearestUpcoming = [...(data.upcoming_perawatan || [])]
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())[0] ?? null
    const recentAvgHarga = data.recent_panen.length
      ? data.recent_panen.reduce((sum, item) => sum + item.harga_per_kg, 0) / data.recent_panen.length
      : 0
    const recentAvgTon = data.recent_panen.length
      ? data.recent_panen.reduce((sum, item) => sum + item.berat_ton, 0) / data.recent_panen.length
      : 0

    return {
      latestPoint,
      previousPoint,
      bestRevenuePoint,
      bestProductionPoint,
      productionDelta: percentChange(latestPoint?.total ?? 0, previousPoint?.total ?? 0),
      revenueDelta: percentChange(latestPoint?.pendapatan ?? 0, previousPoint?.pendapatan ?? 0),
      costDelta: percentChange(
        data.total_biaya,
        previousPoint ? Math.max(0, previousPoint.pendapatan - previousPoint.net_income) : 0,
      ),
      netDelta: percentChange(latestPoint?.net_income ?? 0, previousPoint?.net_income ?? 0),
      marginPct: safeDivide(data.net_income, data.total_pendapatan) * 100,
      avgHargaAll: safeDivide(data.total_pendapatan, data.total_berat_ton * 1000),
      biayaPerTon: safeDivide(data.total_biaya, data.total_berat_ton),
      recentAvgHarga,
      recentAvgTon,
      nearestUpcoming,
      totalUpcoming: data.upcoming_perawatan.length,
      totalLahan: data.lahan_list.length,
    }
  }, [data])

  const todayFocusCards = !data ? [] : [
    {
      label: '1. Kebun',
      title: data.lahan_list.length > 0 ? `${data.lahan_list.length} kebun tercatat` : 'Tambah kebun pertama',
      copy: data.lahan_list.length > 0 ? 'Pilih kebun di tab bawah untuk melihat angka per lokasi.' : 'Mulai dari satu kebun agar panen dan biaya punya tempat catatan.',
      to: '/lahan/add',
      cta: data.lahan_list.length > 0 ? 'Tambah kebun lain' : 'Tambah kebun',
    },
    {
      label: '2. Panen',
      title: data.recent_panen.length > 0 ? `${data.recent_panen.length} panen terakhir` : 'Belum ada panen',
      copy: data.recent_panen.length > 0 ? `Harga terakhir ${data.last_harga_per_kg > 0 ? `${rupiah(data.last_harga_per_kg)}/kg` : 'belum tersedia'}.` : 'Catat panen pertama supaya produksi dan uang masuk mulai terbaca.',
      to: '/panen/add',
      cta: 'Catat panen',
    },
    {
      label: '3. Biaya',
      title: data.recent_perawatan.length > 0 ? `${data.recent_perawatan.length} biaya rawat terakhir` : 'Belum ada biaya rawat',
      copy: data.recent_perawatan.length > 0 ? `Total biaya periode ini ${rupiah(data.total_biaya)}.` : 'Masukkan pupuk, semprot, pekerja, atau biaya lain agar hasil bersih tidak meleset.',
      to: '/perawatan/add',
      cta: 'Catat biaya',
    },
    {
      label: '4. Laporan',
      title: data.total_pendapatan > 0 ? `Bersih ${rupiah(data.net_income)}` : 'Laporan belum terisi',
      copy: data.total_pendapatan > 0 ? 'Buka laporan untuk melihat rincian dan unduh Excel/PDF.' : 'Setelah ada panen dan biaya, laporan untung-rugi akan lebih mudah dibaca.',
      to: data.total_pendapatan > 0 ? '/laporan-keuangan' : '/pendapatan/add',
      cta: data.total_pendapatan > 0 ? 'Buka laporan' : 'Catat uang masuk',
    },
  ]

  const hasAnyOperationalRecord = Boolean(data && (
    data.recent_panen.length > 0 ||
    data.recent_perawatan.length > 0 ||
    data.recent_pendapatan.length > 0 ||
    data.total_pendapatan > 0 ||
    data.total_biaya > 0
  ))

  const statCards = !data ? [] : [
    { label: 'Total Produksi TBS', shortLabel: 'Produksi', value: `${data.total_berat_ton.toFixed(2)} ton`,
      sub: `${selectedLahanName} · ${dashboardPeriodLabel}`, accent: '#22c55e', iconKind: 'harvest' as const,
      delta: performanceSummary.productionDelta,
      insight: `Periode terbaik: ${performanceSummary.bestProductionPoint?.label ?? '-'} dengan ${fmtTonCompact(performanceSummary.bestProductionPoint?.total ?? 0)}.` },
    { label: 'Pendapatan', shortLabel: 'Pendapatan', value: rupiah(data.total_pendapatan),
      sub: `${selectedLahanName} · ${dashboardPeriodLabel}`, accent: '#facc15', iconKind: 'revenue' as const,
      delta: performanceSummary.revenueDelta,
      insight: `Harga rata-rata saat ini ${fmtRupiahFull(performanceSummary.avgHargaAll)}/kg.` },
    { label: 'Total Biaya', shortLabel: 'Total Biaya', value: rupiah(data.total_biaya),
      sub: `${selectedLahanName} · ${dashboardPeriodLabel}`, accent: '#f87171', iconKind: 'cost' as const,
      delta: performanceSummary.costDelta,
      insight: `Biaya sekitar ${fmtRupiahFull(performanceSummary.biayaPerTon)} untuk tiap ton hasil.` },
    { label: 'Pendapatan Bersih', shortLabel: 'Bersih', value: rupiah(data.net_income),
      sub: `${selectedLahanName} · ${dashboardPeriodLabel}`,
      accent: data.net_income >= 0 ? '#4ade80' : '#f87171',
      iconKind: (data.net_income >= 0 ? 'profit-up' : 'profit-down') as AppMetricIconKind,
      delta: performanceSummary.netDelta,
      insight: `Untung bersih saat ini ${performanceSummary.marginPct.toFixed(1)}% dari total uang masuk.` },
  ]
  const selectedMetricMeta = PERFORMANCE_METRICS.find(item => item.key === metric) ?? PERFORMANCE_METRICS[0]
  const estateExecutiveCards = useMemo(() => {
    if (!data) return []

    const aggregates = new Map<string, {
      id_lahan: string
      nama_kebun: string
      luas_ha: number
      panenCount: number
      beratTon: number
      pendapatan: number
      bersih: number
      perawatanCount: number
      biayaRawat: number
    }>()

    data.lahan_list.forEach((lahan) => {
      aggregates.set(lahan.id_lahan, {
        id_lahan: lahan.id_lahan,
        nama_kebun: lahan.nama_kebun,
        luas_ha: lahan.luas_ha,
        panenCount: 0,
        beratTon: 0,
        pendapatan: 0,
        bersih: 0,
        perawatanCount: 0,
        biayaRawat: 0,
      })
    })

    data.recent_panen.forEach((item) => {
      const current = aggregates.get(item.id_lahan)
      if (!current) return
      current.panenCount += 1
      current.beratTon += item.berat_ton
      current.pendapatan += item.total_pendapatan
      current.bersih += item.hasil_bersih
    })

    data.recent_perawatan.forEach((item) => {
      const current = aggregates.get(item.id_lahan)
      if (!current) return
      current.perawatanCount += 1
      current.biayaRawat += item.biaya || 0
    })

    const rows = Array.from(aggregates.values())
    const maxPendapatan = Math.max(...rows.map(row => row.pendapatan), 1)
    const maxBersih = Math.max(...rows.map(row => Math.max(row.bersih, 0)), 1)
    const maxBerat = Math.max(...rows.map(row => row.beratTon), 1)

    return rows
      .map((row) => {
        const score = Math.round(
          (
            safeDivide(row.pendapatan, maxPendapatan) * 45 +
            safeDivide(Math.max(row.bersih, 0), maxBersih) * 35 +
            safeDivide(row.beratTon, maxBerat) * 20
          ),
        )
        const status = score >= 75 ? 'Bagus' : score >= 45 ? 'Cukup' : 'Perlu cek'
        return {
          ...row,
          score,
          status,
          revenuePerHa: safeDivide(row.pendapatan, row.luas_ha),
          netPerHa: safeDivide(row.bersih, row.luas_ha),
          avgTonPerPanen: safeDivide(row.beratTon, row.panenCount),
        }
      })
      .sort((a, b) => b.score - a.score || b.pendapatan - a.pendapatan)
  }, [data])

  const isMultiLahanPerformance = lahanId === '' && lahanNames.length > 1 && metric === 'total'
  const performanceAverage = useMemo(() => {
    if (chartRows.length === 0 || isMultiLahanPerformance) return 0
    const values = chartRows.map((row) => Number(row[metric] ?? 0))
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }, [chartRows, isMultiLahanPerformance, metric])

  const peakMetricPoint = useMemo(() => {
    if (!data) return null
    return data.chart_data.reduce<DashboardData['chart_data'][number] | null>((best, point) => {
      if (!best || point[metric] > best[metric]) return point
      return best
    }, null)
  }, [data, metric])

  const perawatanChartRows = useMemo(() => {
    const grouped = new Map<string, {
      label: string
      agendaCount: number
      material: number
      pekerja: number
      total: number
      bahanPreview: string[]
    }>()

    for (const item of [...(data?.recent_perawatan || [])].sort((a, b) =>
      new Date(a.tanggal_perawatan).getTime() - new Date(b.tanggal_perawatan).getTime(),
    )) {
      const key = item.tanggal_perawatan
      const current = grouped.get(key) ?? {
        label: fmtDateShort(key),
        agendaCount: 0,
        material: 0,
        pekerja: 0,
        total: 0,
        bahanPreview: [],
      }

      current.agendaCount += 1
      current.material += item.total_harga_material || 0
      current.pekerja += item.biaya_pekerja || 0
      current.total += item.biaya || 0
      if (item.bahan && current.bahanPreview.length < 2 && !current.bahanPreview.includes(item.bahan)) {
        current.bahanPreview.push(item.bahan)
      }

      grouped.set(key, current)
    }

    return Array.from(grouped.values())
  }, [data])

  const perawatanAverage = useMemo(() => {
    if (perawatanChartRows.length === 0) return 0
    return perawatanChartRows.reduce((sum, row) => sum + row.total, 0) / perawatanChartRows.length
  }, [perawatanChartRows])

  const trialBannerRemaining = useMemo(() => {
    const sub = farm.subscription
    const trialRem = sub?.trial_remaining ?? sub?.days_remaining
    const isTrialing = String(sub?.subscription_status ?? '').toLowerCase() === 'trialing'
    if (!isTrialing || trialRem == null || trialRem < 0 || trialRem > 3) return null
    return trialRem
  }, [farm.subscription])

  const [devSubscriptionEnforcement, setDevSubscriptionEnforcement] = useState<boolean | null>(null)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    api
      .get<{ subscription_enforcement?: boolean }>('/health')
      .then((res) => {
        if (typeof res.data?.subscription_enforcement === 'boolean') {
          setDevSubscriptionEnforcement(res.data.subscription_enforcement)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <AppLayout>
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container space-y-6">

        {/* ── Page header ── */}
        <div className="mb-6">
          <div className="mb-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow mb-2">{greeting} · {hariIni}</p>
                <h1 className="display text-3xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>
                  {firstName ? `${firstName}, kebun` : 'Kebun'} kamu{data && data.net_income !== 0 ? (
                    <> untung <span style={{ color: 'var(--emerald)' }}>{rupiah(Math.abs(data.net_income))}</span> {period === 'month' ? 'bulan' : period === 'week' ? 'minggu' : 'tahun'} ini.</>
                  ) : ' terpantau.'}
                </h1>
                <p className="mt-2 text-sm text-ink-3">
                  {performanceSummary.totalUpcoming > 0 ? `${performanceSummary.totalUpcoming} jadwal kerja ke depan` : 'Catat panen atau biaya untuk melihat laporan.'}
                  {data?.last_harga_per_kg ? ` · Harga TBS Rp ${data.last_harga_per_kg.toLocaleString('id-ID')}/kg` : ''}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full border border-emerald-soft bg-emerald-tint px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald"
                    title="Periode yang dikirim ke ReportingDashboardService — samakan dengan filter Laporan Keuangan untuk angka yang setara."
                  >
                    Periode data: {dashboardPeriodLabel}
                  </span>
                  <span className="text-xs text-ink-4">
                    {selectedLahanName}
                  </span>
                </div>
              </div>
              {farm.subscription && ['trialing', 'pending_payment', 'free_limited'].includes(
                String(farm.subscription.subscription_status),
              ) ? (
                <Link
                  to="/subscription"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-soft bg-emerald-tint px-3 py-1.5 text-xs font-semibold text-emerald transition hover:bg-emerald-soft"
                >
                  Langganan
                  {farm.subscription.days_remaining != null && farm.subscription.days_remaining >= 0 ? (
                    <span className="text-ink-4">
                      {farm.subscription.days_remaining === 0 ? '• perlu perhatian' : `• sisa ${farm.subscription.days_remaining} hari`}
                    </span>
                  ) : null}
                </Link>
              ) : null}
            </div>
          </div>

          {/* ── Filter row ── */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-surface border border-line">
            {/* Period tabs */}
            <div className="flex rounded-xl overflow-hidden text-sm flex-shrink-0 bg-paper-2 border border-line">
              {(['week','month','year'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-4 py-2 font-medium transition"
                  style={period === p
                    ? { background: 'var(--ink)', color: 'var(--paper)' }
                    : { color: 'var(--ink-4)' }}
                  onMouseOver={e => period !== p && (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseOut={e => period !== p && (e.currentTarget.style.color = 'var(--ink-4)')}>
                  {p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-line" />

            {/* Year dropdown — always visible */}
            <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
              className="text-sm px-4 py-2 rounded-xl font-medium outline-none cursor-pointer transition bg-paper-2 border border-line text-ink">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Month dropdown — visible for month & week */}
            {(period === 'month' || period === 'week') && (
              <select value={selMonth} onChange={e => { setSelMonth(Number(e.target.value)); setSelWeek(0) }}
                className="text-sm px-4 py-2 rounded-xl font-medium outline-none cursor-pointer transition bg-paper-2 border border-line text-ink">
                {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            )}

            {/* Week dropdown — visible for week only */}
            {period === 'week' && (
              <select value={selWeek} onChange={e => setSelWeek(Number(e.target.value))}
                className="text-sm px-4 py-2 rounded-xl font-medium outline-none cursor-pointer transition bg-paper-2 border border-line text-ink">
                {weeksInMonth(selYear, selMonth).map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
            <Link
              to="/pendapatan"
              className="rounded-xl border border-line bg-surface px-2 py-2.5 text-center text-[11px] font-semibold leading-tight text-ink"
            >
              Pendapatan
            </Link>
            <Link
              to="/harga-tbs"
              className="rounded-xl border border-line bg-surface px-2 py-2.5 text-center text-[11px] font-semibold leading-tight text-ink"
            >
              Harga TBS
            </Link>
            <Link
              to="/keuangan"
              className="rounded-xl border border-emerald-soft bg-emerald-tint px-2 py-2.5 text-center text-[11px] font-semibold leading-tight text-emerald"
            >
              Keuangan
            </Link>
          </div>
        </div>

        {trialBannerRemaining != null ? <TrialBanner trialRemaining={trialBannerRemaining} /> : null}

        {import.meta.env.DEV && devSubscriptionEnforcement != null ? (
          <div
            className="rounded-xl border border-line bg-surface px-3 py-2 text-[11px] font-mono text-ink-3"
            title="Nilai dari GET /api/health — samakan dengan SUBSCRIPTION_ENFORCEMENT di backend (BE-01)."
          >
            Dev: subscription_enforcement={String(devSubscriptionEnforcement)}
          </div>
        ) : null}

        <OnboardingWizard open={showOnboardingWizard} onComplete={completeOnboarding} />

        {/* ── Lahan tabs ── */}
        {data && data.lahan_list.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button onClick={() => setLahanId('')}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition"
              style={lahanId === ''
                ? { background: 'var(--emerald-soft)', border: '1px solid var(--emerald)', color: 'var(--emerald)' }
                : { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
              Semua Kebun
            </button>
            {data.lahan_list.map((l: LahanInfo, i: number) => (
              <button key={l.id_lahan} onClick={() => setLahanId(l.id_lahan)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap"
                style={lahanId === l.id_lahan
                  ? { background: `${LINE_COLORS[i % LINE_COLORS.length]}18`, border: `1px solid ${LINE_COLORS[i % LINE_COLORS.length]}55`, color: LINE_COLORS[i % LINE_COLORS.length] }
                  : { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
                {l.nama_kebun}
                <span className="ml-1.5 text-xs opacity-60">{l.luas_ha} ha</span>
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-sm text-ink-4">Memuat data...</div>
        )}

        {data && !loading && data.lahan_list?.length === 0 && (
          <div className="rounded-3xl p-12 text-center border border-emerald-soft bg-emerald-tint">
            <div className="text-6xl mb-6 opacity-80">🌴</div>
            <div className="max-w-xs mx-auto">
              <h2 className="text-ink font-bold text-xl mb-2">Mulai Isi Data Kebun</h2>
              <p className="text-sm mb-8 text-ink-3">
                Tambahkan data kebun dulu supaya panen, biaya, dan jadwal bisa langsung terlihat.
              </p>
              <Link to="/lahan/add"
                className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-paper bg-ink transition hover:bg-emerald-2">
                + Tambah Lahan Kebun
              </Link>
            </div>
          </div>
        )}

        {data && !loading && data.lahan_list?.length > 0 && (
          <>
            <section className="rounded-xl-1 border border-emerald-soft bg-emerald-tint p-5 md:p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">Hari ini yang perlu dilihat</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Mulai dari 4 hal ini dulu.</h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-ink-3">
                  Ringkasan ini dibuat lebih sederhana untuk pengguna baru: cek kebun, panen, biaya, lalu laporan.
                </p>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {todayFocusCards.map(card => (
                  <article key={card.label} className="rounded-xl-1 border border-line bg-surface p-4 shadow-card-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald">{card.label}</p>
                    <h3 className="mt-2 text-base font-semibold text-ink">{card.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-ink-3">{card.copy}</p>
                    <Link to={card.to} className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-emerald-soft bg-emerald-tint px-3 text-sm font-semibold text-emerald transition hover:bg-emerald-soft">
                      {card.cta}
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {!hasAnyOperationalRecord && (
              <section className="rounded-xl-1 border border-line bg-surface p-5 md:p-6 shadow-card-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra">Data masih kosong</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Dashboard akan lebih berguna setelah panen atau biaya pertama dicatat.</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-3">
                  Kebun sudah ada. Langkah berikutnya adalah mencatat panen pertama atau biaya perawatan supaya grafik, hasil bersih, dan laporan mulai muncul.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link to="/panen/add" className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-paper transition hover:bg-emerald-2">Catat Panen Pertama</Link>
                  <Link to="/perawatan/add" className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:bg-paper-2">Catat Biaya Perawatan</Link>
                </div>
              </section>
            )}

            {!isStandalonePWA && (
              <section className="rounded-xl-1 border border-line bg-surface p-6 md:p-8 shadow-card">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] mb-4 border border-emerald-soft bg-emerald-tint text-emerald">
                  Ringkasan Kebun
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-ink leading-tight mb-3">
                  Semua keadaan kebun bisa dilihat lebih cepat di sini.
                </h2>
                <p className="max-w-3xl text-sm md:text-base leading-7 text-ink-3">
                  Lihat hasil panen, harga, biaya, dan jadwal kerja dalam satu halaman.
                  Jadi Anda lebih cepat tahu bagian mana yang bagus, mana yang menekan hasil, dan apa yang perlu dikerjakan berikutnya.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  <SnapshotPill
                    label="Untung Bersih"
                    value={`${performanceSummary.marginPct.toFixed(1)}%`}
                    hint={data.net_income >= 0 ? 'Masih bagus dibanding uang masuk periode ini.' : 'Biaya lebih besar dari hasil bersih.'}
                    accent={data.net_income >= 0 ? 'var(--emerald)' : 'var(--terra)'}
                  />
                  <SnapshotPill
                    label="Harga Rata-rata"
                    value={`${fmtRupiahFull(performanceSummary.avgHargaAll)}/kg`}
                    hint={`Harga terakhir ${data.last_harga_per_kg > 0 ? `${rupiah(data.last_harga_per_kg)}/kg` : 'belum tersedia'}`}
                    accent="#b45309"
                  />
                  <SnapshotPill
                    label="Biaya per Ton"
                    value={fmtRupiahFull(performanceSummary.biayaPerTon)}
                    hint="Mudah melihat biaya untuk tiap ton hasil panen."
                    accent="var(--terra)"
                  />
                  <SnapshotPill
                    label="Jadwal Dekat"
                    value={`${performanceSummary.totalUpcoming} jadwal`}
                    hint={performanceSummary.nearestUpcoming ? `Paling dekat ${fmtDateShortWithYear(performanceSummary.nearestUpcoming.tanggal)}` : 'Belum ada jadwal terdekat.'}
                    accent="#0284c7"
                  />
                </div>
              </section>
            )}

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
              {statCards.map(c => (
                <PremiumStatCard key={c.label} {...c} />
              ))}
            </div>

            {/* ── Line chart ── */}
            {(() => {
              const m = selectedMetricMeta

              const MetricTooltip = ({ active, payload, label }: ChartTooltipArgs) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-xl p-4 text-sm shadow-card border border-line bg-surface">
                    <div className="mb-2 font-semibold text-ink">{label}</div>
                    {payload.map((p) => (
                      <div key={p.name} className="mb-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-ink-3">{p.name}:</span>
                        <span className="font-medium text-ink">{m.fmt(Number(p.value))}</span>
                      </div>
                    ))}
                    {!isMultiLahanPerformance && (
                      <div className="mt-2 rounded-xl border border-line bg-paper-2 px-3 py-2 text-xs text-ink-3">
                        Rata-rata: <span className="font-medium text-ink">{m.fmt(performanceAverage)}</span>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div className="rounded-xl-1 p-5 md:p-6 bg-surface border border-line shadow-card">
                  {/* header */}
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="font-semibold text-ink text-lg">Grafik Panen</div>
                      <div className="mt-1 text-xs text-ink-4">
                        {selectedLahanName} · {dashboardPeriodLabel}
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-ink-3">
                        Lihat titik paling tinggi lalu bandingkan dengan garis rata-rata supaya cepat tahu kapan hasil panen sedang bagus atau turun.
                      </div>
                    </div>
                    {/* metric tabs */}
                    <div className="flex gap-1 flex-wrap">
                      {PERFORMANCE_METRICS.map(mx => (
                        <button key={mx.key} onClick={() => setMetric(mx.key)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                          style={metric === mx.key
                            ? { background: `${mx.color}18`, border: `1px solid ${mx.color}55`, color: mx.color }
                            : { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-4)' }}
                          onMouseOver={e => metric !== mx.key && (e.currentTarget.style.color = 'var(--ink)')}
                          onMouseOut={e => metric !== mx.key && (e.currentTarget.style.color = 'var(--ink-4)')}>
                          {mx.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                    <SnapshotPill
                      label={`Nilai ${m.label}`}
                      value={m.fmt(Number(performanceSummary.latestPoint?.[metric] ?? 0))}
                      hint="Nilai terbaru pada grafik ini."
                      accent={m.color}
                    />
                    <SnapshotPill
                      label="Titik Tertinggi"
                      value={peakMetricPoint?.label ?? '-'}
                      hint={peakMetricPoint ? `${m.label} tertinggi ${m.fmt(peakMetricPoint[metric])}` : 'Belum ada data tertinggi.'}
                      accent={m.color}
                    />
                    <SnapshotPill
                      label="Perkiraan Berikutnya"
                      value={estimasiPanen > 0 ? fmtRupiahFull(estimasiPanen) : '-'}
                      hint={`Berdasar rata-rata ${data.avg_ton_per_period.toFixed(2)} ton tiap periode`}
                      accent="var(--emerald)"
                    />
                    <SnapshotPill
                      label="Jumlah Kebun"
                      value={`${data.lahan_list.length} lokasi`}
                      hint={lahanId ? 'Sekarang sedang lihat satu kebun.' : 'Sekarang sedang lihat semua kebun.'}
                      accent="#0284c7"
                    />
                  </div>

                  {chartRows.length === 0 ? (
                    <div className="flex items-center justify-center h-52 text-sm text-ink-4">
                      Belum ada data.
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-line bg-paper-2 p-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Rata-rata</div>
                          <div className="mt-1 text-lg font-semibold text-ink">
                            {isMultiLahanPerformance ? 'Per kebun' : m.fmt(performanceAverage)}
                          </div>
                          <div className="mt-1 text-xs text-ink-4">
                            {isMultiLahanPerformance ? 'Sedang membandingkan semua kebun.' : 'Sebagai patokan selama periode yang dipilih.'}
                          </div>
                        </div>
                        <div className="rounded-xl border border-line bg-paper-2 p-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Titik Tertinggi</div>
                          <div className="mt-1 text-lg font-semibold text-ink">{peakMetricPoint?.label ?? '-'}</div>
                          <div className="mt-1 text-xs text-ink-4">
                            {peakMetricPoint ? `${m.label} tertinggi ${m.fmt(peakMetricPoint[metric])}` : 'Belum ada data puncak.'}
                          </div>
                        </div>
                        <div className="rounded-xl border border-line bg-paper-2 p-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Nilai Terakhir</div>
                          <div className="mt-1 text-lg font-semibold text-ink">
                            {m.fmt(Number(performanceSummary.latestPoint?.[metric] ?? 0))}
                          </div>
                          <div className="mt-1 text-xs text-ink-4">
                            Dibanding data sebelumnya: {fmtDelta(percentChange(Number(performanceSummary.latestPoint?.[metric] ?? 0), Number(performanceSummary.previousPoint?.[metric] ?? 0)))}
                          </div>
                        </div>
                      </div>

                      <ResponsiveContainer width="100%" height={isMultiLahanPerformance ? 320 : 340}>
                        {isMultiLahanPerformance ? (
                          <LineChart data={chartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e7e2d4" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7b8a83' }} axisLine={false} tickLine={false} />
                            <YAxis
                              tickFormatter={(value: number) => fmtMetricAxis(value, metric)}
                              tick={{ fontSize: metricAxisWidth(metric) > 52 ? 10 : 11, fill: '#7b8a83' }}
                              axisLine={false}
                              tickLine={false}
                              width={metricAxisWidth(metric)}
                            />
                            <Tooltip content={<MetricTooltip />} />
                            {lahanNames.map((name, i) => (
                              <Line key={name} type="monotone" dataKey={name} name={name}
                                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                                strokeWidth={3}
                                strokeDasharray={LINE_DASH_PATTERNS[i % LINE_DASH_PATTERNS.length]}
                                dot={{ r: 3, strokeWidth: 2, fill: '#ffffff', stroke: LINE_COLORS[i % LINE_COLORS.length] }}
                                activeDot={{ r: 5 }} />
                            ))}
                            <Legend iconType="circle" iconSize={8}
                              wrapperStyle={{ fontSize: 11, color: '#7b8a83', paddingTop: 16 }} />
                          </LineChart>
                        ) : (
                          <AreaChart data={chartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
                            <defs>
                              <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={m.color} stopOpacity={0.22} />
                                <stop offset="70%" stopColor={m.color} stopOpacity={0.05} />
                                <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e7e2d4" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7b8a83' }} axisLine={false} tickLine={false} />
                            <YAxis
                              tickFormatter={(value: number) => fmtMetricAxis(value, metric)}
                              tick={{ fontSize: metricAxisWidth(metric) > 52 ? 10 : 11, fill: '#7b8a83' }}
                              axisLine={false}
                              tickLine={false}
                              width={metricAxisWidth(metric)}
                            />
                            <Tooltip content={<MetricTooltip />} />
                            <ReferenceLine
                              y={performanceAverage}
                              stroke="#b0a98d"
                              strokeDasharray="6 6"
                              label={{ value: 'Rata-rata', position: 'insideTopRight', fill: '#7b8a83', fontSize: 11 }}
                            />
                            <Area
                              type="monotone"
                              dataKey={metric}
                              name={m.label}
                              stroke={m.color}
                              strokeWidth={3.5}
                              fill="url(#performanceFill)"
                              dot={{ r: 3, strokeWidth: 2, fill: '#ffffff', stroke: m.color }}
                              activeDot={{ r: 6, fill: m.color, stroke: '#ffffff', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>

                      <div className="mt-4 rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink-3">
                        {peakMetricPoint
                          ? `${m.label} paling tinggi ada pada ${peakMetricPoint.label}. Gunakan waktu itu untuk melihat pola panen, tenaga kerja, dan harga jual yang paling baik.`
                          : 'Ringkasan ini akan muncul setelah data panen mulai terisi.'}
                      </div>
                    </>
                  )}
                </div>
              )
            })()}

            {/* ── Bottom row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Jadwal mendatang */}
              <div className="rounded-xl-1 p-5 bg-surface border border-line shadow-card">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-ink text-lg">Jadwal Kerja Berikutnya</div>
                    <div className="text-xs mt-1 text-ink-4">
                      {performanceSummary.totalUpcoming > 0
                        ? `${performanceSummary.totalUpcoming} jadwal sudah dibuat`
                        : 'Belum ada jadwal yang dibuat'}
                    </div>
                  </div>
                  <div className="rounded-full px-3 py-1 text-xs font-medium border border-emerald-soft bg-emerald-tint text-emerald">
                    Jadwal Kebun
                  </div>
                </div>
                {data.upcoming_perawatan.length === 0 ? (
                  <div className="text-sm py-6 text-center text-ink-4">
                    Tidak ada jadwal mendatang.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.upcoming_perawatan.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-xl p-3 bg-paper-2 border border-line"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-1.5 h-12 rounded-full flex-shrink-0"
                            style={{ backgroundColor: UP_COLORS[i % UP_COLORS.length] }} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-ink truncate">
                              {JENIS_LABEL[item.jenis_perawatan] ?? item.jenis_perawatan.replace(/_/g,' ')}
                              {item.nama_blok ? ` – ${item.nama_blok}` : ''}
                            </div>
                            {item.keterangan && (
                              <div className="text-xs truncate mt-1 text-ink-4">{item.keterangan}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-semibold" style={{ color: UP_COLORS[i % UP_COLORS.length] }}>{fmtDateShortWithYear(item.tanggal)}</div>
                          <div className="text-[11px] mt-1 text-ink-4">Agenda #{i + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Harga TBS & estimasi */}
              <div className="rounded-xl-1 p-5 bg-surface border border-line shadow-card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-ink text-lg mb-1">Harga TBS Terakhir</div>
                    <div className="text-xs text-ink-4">{selectedLahanName}</div>
                  </div>
                  <div className="rounded-full px-3 py-1 text-xs font-medium border border-emerald-soft bg-emerald-tint text-emerald">
                    Harga Terkini
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-ink mb-1">
                  {data.last_harga_per_kg > 0
                    ? `Rp ${data.last_harga_per_kg.toLocaleString('id-ID')} / kg`
                    : '–'}
                </div>
                <div className="text-xs mb-5 text-ink-4">
                  Berdasarkan panen terakhir yang tercatat
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <SnapshotPill
                    label="Perkiraan Panen"
                    value={estimasiPanen > 0 ? fmtRupiahFull(estimasiPanen) : '-'}
                    hint="Perkiraan nilai panen berikutnya"
                    accent="var(--emerald)"
                  />
                  <SnapshotPill
                    label="Rata-rata Produksi"
                    value={fmtTonCompact(data.avg_ton_per_period)}
                    hint={period === 'week' ? 'per hari' : period === 'month' ? 'per minggu' : 'per bulan'}
                    accent="#0284c7"
                  />
                </div>

                <div className="border-t border-line pt-4">
                  <div className="text-xs mb-1 text-ink-4">Baca singkat:</div>
                  <p className="text-sm leading-6 text-ink-3">
                    {data.last_harga_per_kg > performanceSummary.avgHargaAll
                      ? 'Harga terakhir ada di atas rata-rata. Hasil jual sedang cukup baik.'
                      : 'Harga terakhir masih di bawah rata-rata. Cek lagi biaya dan waktu panen berikutnya.'}
                  </p>
                </div>
              </div>
            </div>

            <section className="rounded-xl-1 p-5 md:p-6 bg-surface border border-line shadow-card">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] mb-1 text-ink-4">Lihat Tiap Kebun</p>
                  <h2 className="text-xl md:text-2xl font-semibold text-ink">Ringkasan tiap kebun</h2>
                  <p className="text-sm mt-1 text-ink-3">
                    Lihat kebun mana yang hasilnya bagus dan mana yang perlu dicek lagi.
                  </p>
                </div>
                <div className="rounded-full px-3 py-1 text-xs font-medium border border-line bg-paper-2 text-ink-3">
                  Data terbaru
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {estateExecutiveCards.map((estate, index) => {
                  const accent = index === 0 ? '#22c55e' : index === 1 ? '#38bdf8' : index === 2 ? '#f59e0b' : '#a78bfa'
                  const statusTone = estate.status === 'Bagus'
                    ? { color: 'var(--emerald)', bg: 'var(--emerald-soft)' }
                    : estate.status === 'Cukup'
                      ? { color: '#b45309', bg: 'rgba(180,83,9,0.08)' }
                      : { color: 'var(--terra)', bg: 'var(--terra-soft)' }
                  return (
                    <div
                      key={estate.id_lahan}
                      className="relative overflow-hidden rounded-xl-1 p-5 bg-surface border border-line shadow-card-sm"
                    >
                      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl-1" style={{ background: accent }} />
                      <div className="pt-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-ink">{estate.nama_kebun}</p>
                          <p className="text-xs mt-1 text-ink-4">{estate.luas_ha} ha · {estate.panenCount} panen terbaru</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-ink">{estate.score}</div>
                          <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold mt-1" style={{ color: statusTone.color, background: statusTone.bg }}>
                            {estate.status}
                          </span>
                        </div>
                      </div>

                      <div className="h-2 rounded-full overflow-hidden mb-4 bg-paper-2">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, estate.score)}%`, background: accent }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <SnapshotPill
                          label="Pendapatan"
                          value={fmtRupiahFull(estate.pendapatan)}
                          hint={`${fmtRupiahFull(estate.revenuePerHa)}/ha`}
                          accent={accent}
                        />
                        <SnapshotPill
                          label="Bersih"
                          value={fmtRupiahFull(estate.bersih)}
                          hint={`${fmtRupiahFull(estate.netPerHa)}/ha`}
                          accent={estate.bersih >= 0 ? 'var(--emerald)' : 'var(--terra)'}
                        />
                        <SnapshotPill
                          label="Volume"
                          value={fmtTonCompact(estate.beratTon)}
                          hint={`${fmtTonCompact(estate.avgTonPerPanen)} per panen`}
                          accent="#0284c7"
                        />
                        <SnapshotPill
                          label="Perawatan"
                          value={`${estate.perawatanCount} kegiatan`}
                          hint={estate.biayaRawat > 0 ? fmtRupiahFull(estate.biayaRawat) : 'Belum ada biaya'}
                          accent="#b45309"
                        />
                      </div>

                      <p className="text-sm leading-6 text-ink-3">
                        {estate.status === 'Bagus'
                          ? 'Kebun ini sedang bagus. Pola kerja dan hasilnya bisa dijadikan contoh.'
                          : estate.status === 'Cukup'
                            ? 'Hasilnya cukup baik, tapi masih bisa ditingkatkan lagi.'
                            : 'Kebun ini perlu dicek lagi. Lihat panen, biaya rawat, dan hasil per hektarenya.'}
                      </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ── Biaya Perawatan Trend ── */}
            {data && data.recent_perawatan && data.recent_perawatan.length > 0 && (
              <div className="rounded-xl-1 p-5 md:p-6 bg-surface border border-line shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="font-semibold text-ink">Grafik Biaya Perawatan</div>
                    <div className="text-xs mt-0.5 text-ink-4">
                      {selectedLahanName} · {dashboardPeriodLabel}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-ink-3">
                      Batang menunjukkan biaya bahan dan pekerja. Garis kuning menunjukkan total biaya tiap tanggal.
                    </div>
                  </div>
                  {/* metric tabs */}
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { key: 'all', label: 'Semua', color: '#d97706' },
                      { key: 'material', label: 'Material', color: '#f97316' },
                      { key: 'pekerja', label: 'Pekerja', color: '#7c3aed' },
                      { key: 'total', label: 'Total', color: '#b45309' },
                    ].map(mx => (
                      <button key={mx.key} onClick={() => setPerawatanMetric(mx.key as PerawatanMetric)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        style={perawatanMetric === mx.key
                          ? { background: `${mx.color}18`, border: `1px solid ${mx.color}55`, color: mx.color }
                          : { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-4)' }}
                        onMouseOver={e => perawatanMetric !== mx.key && (e.currentTarget.style.color = 'var(--ink)')}
                        onMouseOut={e => perawatanMetric !== mx.key && (e.currentTarget.style.color = 'var(--ink-4)')}>
                        {mx.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-line bg-paper-2 p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Rata-rata</div>
                    <div className="mt-1 text-base font-semibold leading-tight text-ink break-words md:text-lg">{fmtRupiahFull(perawatanAverage)}</div>
                    <div className="mt-1 text-xs text-ink-4">Patokan biaya rawat tiap tanggal pada periode ini.</div>
                  </div>
                  <div className="rounded-xl border border-line bg-paper-2 p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Tanggal Tersibuk</div>
                    <div className="mt-1 text-lg font-semibold text-ink">
                      {perawatanChartRows.reduce((best, row) => row.agendaCount > best.agendaCount ? row : best, perawatanChartRows[0])?.label || '-'}
                    </div>
                    <div className="mt-1 text-xs text-ink-4">Tanggal dengan pekerjaan rawat paling banyak.</div>
                  </div>
                  <div className="rounded-xl border border-line bg-paper-2 p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Biaya Tertinggi</div>
                    <div className="mt-1 text-base font-semibold leading-tight text-ink break-words md:text-lg">
                      {fmtRupiahFull(Math.max(...perawatanChartRows.map(row => row.total), 0))}
                    </div>
                    <div className="mt-1 text-xs text-ink-4">Bandingkan hari ini dengan hasil panen sesudahnya.</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={perawatanChartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="maintenanceTotalFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e7e2d4" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7b8a83' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(value: number) => fmtBiayaAxis(value)}
                      tick={{ fontSize: 10, fill: '#7b8a83' }}
                      axisLine={false}
                      tickLine={false}
                      width={96}
                    />
                    <Tooltip
                      content={({ active, payload, label }: ChartTooltipArgs) => {
                        if (!active || !payload?.length) return null
                        const row = payload[0]?.payload
                        const bahanPreview = row?.bahanPreview ?? []
                        return (
                          <div className="rounded-xl border border-line bg-surface p-4 text-sm shadow-card">
                            <div className="font-semibold text-ink">{label}</div>
                            <div className="mt-1 text-xs text-ink-4">{row?.agendaCount || 0} pekerjaan rawat</div>
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-ink-3">Material</span>
                                <span className="font-medium text-ink">{rupiah(Number(row?.material || 0))}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-ink-3">Pekerja</span>
                                <span className="font-medium text-ink">{rupiah(Number(row?.pekerja || 0))}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-ink-3">Total</span>
                                <span className="font-medium text-ink">{rupiah(Number(row?.total || 0))}</span>
                              </div>
                            </div>
                            {bahanPreview.length > 0 && (
                              <div className="mt-3 rounded-xl border border-line bg-paper-2 px-3 py-2 text-xs text-ink-3">
                                Bahan utama: <span className="text-ink">{bahanPreview.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#7b8a83', paddingTop: 16 }} />
                    <ReferenceLine
                      y={perawatanAverage}
                      stroke="#b0a98d"
                      strokeDasharray="6 6"
                      label={{ value: 'Rata-rata', position: 'insideTopRight', fill: '#7b8a83', fontSize: 11 }}
                    />
                    {(perawatanMetric === 'all' || perawatanMetric === 'material') && (
                      <Bar
                        dataKey="material"
                        name="Biaya Material"
                        stackId={perawatanMetric === 'all' ? 'biaya' : undefined}
                        fill="#f97316"
                        radius={perawatanMetric === 'all' ? [8, 8, 0, 0] : [12, 12, 0, 0]}
                        barSize={24}
                      />
                    )}
                    {(perawatanMetric === 'all' || perawatanMetric === 'pekerja') && (
                      <Bar
                        dataKey="pekerja"
                        name="Biaya Pekerja"
                        stackId={perawatanMetric === 'all' ? 'biaya' : undefined}
                        fill="#7c3aed"
                        radius={perawatanMetric === 'all' ? [8, 8, 0, 0] : [12, 12, 0, 0]}
                        barSize={24}
                      />
                    )}
                    {(perawatanMetric === 'all' || perawatanMetric === 'total') && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="Total Biaya"
                          legendType="none"
                          stroke="none"
                          fill="url(#maintenanceTotalFill)"
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total Biaya"
                          stroke="#d97706"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                          activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="mt-4 rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink-3">
                  Perhatikan tanggal saat garis total jauh di atas rata-rata. Biasanya di situlah biaya bahan, pekerja, atau banyaknya pekerjaan sedang naik.
                </div>
              </div>
            )}

            {/* ── Recent panen ── */}
            <div className="rounded-xl-1 p-4 md:p-5" style={CARD}>
              <h2 className="font-semibold text-ink mb-4">Riwayat Panen Terbaru</h2>

              {/* Mobile card list */}
              <div className="md:hidden space-y-2">
                {data.recent_panen.length === 0 ? (
                  <p className="text-center py-6 text-sm text-ink-4">Belum ada data panen.</p>
                ) : data.recent_panen.map(p => {
                  const kebun = data.lahan_list.find(l => l.id_lahan === p.id_lahan)?.nama_kebun ?? `Lahan ${p.id_lahan}`
                  return (
                    <div key={p.id_panen} className="rounded-xl p-3 bg-paper-2 border border-line">
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <div className="text-xs font-semibold text-ink">{fmtDateFull(p.tanggal_panen)}</div>
                          <div className="text-[11px] mt-0.5 text-ink-4">{kebun}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openView(p)} className="p-1.5 rounded-lg" style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(p.id_panen)} className="p-1.5 rounded-lg" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Berat</div>
                          <div className="text-xs font-semibold text-ink">{parseFloat(p.berat_ton.toFixed(2))} ton</div>
                        </div>
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Pendapatan</div>
                          <div className="text-xs font-semibold text-emerald">{rupiah(p.total_pendapatan)}</div>
                        </div>
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Bersih</div>
                          <div className="text-xs font-semibold text-emerald">{rupiah(p.hasil_bersih)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {['Tanggal','Kebun','Janjang','Berat (kg)','Berat (ton)','Rata/Janjang','Harga/kg','Pendapatan','Bersih',''].map(h => (
                        <th key={h} className="pb-2 px-2 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap text-ink-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_panen.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-10 text-sm text-ink-4">
                          Belum ada data panen.
                        </td>
                      </tr>
                    ) : data.recent_panen.map(p => (
                      <tr key={p.id_panen} className="border-b border-line transition hover:bg-paper-2">
                        <td className="px-2 py-3 whitespace-nowrap text-xs text-ink-3">
                          {fmtDateFull(p.tanggal_panen)}
                        </td>
                        <td className="px-2 py-3 text-xs text-ink-4">
                          {data.lahan_list.find(l => l.id_lahan === p.id_lahan)?.nama_kebun ?? `Lahan ${p.id_lahan}`}
                        </td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.jumlah_janjang}</td>
                        <td className="px-2 py-3 text-xs font-medium text-ink">{p.berat_kg.toLocaleString('id-ID', {maximumFractionDigits: 2})}</td>
                        <td className="px-2 py-3 text-xs font-medium text-ink">{parseFloat(p.berat_ton.toFixed(2))}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{(p.berat_kg / p.jumlah_janjang).toFixed(2)} kg</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{rupiah(p.harga_per_kg)}</td>
                        <td className="px-2 py-3 text-xs font-medium text-emerald">{rupiah(p.total_pendapatan)}</td>
                        <td className="px-2 py-3 text-xs font-medium text-emerald">{rupiah(p.hasil_bersih)}</td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openView(p)} title="Detail"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button onClick={() => openEdit(p)} title="Edit"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(p.id_panen)} title="Hapus"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Recent perawatan ── */}
            <div className="rounded-xl-1 p-4 md:p-5" style={CARD}>
              <h2 className="font-semibold text-ink mb-4">Riwayat Perawatan Terbaru</h2>

              {/* Mobile card list */}
              <div className="md:hidden space-y-2">
                {(!data.recent_perawatan || data.recent_perawatan.length === 0) ? (
                  <p className="text-center py-6 text-sm text-ink-4">Belum ada data perawatan.</p>
                ) : data.recent_perawatan.map((p: PerawatanRow) => {
                  const kebun = data.lahan_list.find(l => l.id_lahan === p.id_lahan)?.nama_kebun ?? `Lahan ${p.id_lahan}`
                  return (
                    <div key={p.id_perawatan} className="rounded-xl p-3 bg-paper-2 border border-line">
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <div className="text-xs font-semibold text-ink">{JENIS_LABEL[p.jenis_perawatan] ?? p.jenis_perawatan.replace(/_/g,' ')}</div>
                          <div className="text-[11px] mt-0.5 text-ink-4">{fmtDateShort(p.tanggal_perawatan)} · {kebun}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openViewPerawatan(p)} className="p-1.5 rounded-lg" style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button onClick={() => openEditPerawatan(p)} className="p-1.5 rounded-lg" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDeletePerawatan(p.id_perawatan)} className="p-1.5 rounded-lg" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Material</div>
                          <div className="text-xs font-semibold text-ink">{p.total_harga_material ? rupiah(p.total_harga_material) : '-'}</div>
                        </div>
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Total Biaya</div>
                          <div className="text-xs font-semibold text-terra">{p.biaya ? rupiah(p.biaya) : '-'}</div>
                        </div>
                      </div>
                      {p.bahan && <div className="mt-2 text-[11px] text-ink-4">{p.bahan}</div>}
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {['Tanggal','Kebun','Jenis','Bahan','Jumlah','Satuan','Harga/Satuan','Total Material','Biaya Pekerja','Total Biaya','Keterangan',''].map(h => (
                        <th key={h} className="pb-2 px-2 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap text-ink-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!data.recent_perawatan || data.recent_perawatan.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-10 text-sm text-ink-4">
                          Belum ada data perawatan.
                        </td>
                      </tr>
                    ) : data.recent_perawatan.map((p: PerawatanRow) => (
                      <tr key={p.id_perawatan} className="border-b border-line transition hover:bg-paper-2">
                        <td className="px-2 py-3 whitespace-nowrap text-xs text-ink-3">
                          {fmtDateFull(p.tanggal_perawatan)}
                        </td>
                        <td className="px-2 py-3 text-xs text-ink-4">
                          {data.lahan_list.find(l => l.id_lahan === p.id_lahan)?.nama_kebun ?? `Lahan ${p.id_lahan}`}
                        </td>
                        <td className="px-2 py-3 text-xs font-medium text-ink">{p.jenis_perawatan}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.bahan}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.jumlah || '-'}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.satuan || '-'}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.harga_satuan ? rupiah(p.harga_satuan) : '-'}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.total_harga_material ? rupiah(p.total_harga_material) : '-'}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.biaya_pekerja ? rupiah(p.biaya_pekerja) : '-'}</td>
                        <td className="px-2 py-3 text-xs font-medium text-terra">{p.biaya ? rupiah(p.biaya) : '-'}</td>
                        <td className="px-2 py-3 text-xs truncate text-ink-4">{p.keterangan || '-'}</td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openViewPerawatan(p)} title="Detail"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button onClick={() => openEditPerawatan(p)} title="Edit"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => handleDeletePerawatan(p.id_perawatan)} title="Hapus"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Recent pendapatan ── */}
            <div className="rounded-xl-1 p-4 md:p-5" style={CARD}>
              <h2 className="font-semibold text-ink mb-4">Riwayat Pendapatan Terbaru</h2>

              {/* Mobile card list */}
              <div className="md:hidden space-y-2">
                {(!data.recent_pendapatan || data.recent_pendapatan.length === 0) ? (
                  <p className="text-center py-6 text-sm text-ink-4">Belum ada data pendapatan.</p>
                ) : data.recent_pendapatan.map((p: PendapatanRow) => {
                  const kebun = data.lahan_list.find(l => l.id_lahan === p.id_lahan)?.nama_kebun ?? `Lahan ${p.id_lahan}`
                  return (
                    <div key={p.id_pendapatan} className="rounded-xl p-3 bg-paper-2 border border-line">
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <div className="text-xs font-semibold text-ink">{fmtDateFull(p.tanggal_panen)}</div>
                          <div className="text-[11px] mt-0.5 text-ink-4">{kebun}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openViewPendapatan(p)} className="p-1.5 rounded-lg" style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button onClick={() => openEditPendapatan(p)} className="p-1.5 rounded-lg" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDeletePendapatan(p.id_pendapatan)} className="p-1.5 rounded-lg" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Berat</div>
                          <div className="text-xs font-semibold text-ink">{p.total_berat_kg ? (p.total_berat_kg/1000).toFixed(2) + ' ton' : '-'}</div>
                        </div>
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Kotor</div>
                          <div className="text-xs font-semibold text-emerald">{rupiah(p.pendapatan_kotor)}</div>
                        </div>
                        <div className="rounded-lg p-2 bg-surface">
                          <div className="text-[10px] mb-0.5 text-ink-4">Bersih</div>
                          <div className="text-xs font-semibold text-emerald">{rupiah(p.pendapatan_bersih)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {['Tanggal','Kebun','Berat (kg)','Janjang','Pendapatan Kotor','Biaya Total','Bersih','Catatan',''].map(h => (
                        <th key={h} className="pb-2 px-2 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap text-ink-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!data.recent_pendapatan || data.recent_pendapatan.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-10 text-sm text-ink-4">
                          Belum ada data pendapatan.
                        </td>
                      </tr>
                    ) : data.recent_pendapatan.map((p: PendapatanRow) => (
                      <tr key={p.id_pendapatan} className="border-b border-line transition hover:bg-paper-2">
                        <td className="px-2 py-3 whitespace-nowrap text-xs text-ink-3">
                          {fmtDateFull(p.tanggal_panen)}
                        </td>
                        <td className="px-2 py-3 text-xs text-ink-4">
                          {data.lahan_list.find(l => l.id_lahan === p.id_lahan)?.nama_kebun ?? `Lahan ${p.id_lahan}`}
                        </td>
                        <td className="px-2 py-3 text-xs font-medium text-ink">{p.total_berat_kg.toLocaleString('id-ID', {maximumFractionDigits: 2})}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{p.total_janjang || '-'}</td>
                        <td className="px-2 py-3 text-xs font-medium text-emerald">{rupiah(p.pendapatan_kotor)}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{rupiah(p.biaya_total)}</td>
                        <td className="px-2 py-3 text-xs font-medium text-emerald">{rupiah(p.pendapatan_bersih)}</td>
                        <td className="px-2 py-3 text-xs truncate text-ink-4">{p.catatan || '-'}</td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openViewPendapatan(p)} title="Detail"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button onClick={() => openEditPendapatan(p)} title="Edit"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => handleDeletePendapatan(p.id_pendapatan)} title="Hapus"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Recent lahan ── */}
            <div className="rounded-xl-1 p-4 md:p-5" style={CARD}>
              <h2 className="font-semibold text-ink mb-4">Riwayat Lahan Terbaru</h2>

              {/* Mobile card list */}
              <div className="md:hidden space-y-2">
                {(!data.lahan_list || data.lahan_list.length === 0) ? (
                  <p className="text-center py-6 text-sm text-ink-4">Belum ada data lahan.</p>
                ) : data.lahan_list.map(l => (
                  <div key={l.id_lahan} className="rounded-xl p-3 bg-paper-2 border border-line">
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="text-xs font-semibold text-ink">{l.nama_kebun}</div>
                        <div className="text-[11px] mt-0.5 text-ink-4">{l.lokasi || '-'}</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openViewLahan(l)} className="p-1.5 rounded-lg" style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button onClick={() => openEditLahan(l)} className="p-1.5 rounded-lg" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDeleteLahan(l.id_lahan)} className="p-1.5 rounded-lg" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg p-2 bg-surface">
                        <div className="text-[10px] mb-0.5 text-ink-4">Luas</div>
                        <div className="text-xs font-semibold text-ink">{l.luas_ha} Ha</div>
                      </div>
                      <div className="rounded-lg p-2 bg-surface">
                        <div className="text-[10px] mb-0.5 text-ink-4">Pohon</div>
                        <div className="text-xs font-semibold text-ink">{l.jumlah_pohon}</div>
                      </div>
                      <div className="rounded-lg p-2 bg-surface">
                        <div className="text-[10px] mb-0.5 text-ink-4">Tanam</div>
                        <div className="text-xs font-semibold text-ink">{l.tahun_tanam}</div>
                      </div>
                    </div>
                    {l.jenis_bibit && <div className="mt-2 text-[11px] text-ink-4">{l.jenis_bibit}</div>}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {['Nama Kebun','Jenis Bibit','Lokasi','Luas (Ha)','Jumlah Pohon','Tahun Tanam',''].map(h => (
                        <th key={h} className="pb-2 px-2 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap text-ink-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!data.lahan_list || data.lahan_list.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-sm text-ink-4">
                          Belum ada data lahan.
                        </td>
                      </tr>
                    ) : data.lahan_list.map(l => (
                      <tr key={l.id_lahan} className="border-b border-line transition hover:bg-paper-2">
                        <td className="px-2 py-3 text-xs font-medium text-ink">{l.nama_kebun}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{l.jenis_bibit || '-'}</td>
                        <td className="px-2 py-3 text-xs truncate text-ink-4">{l.lokasi || '-'}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{l.luas_ha} Ha</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{l.jumlah_pohon}</td>
                        <td className="px-2 py-3 text-xs text-ink-3">{l.tahun_tanam}</td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openViewLahan(l)} title="Detail"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#0284c7', background: 'rgba(2,132,199,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(2,132,199,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button onClick={() => openEditLahan(l)} title="Edit"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteLahan(l.id_lahan)} title="Hapus"
                              className="p-1.5 rounded-lg transition"
                              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.18)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* ── Panen Modal (View / Edit) ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-ink font-bold text-lg">
                {modal.mode === 'view' ? 'Detail Panen' : 'Edit Data Panen'}
              </h2>
              <button onClick={() => setModal(null)} className="text-ink-4 hover:text-ink transition text-xl leading-none">×</button>
            </div>

            {modal.mode === 'view' ? (
              /* ── View mode ── */
              <div className="space-y-3">
                {[
                  { label: 'Tanggal Panen',  value: fmtDateFull(modal.row.tanggal_panen) },
                  { label: 'Kebun',          value: data?.lahan_list.find(l => l.id_lahan === modal.row.id_lahan)?.nama_kebun ?? `Lahan ${modal.row.id_lahan}` },
                  { label: 'Luas Panen',     value: `${modal.row.luas_panen_ha} Ha` },
                  { label: 'Jumlah Janjang', value: `${modal.row.jumlah_janjang} janjang` },
                  { label: 'Berat',          value: `${modal.row.berat_kg} kg (${modal.row.berat_ton.toFixed(3)} ton)` },
                  { label: 'Harga / kg',     value: rupiah(modal.row.harga_per_kg) },
                  { label: 'Biaya Panen',    value: rupiah(modal.row.biaya_panen) },
                  { label: 'Total Pendapatan', value: rupiah(modal.row.total_pendapatan), color: 'var(--emerald)' },
                  { label: 'Pendapatan Bersih', value: rupiah(modal.row.hasil_bersih), color: 'var(--emerald)' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2"
                    style={{ borderBottom: '1px solid var(--line)' }}>
                    <span className="text-sm text-ink-3">{r.label}</span>
                    <span className="text-sm font-medium" style={{ color: r.color ?? 'var(--ink)' }}>{r.value}</span>
                  </div>
                ))}
                <button onClick={() => openEdit(modal.row)}
                  className="w-full mt-3 py-2.5 text-sm font-bold rounded-xl transition"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>
                  Edit Data Ini
                </button>
              </div>
            ) : (
              /* ── Edit mode ── */
              (() => {
                const INP = 'w-full px-3 py-2.5 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
                const LBL = 'block text-xs font-medium uppercase tracking-wide mb-1' as const
                const LBL_ST = { color: 'var(--ink-3)' }
                const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                  setEditForm(f => ({ ...f, [k]: e.target.value }))
                const cef = (k: 'harga_per_kg' | 'biaya_panen') => (value: string) =>
                  setEditForm(f => ({ ...f, [k]: value }))
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Tanggal Panen</label>
                        <input type="date" className={INP} value={editForm.tanggal_panen} onChange={ef('tanggal_panen')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Luas Panen (Ha)</label>
                        <input type="number" step="0.01" className={INP} value={editForm.luas_panen_ha} onChange={ef('luas_panen_ha')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Jumlah Janjang</label>
                        <input type="number" className={INP} value={editForm.jumlah_janjang} onChange={ef('jumlah_janjang')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Berat (kg)</label>
                        <input type="number" step="0.01" className={INP} value={editForm.berat_kg} onChange={ef('berat_kg')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Harga / kg (Rp)</label>
                        <RupiahInput className={INP} value={editForm.harga_per_kg} onValueChange={cef('harga_per_kg')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Biaya Panen (Rp)</label>
                        <RupiahInput className={INP} value={editForm.biaya_panen} onValueChange={cef('biaya_panen')} />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setModal(null)}
                        className="flex-1 py-2.5 text-sm font-medium rounded-xl transition"
                        style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
                        Batal
                      </button>
                      <button onClick={handleSaveEdit} disabled={saving}
                        className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}

      {/* ── Lahan Modal (View / Edit) ── */}
      {lahanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setLahanModal(null) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-ink font-bold text-lg">
                {lahanModal.mode === 'view' ? 'Detail Lahan' : 'Edit Data Lahan'}
              </h2>
              <button onClick={() => setLahanModal(null)} className="text-ink-4 hover:text-ink transition text-xl leading-none">×</button>
            </div>

            {lahanModal.mode === 'view' ? (
              <div className="space-y-3">
                {[
                  { label: 'Nama Kebun',     value: lahanModal.row.nama_kebun },
                  { label: 'Jenis Bibit',    value: lahanModal.row.jenis_bibit },
                  { label: 'Lokasi',         value: lahanModal.row.lokasi },
                  { label: 'Luas',           value: `${lahanModal.row.luas_ha} Ha` },
                  { label: 'Jumlah Pohon',   value: `${lahanModal.row.jumlah_pohon} pohon` },
                  { label: 'Tahun Tanam',    value: String(lahanModal.row.tahun_tanam) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2"
                    style={{ borderBottom: '1px solid var(--line)' }}>
                    <span className="text-sm text-ink-3">{r.label}</span>
                    <span className="text-sm font-medium text-ink">{r.value}</span>
                  </div>
                ))}
                <button onClick={() => openEditLahan(lahanModal.row)}
                  className="w-full mt-3 py-2.5 text-sm font-bold rounded-xl transition"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>
                  Edit Data Ini
                </button>
              </div>
            ) : (
              (() => {
                const INP = 'w-full px-3 py-2.5 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
                const LBL = 'block text-xs font-medium uppercase tracking-wide mb-1' as const
                const LBL_ST = { color: 'var(--ink-3)' }
                const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
                  setLahanEditForm(f => ({ ...f, [k]: e.target.value }))
                return (
                  <div className="space-y-3">
                    <div>
                      <label className={LBL} style={LBL_ST}>Nama Kebun</label>
                      <input type="text" className={INP} value={lahanEditForm.nama_kebun} onChange={ef('nama_kebun')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Jenis Bibit</label>
                        <input type="text" className={INP} value={lahanEditForm.jenis_bibit} onChange={ef('jenis_bibit')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Lokasi</label>
                        <input type="text" className={INP} value={lahanEditForm.lokasi} onChange={ef('lokasi')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Luas (Ha)</label>
                        <input type="number" step="0.01" className={INP} value={lahanEditForm.luas_ha} onChange={ef('luas_ha')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Jumlah Pohon</label>
                        <input type="number" className={INP} value={lahanEditForm.jumlah_pohon} onChange={ef('jumlah_pohon')} />
                      </div>
                    </div>
                    <div>
                      <label className={LBL} style={LBL_ST}>Tahun Tanam</label>
                      <input type="number" className={INP} value={lahanEditForm.tahun_tanam} onChange={ef('tahun_tanam')} />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setLahanModal(null)}
                        className="flex-1 py-2.5 text-sm font-medium rounded-xl transition"
                        style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
                        Batal
                      </button>
                      <button onClick={handleSaveEditLahan} disabled={saving}
                        className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}

      {/* ── Perawatan Modal (View / Edit) ── */}
      {perawatanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setPerawatanModal(null) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-ink font-bold text-lg">
                {perawatanModal.mode === 'view' ? 'Detail Perawatan' : 'Edit Data Perawatan'}
              </h2>
              <button onClick={() => setPerawatanModal(null)} className="text-ink-4 hover:text-ink transition text-xl leading-none">×</button>
            </div>

            {perawatanModal.mode === 'view' ? (
              <div className="space-y-3">
                {[
                  { label: 'Jenis Perawatan', value: perawatanModal.row.jenis_perawatan },
                  { label: 'Bahan',           value: perawatanModal.row.bahan },
                  { label: 'Jumlah',         value: `${perawatanModal.row.jumlah} ${perawatanModal.row.satuan}` },
                  { label: 'Harga/Satuan',   value: rupiah(perawatanModal.row.harga_satuan) },
                  { label: 'Total Material',  value: rupiah(perawatanModal.row.total_harga_material) },
                  { label: 'Biaya Pekerja',   value: rupiah(perawatanModal.row.biaya_pekerja) },
                  { label: 'Total Biaya',     value: rupiah(perawatanModal.row.biaya), color: 'var(--terra)' },
                  { label: 'Keterangan',      value: perawatanModal.row.keterangan || '-' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2"
                    style={{ borderBottom: '1px solid var(--line)' }}>
                    <span className="text-sm text-ink-3">{r.label}</span>
                    <span className="text-sm font-medium" style={{ color: r.color ?? 'var(--ink)' }}>{r.value}</span>
                  </div>
                ))}
                <button onClick={() => openEditPerawatan(perawatanModal.row)}
                  className="w-full mt-3 py-2.5 text-sm font-bold rounded-xl transition"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>
                  Edit Data Ini
                </button>
              </div>
            ) : (
              (() => {
                const INP = 'w-full px-3 py-2.5 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
                const LBL = 'block text-xs font-medium uppercase tracking-wide mb-1' as const
                const LBL_ST = { color: 'var(--ink-3)' }
                const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                  setPerawatanEditForm(f => ({ ...f, [k]: e.target.value }))
                const cef = (k: 'harga_satuan' | 'biaya_pekerja') => (value: string) =>
                  setPerawatanEditForm(f => ({ ...f, [k]: value }))
                return (
                  <div className="space-y-3">
                    <div>
                      <label className={LBL} style={LBL_ST}>Jenis Perawatan</label>
                      <input type="text" className={INP} value={perawatanEditForm.jenis_perawatan} onChange={ef('jenis_perawatan')} />
                    </div>
                    <div>
                      <label className={LBL} style={LBL_ST}>Bahan</label>
                      <input type="text" className={INP} value={perawatanEditForm.bahan} onChange={ef('bahan')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Jumlah</label>
                        <input type="number" step="0.01" className={INP} value={perawatanEditForm.jumlah} onChange={ef('jumlah')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Satuan</label>
                        <select className={INP} value={perawatanEditForm.satuan} onChange={ef('satuan')}>
                          <option value="kg">kg</option>
                          <option value="liter">liter</option>
                          <option value="gram">gram</option>
                          <option value="unit">unit</option>
                          <option value="zak">zak</option>
                          <option value="botol">botol</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Harga/Satuan (Rp)</label>
                        <RupiahInput className={INP} value={perawatanEditForm.harga_satuan} onValueChange={cef('harga_satuan')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Biaya Pekerja (Rp)</label>
                        <RupiahInput className={INP} value={perawatanEditForm.biaya_pekerja} onValueChange={cef('biaya_pekerja')} />
                      </div>
                    </div>
                    <div>
                      <label className={LBL} style={LBL_ST}>Keterangan</label>
                      <input type="text" className={INP} value={perawatanEditForm.keterangan || ''} onChange={ef('keterangan')} />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setPerawatanModal(null)}
                        className="flex-1 py-2.5 text-sm font-medium rounded-xl transition"
                        style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
                        Batal
                      </button>
                      <button onClick={handleSaveEditPerawatan} disabled={saving}
                        className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}

      {/* ── Pendapatan Modal (View / Edit) ── */}
      {pendapatanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setPendapatanModal(null) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-ink font-bold text-lg">
                {pendapatanModal.mode === 'view' ? 'Detail Pendapatan' : 'Edit Data Pendapatan'}
              </h2>
              <button onClick={() => setPendapatanModal(null)} className="text-ink-4 hover:text-ink transition text-xl leading-none">×</button>
            </div>

            {pendapatanModal.mode === 'view' ? (
              <div className="space-y-3">
                {[
                  { label: 'Tanggal',             value: fmtDateFull(pendapatanModal.row.tanggal_panen) },
                  { label: 'Berat TBS',           value: `${pendapatanModal.row.total_berat_kg} kg` },
                  { label: 'Janjang',             value: `${pendapatanModal.row.total_janjang} janjang` },
                  { label: 'Pendapatan Kotor',    value: rupiah(pendapatanModal.row.pendapatan_kotor), color: 'var(--emerald)' },
                  { label: 'Biaya Total',         value: rupiah(pendapatanModal.row.biaya_total), color: 'var(--terra)' },
                  { label: 'Pendapatan Bersih',   value: rupiah(pendapatanModal.row.pendapatan_bersih), color: 'var(--emerald)' },
                  { label: 'Catatan',             value: pendapatanModal.row.catatan || '-' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2"
                    style={{ borderBottom: '1px solid var(--line)' }}>
                    <span className="text-sm text-ink-3">{r.label}</span>
                    <span className="text-sm font-medium" style={{ color: r.color ?? 'var(--ink)' }}>{r.value}</span>
                  </div>
                ))}
                <button onClick={() => openEditPendapatan(pendapatanModal.row)}
                  className="w-full mt-3 py-2.5 text-sm font-bold rounded-xl transition"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>
                  Edit Data Ini
                </button>
              </div>
            ) : (
              (() => {
                const INP = 'w-full px-3 py-2.5 bg-paper-2 border border-line rounded-xl text-ink text-sm placeholder-ink-4 focus:outline-none focus:border-emerald transition'
                const LBL = 'block text-xs font-medium uppercase tracking-wide mb-1' as const
                const LBL_ST = { color: 'var(--ink-3)' }
                const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPendapatanEditForm(f => ({ ...f, [k]: e.target.value }))
                const cef = (k: 'pendapatan_kotor' | 'biaya_total') => (value: string) =>
                  setPendapatanEditForm(f => ({ ...f, [k]: value }))
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Berat TBS (kg)</label>
                        <input type="number" step="0.01" className={INP} value={pendapatanEditForm.total_berat_kg} onChange={ef('total_berat_kg')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Janjang</label>
                        <input type="number" className={INP} value={pendapatanEditForm.total_janjang} onChange={ef('total_janjang')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LBL} style={LBL_ST}>Pendapatan Kotor (Rp)</label>
                        <RupiahInput className={INP} value={pendapatanEditForm.pendapatan_kotor} onValueChange={cef('pendapatan_kotor')} />
                      </div>
                      <div>
                        <label className={LBL} style={LBL_ST}>Biaya Total (Rp)</label>
                        <RupiahInput className={INP} value={pendapatanEditForm.biaya_total} onValueChange={cef('biaya_total')} />
                      </div>
                    </div>
                    <div>
                      <label className={LBL} style={LBL_ST}>Catatan</label>
                      <input type="text" className={INP} value={pendapatanEditForm.catatan || ''} onChange={ef('catatan')} />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setPendapatanModal(null)}
                        className="flex-1 py-2.5 text-sm font-medium rounded-xl transition"
                        style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
                        Batal
                      </button>
                      <button onClick={handleSaveEditPendapatan} disabled={saving}
                        className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
