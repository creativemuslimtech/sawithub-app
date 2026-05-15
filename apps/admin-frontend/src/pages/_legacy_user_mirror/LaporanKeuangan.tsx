import { useEffect, useMemo, useState } from 'react'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as XLSX from 'xlsx'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import ShellUserMenu from '../components/ShellUserMenu'
import { shellTonalButtonClass } from '../constants/appShellChrome'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatRupiahDisplay } from '../utils/rupiah'
import { trackEvent, GAEvents } from '../utils/analytics'
import useStandalonePWA from '../hooks/useStandalonePWA'

interface LaporanSummary {
  total_ton: number
  total_pendapatan: number
  total_biaya_panen: number
  total_biaya_perawatan: number
  hasil_bersih: number
  avg_harga_per_kg: number
  jumlah_panen: number
  rata_produktivitas: number
}

interface ChartPoint {
  label: string
  total_ton: number
  pendapatan: number
  biaya_panen: number
  biaya_perawatan: number
  hasil_bersih: number
  harga_avg: number
  per_lahan: Record<string, number>
}

interface FarmRanking {
  id_lahan: string
  nama_kebun: string
  total_ton: number
  luas_ha: number
  produktivitas: number
  total_pendapatan: number
  hasil_bersih: number
  jumlah_panen: number
}

interface DetailRow {
  id_panen: string
  tanggal_panen: string
  nama_kebun: string
  luas_panen_ha: number
  jumlah_janjang: number
  berat_kg: number
  berat_ton: number
  harga_per_kg: number
  total_pendapatan: number
  biaya_panen: number
  hasil_bersih: number
  produktivitas: number
  catatan: string
}

interface LaporanData {
  summary: LaporanSummary
  chart: ChartPoint[]
  ranking: FarmRanking[]
  detail: DetailRow[]
}

interface LahanOption {
  id_lahan: string
  nama_kebun: string
}

interface ExportEmailResponse {
  message: string
  email: string
}

type Period = 'week' | 'month' | 'year'
type ChartMode = 'produksi' | 'cashflow' | 'biaya'
type ExportFormat = 'pdf' | 'xlsx'

type TooltipRow = {
  name?: string | number
  color?: string
  value?: number | string | readonly (number | string)[]
  payload?: {
    agenda?: string
    bahanPreview?: string[]
    label?: string
    produksi?: number
    pendapatan?: number
    biayaPanen?: number
    biayaPerawatan?: number
    totalBiaya?: number
    labaBersih?: number
    hargaAvg?: number
  }
}

type TooltipArgs = {
  active?: boolean
  label?: string | number
  payload?: readonly TooltipRow[]
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).reverse()

const fmtRp = formatRupiahDisplay
const fmtRpFull = formatRupiahDisplay

const fmtNum = (value: number, decimals = 2) =>
  value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

const fmtTon = (value: number) => `${fmtNum(value, value >= 10 ? 1 : 2)} ton`
const safeDivide = (value: number, divisor: number) => divisor === 0 ? 0 : value / divisor

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

const fmtDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

const fmtDate = (value: string) => {
  const parsed = new Date(value)
  return isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      })
}

const fmtAxisRupiah = (value: number) => fmtRp(value)
const fmtAxisTon = (value: number) => `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })} t`

const sanitizeFilePart = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()

function reportExportUserIdToken(seed: string): string {
  const s = seed.trim() || 'anon'
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

const buildReportFileName = (format: ExportFormat, userId: string, username: string, lahanName: string, periodLabel: string) => {
  const dateStamp = new Date().toISOString().slice(0, 10)
  const idSeed = userId.trim() || username.trim() || 'anon'
  const base = [
    'laporan-keuangan',
    `uid-${reportExportUserIdToken(idSeed)}`,
    sanitizeFilePart(username || 'user'),
    sanitizeFilePart(lahanName || 'semua-kebun'),
    sanitizeFilePart(periodLabel || 'periode'),
    dateStamp,
  ].filter(Boolean).join('-')

  return `${base}.${format}`
}

async function blobToBase64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error) {
    const responseMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage.trim()
    }

    const message = (error as { message?: string }).message
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }
  }

  return fallback
}

function deltaTone(value: number) {
  if (value > 0) return { color: '#86efac', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.22)' }
  if (value < 0) return { color: '#fda4af', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.22)' }
  return { color: 'rgba(226,232,240,0.72)', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.22)' }
}

function SnapshotPill({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(7,12,16,0.42)',
        border: `1px solid ${accent}22`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 16px 34px ${accent}0d`,
      }}
    >
      <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: `${accent}d9` }}>{label}</p>
      <p className="text-[15px] font-semibold leading-tight text-white break-words sm:text-base md:text-lg">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/48">{hint}</p>
    </div>
  )
}

function FinanceMetricCard({
  label,
  shortLabel,
  value,
  sub,
  accent,
  icon,
  delta,
  insight,
}: {
  label: string
  shortLabel: string
  value: string
  sub: string
  accent: string
  icon: string
  delta: number
  insight: string
}) {
  const tone = deltaTone(delta)

  return (
    <div
      className="group relative overflow-hidden rounded-[28px] p-4 md:p-5"
      style={{
        background: `linear-gradient(155deg, ${accent}18 0%, rgba(8,12,18,0.92) 68%)`,
        border: `1px solid ${accent}2f`,
        boxShadow: `0 20px 44px ${accent}10`,
      }}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl" style={{ background: `${accent}26` }} />
      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: `${accent}dd` }}>
                <span className="md:hidden">{shortLabel}</span>
                <span className="hidden md:inline">{label}</span>
              </p>
              <p className="mt-1 text-lg font-semibold leading-tight text-white break-words md:text-xl xl:text-[1.45rem] 2xl:text-[1.6rem]">{value}</p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{ color: tone.color, background: tone.bg, borderColor: tone.border }}
          >
            {fmtDelta(delta)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-white/58 md:text-sm">{sub}</p>
        <p className="mt-3 text-[11px] leading-relaxed text-white/38">{insight}</p>
      </div>
    </div>
  )
}

function RankingCard({ farm, rank }: { farm: FarmRanking; rank: number }) {
  const accent = rank === 1 ? '#22c55e' : rank === 2 ? '#38bdf8' : rank === 3 ? '#f59e0b' : '#a78bfa'
  const margin = safeDivide(farm.hasil_bersih, farm.total_pendapatan) * 100

  return (
    <div
      className="rounded-[26px] p-5"
      style={{
        background: `linear-gradient(155deg, ${accent}12 0%, rgba(8,12,18,0.92) 66%)`,
        border: `1px solid ${accent}24`,
        boxShadow: `0 18px 44px ${accent}0f`,
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: `${accent}22`, color: accent }}
            >
              {rank}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{farm.nama_kebun}</p>
              <p className="mt-1 text-xs text-white/42">{fmtNum(farm.luas_ha)} ha · {farm.jumlah_panen} kali panen</p>
            </div>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.72)' }}
        >
          {fmtNum(margin, 1)}% untung
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SnapshotPill
          label="Produksi"
          value={fmtTon(farm.total_ton)}
          hint={`${fmtNum(farm.produktivitas)} t/ha`}
          accent="#22c55e"
        />
        <SnapshotPill
          label="Pendapatan"
          value={fmtRpFull(farm.total_pendapatan)}
          hint={`${fmtRpFull(safeDivide(farm.total_pendapatan, farm.jumlah_panen || 1))} per panen`}
          accent="#facc15"
        />
        <SnapshotPill
          label="Bersih"
          value={fmtRpFull(farm.hasil_bersih)}
          hint={`${fmtRpFull(safeDivide(farm.hasil_bersih, farm.luas_ha || 1))}/ha`}
          accent={farm.hasil_bersih >= 0 ? '#4ade80' : '#f87171'}
        />
        <SnapshotPill
          label="Fokus"
          value={farm.produktivitas >= 1 ? 'Cukup bagus' : 'Perlu naik'}
          hint={farm.produktivitas >= 1 ? 'Hasil kebun cukup baik.' : 'Cek panen dan biaya lagi.'}
          accent="#38bdf8"
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-[30px] py-20 text-center"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="mb-3 text-4xl">🌾</p>
      <p className="mb-1 font-medium text-white/55">Belum ada data laporan pada periode ini</p>
      <p className="text-sm text-white/28">Coba ganti periode, pilih kebun lain, atau lengkapi data panen terlebih dahulu.</p>
    </div>
  )
}

export default function LaporanKeuangan() {
  const { user } = useAuth()
  const isStandalonePWA = useStandalonePWA()
  const [period, setPeriod] = useState<Period>('month')
  const [lahanId, setLahanId] = useState('')
  const [selYear, setSelYear] = useState(new Date().getFullYear())
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1)
  const [selWeek, setSelWeek] = useState(0)
  const [data, setData] = useState<LaporanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lahans, setLahans] = useState<LahanOption[]>([])
  const [chartMode, setChartMode] = useState<ChartMode>('cashflow')
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  useEffect(() => {
    api.get('/lahan').then((response) => setLahans(response.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ period, year: String(selYear) })
    if (period !== 'year') params.append('month', String(selMonth))
    if (period === 'week') params.append('week', String(selWeek))
    if (lahanId) params.append('lahan_id', lahanId)

    const fetchReport = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/laporan-keuangan?${params}`)
        setData(response.data)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchReport()
  }, [period, selYear, selMonth, selWeek, lahanId])

  const selectedLahanName = lahans.find((item) => item.id_lahan === lahanId)?.nama_kebun ?? 'Semua Kebun'
  const exportRecipient = user?.email?.trim() || 'email akun Anda'
  const periodLabel = period === 'week'
    ? `${MONTHS[selMonth - 1]} ${selYear} · Minggu ${selWeek + 1}`
    : period === 'month'
      ? `${MONTHS[selMonth - 1]} ${selYear}`
      : `Tahun ${selYear}`

  const chartRows = useMemo(() => {
    if (!data?.chart?.length) return []
    return data.chart.map((point) => ({
      label: point.label,
      produksi: point.total_ton,
      pendapatan: point.pendapatan,
      biayaPanen: point.biaya_panen,
      biayaPerawatan: point.biaya_perawatan,
      totalBiaya: point.biaya_panen + point.biaya_perawatan,
      labaBersih: point.hasil_bersih,
      hargaAvg: point.harga_avg,
    }))
  }, [data])

  const financeSummary = useMemo(() => {
    if (!data) {
      return {
        totalBiaya: 0,
        marginPct: 0,
        biayaPerTon: 0,
        avgNetPerPanen: 0,
        latestPoint: null as ChartPoint | null,
        previousPoint: null as ChartPoint | null,
        bestPoint: null as ChartPoint | null,
        weakestPoint: null as ChartPoint | null,
        highestPricePoint: null as ChartPoint | null,
        focusFarm: null as FarmRanking | null,
        pressureFarm: null as FarmRanking | null,
      }
    }

    const totalBiaya = data.summary.total_biaya_panen + data.summary.total_biaya_perawatan
    const latestPoint = data.chart[data.chart.length - 1] ?? null
    const previousPoint = data.chart[data.chart.length - 2] ?? null
    const bestPoint = data.chart.reduce<ChartPoint | null>((best, point) => {
      if (!best || point.hasil_bersih > best.hasil_bersih) return point
      return best
    }, null)
    const weakestPoint = data.chart.reduce<ChartPoint | null>((worst, point) => {
      if (!worst || point.hasil_bersih < worst.hasil_bersih) return point
      return worst
    }, null)
    const highestPricePoint = data.chart.reduce<ChartPoint | null>((best, point) => {
      if (!best || point.harga_avg > best.harga_avg) return point
      return best
    }, null)
    const focusFarm = data.ranking[0] ?? null
    const pressureFarm = [...data.ranking]
      .sort((a, b) => safeDivide(a.hasil_bersih, a.total_pendapatan || 1) - safeDivide(b.hasil_bersih, b.total_pendapatan || 1))[0] ?? null

    return {
      totalBiaya,
      marginPct: safeDivide(data.summary.hasil_bersih, data.summary.total_pendapatan) * 100,
      biayaPerTon: safeDivide(totalBiaya, data.summary.total_ton),
      avgNetPerPanen: safeDivide(data.summary.hasil_bersih, data.summary.jumlah_panen),
      latestPoint,
      previousPoint,
      bestPoint,
      weakestPoint,
      highestPricePoint,
      focusFarm,
      pressureFarm,
    }
  }, [data])

  const chartAverage = useMemo(() => {
    if (!chartRows.length) return 0
    const key = chartMode === 'produksi' ? 'produksi' : chartMode === 'cashflow' ? 'labaBersih' : 'totalBiaya'
    return chartRows.reduce((sum, row) => sum + row[key], 0) / chartRows.length
  }, [chartRows, chartMode])

  const financeInsights = useMemo(() => ([
    financeSummary.bestPoint
      ? `Untung bersih paling tinggi ada di ${financeSummary.bestPoint.label} sebesar ${fmtRpFull(financeSummary.bestPoint.hasil_bersih)}.`
      : 'Belum ada data untung bersih tertinggi.',
    financeSummary.weakestPoint
      ? `Bagian yang paling lemah ada di ${financeSummary.weakestPoint.label}. Cek lagi biaya panen, harga jual, dan hasil panennya.`
      : 'Belum ada bagian yang perlu dibandingkan.',
    financeSummary.focusFarm
      ? `${financeSummary.focusFarm.nama_kebun} paling bagus saat ini dengan hasil ${fmtTon(financeSummary.focusFarm.total_ton)} dan untung ${fmtNum(safeDivide(financeSummary.focusFarm.hasil_bersih, financeSummary.focusFarm.total_pendapatan) * 100, 1)}%.`
      : 'Belum ada kebun yang paling menonjol.',
    financeSummary.pressureFarm
      ? `${financeSummary.pressureFarm.nama_kebun} perlu dicek lagi karena hasil bersihnya paling kecil di antara kebun yang aktif.`
      : 'Belum ada tanda biaya yang terlalu menekan.',
  ]), [financeSummary])

  const metricCards = data ? [
    {
      label: 'Total Produksi',
      shortLabel: 'Produksi',
      value: fmtTon(data.summary.total_ton),
      sub: `${selectedLahanName} · ${periodLabel}`,
      accent: '#22c55e',
      icon: '🌾',
      delta: percentChange(financeSummary.latestPoint?.total_ton ?? 0, financeSummary.previousPoint?.total_ton ?? 0),
      insight: `Rata-rata hasil ${fmtNum(data.summary.rata_produktivitas)} t/ha dari ${data.summary.jumlah_panen} catatan panen.`,
    },
    {
      label: 'Pendapatan',
      shortLabel: 'Pendapatan',
      value: fmtRpFull(data.summary.total_pendapatan),
      sub: `${selectedLahanName} · ${periodLabel}`,
      accent: '#facc15',
      icon: '💰',
      delta: percentChange(financeSummary.latestPoint?.pendapatan ?? 0, financeSummary.previousPoint?.pendapatan ?? 0),
      insight: `Harga paling tinggi ada di ${financeSummary.highestPricePoint?.label ?? '-'} sebesar ${fmtRp(financeSummary.highestPricePoint?.harga_avg ?? 0)}/kg.`,
    },
    {
      label: 'Total Biaya',
      shortLabel: 'Biaya',
      value: fmtRpFull(financeSummary.totalBiaya),
      sub: `${selectedLahanName} · ${periodLabel}`,
      accent: '#f87171',
      icon: '🧾',
      delta: percentChange(
        (financeSummary.latestPoint?.biaya_panen ?? 0) + (financeSummary.latestPoint?.biaya_perawatan ?? 0),
        (financeSummary.previousPoint?.biaya_panen ?? 0) + (financeSummary.previousPoint?.biaya_perawatan ?? 0),
      ),
      insight: `Biaya sekitar ${fmtRpFull(financeSummary.biayaPerTon)} untuk tiap ton hasil.`,
    },
    {
      label: 'Laba Bersih',
      shortLabel: 'Bersih',
      value: fmtRpFull(data.summary.hasil_bersih),
      sub: `${selectedLahanName} · ${periodLabel}`,
      accent: data.summary.hasil_bersih >= 0 ? '#4ade80' : '#f87171',
      icon: data.summary.hasil_bersih >= 0 ? '📈' : '📉',
      delta: percentChange(financeSummary.latestPoint?.hasil_bersih ?? 0, financeSummary.previousPoint?.hasil_bersih ?? 0),
      insight: `Untung bersih saat ini ${financeSummary.marginPct.toFixed(1)}% dengan rata-rata ${fmtRpFull(financeSummary.avgNetPerPanen)} per panen.`,
    },
  ] : []

  const buildExcelBlob = () => {
    if (!data) return null
    const workbook = XLSX.utils.book_new()
    const generatedAt = new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    })
    const totalBiaya = data.summary.total_biaya_panen + data.summary.total_biaya_perawatan

    workbook.Props = {
      Title: `Laporan Keuangan ${selectedLahanName} • ${periodLabel}`,
      Subject: 'Ringkasan Keuangan SawitHub',
      Author: 'SawitHub',
      Company: 'SawitHub',
    }

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['Ringkasan Keuangan SawitHub'],
      [`Laporan Keuangan • ${selectedLahanName}`],
      [`Periode ${periodLabel}`],
      [`Disiapkan untuk ${user?.full_name || 'Pengguna'} (@${user?.username || 'user'})`],
      [`Dibuat pada ${generatedAt}`],
      [],
      ['Ringkasan Uang', 'Nilai Utama', 'Catatan Singkat'],
      ['Total Produksi', fmtTon(data.summary.total_ton), `${data.summary.jumlah_panen} catatan panen dengan hasil rata-rata ${fmtNum(data.summary.rata_produktivitas, 2)} t/ha.`],
      ['Total Pendapatan', fmtRpFull(data.summary.total_pendapatan), `Harga rata-rata periode ini ${fmtRp(data.summary.avg_harga_per_kg)}/kg.`],
      ['Total Biaya', fmtRpFull(totalBiaya), `Biaya panen ${fmtRpFull(data.summary.total_biaya_panen)} dan perawatan ${fmtRpFull(data.summary.total_biaya_perawatan)}.`],
      ['Hasil Bersih', fmtRpFull(data.summary.hasil_bersih), `Untung bersih ${financeSummary.marginPct.toFixed(1)}% untuk ${selectedLahanName}.`],
      [],
      ['Catatan Singkat'],
      ...financeInsights.map((insight) => [insight]),
    ])
    summarySheet['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 78 }]
    summarySheet['!merges'] = [
      XLSX.utils.decode_range('A1:C1'),
      XLSX.utils.decode_range('A2:C2'),
      XLSX.utils.decode_range('A3:C3'),
      XLSX.utils.decode_range('A4:C4'),
      XLSX.utils.decode_range('A5:C5'),
      XLSX.utils.decode_range('A13:C13'),
    ]
    financeInsights.forEach((_, index) => {
      summarySheet['!merges']?.push(XLSX.utils.decode_range(`A${14 + index}:C${14 + index}`))
    })
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan')

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(chartRows.map((row) => ({
      Periode: row.label,
      'Produksi (Ton)': fmtNum(row.produksi, 2),
      Pendapatan: fmtRp(row.pendapatan),
      'Biaya Panen': fmtRp(row.biayaPanen),
      'Biaya Perawatan': fmtRp(row.biayaPerawatan),
      'Total Biaya': fmtRp(row.totalBiaya),
      'Laba Bersih': fmtRp(row.labaBersih),
      'Harga Rata-rata/Kg': fmtRp(row.hargaAvg),
    }))), 'Tren Finansial')

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.ranking.map((row, index) => ({
      Peringkat: index + 1,
      Kebun: row.nama_kebun,
      'Luas (Ha)': fmtNum(row.luas_ha),
      'Jumlah Panen': row.jumlah_panen,
      'Total Ton': fmtNum(row.total_ton),
      'Produktivitas (T/Ha)': fmtNum(row.produktivitas),
      'Total Pendapatan': fmtRp(row.total_pendapatan),
      'Laba Bersih': fmtRp(row.hasil_bersih),
    }))), 'Urutan Kebun')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.detail.map((row) => ({
      Tanggal: row.tanggal_panen,
      Kebun: row.nama_kebun,
      'Luas (Ha)': fmtNum(row.luas_panen_ha),
      Janjang: row.jumlah_janjang,
      'Berat (Kg)': fmtNum(row.berat_kg),
      'Berat (Ton)': fmtNum(row.berat_ton, 4),
      'Harga/Kg': fmtRp(row.harga_per_kg),
      Pendapatan: fmtRp(row.total_pendapatan),
      'Biaya Panen': fmtRp(row.biaya_panen),
      'Laba Bersih': fmtRp(row.hasil_bersih),
      'Produktivitas (T/Ha)': fmtNum(row.produktivitas, 4),
      Catatan: row.catatan || '-',
    }))), 'Daftar Panen')

    const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  const buildPdfBlob = async () => {
    if (!data) return null
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const totalBiaya = data.summary.total_biaya_panen + data.summary.total_biaya_perawatan

    doc.setFillColor(9, 16, 14)
    doc.roundedRect(28, 28, pageWidth - 56, 168, 26, 26, 'F')
    doc.setDrawColor(42, 56, 48)
    doc.roundedRect(28, 28, pageWidth - 56, 168, 26, 26, 'S')

    doc.setFillColor(22, 163, 74)
    doc.roundedRect(48, 46, 160, 24, 12, 12, 'F')
    doc.setTextColor(232, 255, 240)
    doc.setFontSize(10)
    doc.text('RINGKASAN KEUANGAN', 60, 62)

    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.text('Laporan Keuangan SawitHub', 48, 102)

    doc.setFontSize(11)
    doc.setTextColor(195, 208, 202)
    const introLines = doc.splitTextToSize(
      `Disiapkan untuk ${user?.full_name || 'Pengguna'} (@${user?.username || 'user'}) • ${selectedLahanName} • ${periodLabel}. Laporan ini membantu melihat hasil panen, uang masuk, biaya, dan kebun yang paling bagus hasilnya.`,
      pageWidth - 104,
    )
    doc.text(introLines, 48, 128)

    const cards = [
      { label: 'Produksi', value: fmtTon(data.summary.total_ton), accent: [34, 197, 94] as const },
      { label: 'Pendapatan', value: fmtRpFull(data.summary.total_pendapatan), accent: [250, 204, 21] as const },
      { label: 'Total Biaya', value: fmtRpFull(totalBiaya), accent: [248, 113, 113] as const },
      { label: 'Laba Bersih', value: fmtRpFull(data.summary.hasil_bersih), accent: [56, 189, 248] as const },
    ]

    cards.forEach((card, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 42 + col * ((pageWidth - 96) / 2)
      const y = 220 + row * 88
      const width = (pageWidth - 112) / 2

      doc.setFillColor(12, 18, 20)
      doc.roundedRect(x, y, width, 72, 18, 18, 'F')
      doc.setDrawColor(card.accent[0], card.accent[1], card.accent[2])
      doc.roundedRect(x, y, width, 72, 18, 18, 'S')
      doc.setFontSize(10)
      doc.setTextColor(card.accent[0], card.accent[1], card.accent[2])
      doc.text(card.label.toUpperCase(), x + 16, y + 20)
      doc.setFontSize(18)
      doc.setTextColor(255, 255, 255)
      doc.text(card.value, x + 16, y + 46)
    })

    doc.setFillColor(12, 18, 20)
    doc.roundedRect(42, 410, pageWidth - 84, 126, 20, 20, 'F')
    doc.setDrawColor(55, 65, 81)
    doc.roundedRect(42, 410, pageWidth - 84, 126, 20, 20, 'S')
    doc.setFontSize(12)
    doc.setTextColor(173, 255, 214)
    doc.text('CATATAN SINGKAT', 58, 436)
    doc.setFontSize(11)
    doc.setTextColor(214, 223, 218)
    let insightY = 460
    financeInsights.slice(0, 4).forEach((insight, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${insight}`, pageWidth - 126)
      doc.text(lines, 58, insightY)
      insightY += lines.length * 14 + 6
    })

    autoTable(doc, {
      head: [['Kebun', 'Luas', 'Produksi', 'Pendapatan', 'Bersih']],
      body: data.ranking.slice(0, 5).map((farm) => [
        farm.nama_kebun,
        `${fmtNum(farm.luas_ha)} ha`,
        fmtTon(farm.total_ton),
        fmtRpFull(farm.total_pendapatan),
        fmtRpFull(farm.hasil_bersih),
      ]),
      startY: 560,
      margin: { left: 42, right: 42 },
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [236, 253, 245] },
      bodyStyles: { fillColor: [10, 15, 18], textColor: [229, 231, 235] },
      alternateRowStyles: { fillColor: [12, 18, 22] },
      styles: { fontSize: 9, cellPadding: 8 },
    })

    const nextY = ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 620) + 18
    autoTable(doc, {
      head: [['Tanggal', 'Kebun', 'Ton', 'Harga/Kg', 'Pendapatan', 'Biaya', 'Bersih']],
      body: data.detail.slice(0, 18).map((row) => [
        fmtDate(row.tanggal_panen),
        row.nama_kebun,
        fmtNum(row.berat_ton, 2),
        fmtRp(row.harga_per_kg),
        fmtRpFull(row.total_pendapatan),
        fmtRpFull(row.biaya_panen),
        fmtRpFull(row.hasil_bersih),
      ]),
      startY: nextY,
      margin: { left: 42, right: 42 },
      theme: 'grid',
      headStyles: { fillColor: [20, 32, 48], textColor: [236, 253, 245] },
      bodyStyles: { fillColor: [8, 12, 16], textColor: [229, 231, 235] },
      alternateRowStyles: { fillColor: [10, 15, 18] },
      styles: { fontSize: 8, cellPadding: 7 },
      didDrawPage: () => {
        doc.setFontSize(9)
        doc.setTextColor(148, 163, 184)
        doc.text(`SawitHub • ${selectedLahanName} • ${periodLabel}`, 42, doc.internal.pageSize.getHeight() - 22)
      },
    })
    return doc.output('blob')
  }

  const emailExportCopy = async (format: ExportFormat, filename: string, blob: Blob) => {
    const totalBiaya = (data?.summary.total_biaya_panen ?? 0) + (data?.summary.total_biaya_perawatan ?? 0)
    const contentBase64 = await blobToBase64(blob)

    const response = await api.post<ExportEmailResponse>('/laporan-keuangan/email-export', {
      format,
      filename,
      mime_type: blob.type,
      content_base64: contentBase64,
      period_label: periodLabel,
      lahan_name: selectedLahanName,
      insights: financeInsights,
      summary: {
        total_ton: fmtTon(data?.summary.total_ton ?? 0),
        total_pendapatan: fmtRpFull(data?.summary.total_pendapatan ?? 0),
        total_biaya: fmtRpFull(totalBiaya),
        hasil_bersih: fmtRpFull(data?.summary.hasil_bersih ?? 0),
      },
    })

    return response.data
  }

  const handleExport = async (format: ExportFormat) => {
    if (!data || exporting) return

    const filename = buildReportFileName(
      format,
      user?.user_id || user?.public_id || user?.username || '',
      user?.username || 'user',
      selectedLahanName,
      periodLabel,
    )
    const blob = format === 'xlsx' ? buildExcelBlob() : await buildPdfBlob()
    if (!blob) return

    // Track export action
    trackEvent(format === 'xlsx' ? GAEvents.EXPORT_EXCEL : GAEvents.EXPORT_PDF, {
      report_type: 'laporan_keuangan',
      period: period,
      lahan: selectedLahanName,
      export_format: format,
    })

    setExporting(format)
    saveAs(blob, filename)

    try {
      const emailResult = await emailExportCopy(format, filename, blob)
      const recipientEmail = emailResult.email?.trim() || exportRecipient

      // Track email send success
      trackEvent(GAEvents.SEND_EMAIL, {
        report_type: 'laporan_keuangan',
        export_format: format,
        delivery_method: 'email',
      })

      toast.success(`File ${format.toUpperCase()} berhasil diunduh dan dikirim ke ${recipientEmail}.`)
    } catch (error) {
      const detail = getErrorMessage(error, 'pengiriman email gagal').replace(/\.+$/, '')
      toast.error(`File ${format.toUpperCase()} sudah terunduh, tetapi ${detail}.`)
    } finally {
      setExporting(null)
    }
  }

  const hasData = !!(data?.detail?.length || data?.chart?.length || data?.ranking?.length)

  return (
    <AppLayout
      topbar={(
        <AppTopbar
          title="Laporan Keuangan"
          subtitle={`${selectedLahanName} · ${periodLabel}`}
          actions={<ShellUserMenu />}
        />
      )}
    >
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container space-y-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-white">Laporan Keuangan</h1>
            <p className="mt-1 text-sm text-white/45">
              Lihat uang masuk, uang keluar, dan hasil bersih tiap kebun dengan lebih mudah.
            </p>
          </div>

          <div
            className="rounded-[28px] p-4 md:p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <div
                  className="flex overflow-hidden rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {(['week', 'month', 'year'] as Period[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setPeriod(item)}
                      className="px-4 py-2 font-medium transition"
                      style={period === item
                        ? { background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }
                        : { color: 'rgba(255,255,255,0.48)' }}
                    >
                      {item === 'week' ? 'Minggu' : item === 'month' ? 'Bulan' : 'Tahun'}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-white/10" />

                <select
                  value={selYear}
                  onChange={(event) => setSelYear(Number(event.target.value))}
                  className="rounded-xl border px-4 py-2 text-sm font-medium text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year} style={{ background: '#0c1a0c' }}>{year}</option>
                  ))}
                </select>

                {period !== 'year' && (
                  <select
                    value={selMonth}
                    onChange={(event) => setSelMonth(Number(event.target.value))}
                    className="rounded-xl border px-4 py-2 text-sm font-medium text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1} style={{ background: '#0c1a0c' }}>{month}</option>
                    ))}
                  </select>
                )}

                {period === 'week' && (
                  <select
                    value={selWeek}
                    onChange={(event) => setSelWeek(Number(event.target.value))}
                    className="rounded-xl border px-4 py-2 text-sm font-medium text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {[0, 1, 2, 3, 4].map((week) => (
                      <option key={week} value={week} style={{ background: '#0c1a0c' }}>Minggu {week + 1}</option>
                    ))}
                  </select>
                )}

                <select
                  value={lahanId}
                  onChange={(event) => setLahanId(event.target.value)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <option value="" style={{ background: '#0c1a0c' }}>Semua Kebun</option>
                  {lahans.map((item) => (
                    <option key={item.id_lahan} value={item.id_lahan} style={{ background: '#0c1a0c' }}>
                      {item.nama_kebun}
                    </option>
                  ))}
                </select>
              </div>

              {data && (
                <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => void handleExport('xlsx')}
                    disabled={!!exporting}
                    title={`Unduh laporan Excel dan kirim salinannya ke ${exportRecipient}`}
                    className={shellTonalButtonClass}
                    style={{ background: 'rgba(16,185,129,0.14)', color: '#6ee7b7' }}
                  >
                    {exporting === 'xlsx' ? 'Mengirim Excel...' : 'Excel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExport('pdf')}
                    disabled={!!exporting}
                    title={`Unduh laporan PDF dan kirim salinannya ke ${exportRecipient}`}
                    className={shellTonalButtonClass}
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
                  >
                    {exporting === 'pdf' ? 'Mengirim PDF...' : 'PDF'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-[28px] bg-white/[0.04]" />
              ))}
            </div>
          ) : !hasData ? (
            <EmptyState />
          ) : (
            <>
              {!isStandalonePWA && (
                <section
                  className="relative overflow-hidden rounded-[32px] p-6 md:p-8"
                  style={{
                    background: 'linear-gradient(145deg, rgba(10,18,16,0.96) 0%, rgba(12,30,24,0.94) 48%, rgba(32,18,10,0.94) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 28px 90px rgba(0,0,0,0.26)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{
                      background: `
                        radial-gradient(circle at 16% 18%, rgba(34,197,94,0.16), transparent 26%),
                        radial-gradient(circle at 88% 22%, rgba(250,204,21,0.14), transparent 24%),
                        radial-gradient(circle at 72% 84%, rgba(56,189,248,0.12), transparent 24%)
                      `,
                    }}
                  />

                  <div className="relative">
                    <div>
                      <span
                        className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: '#d1fae5', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.24)' }}
                      >
                        Ringkasan Uang Kebun
                      </span>
                      <h2 className="mb-3 text-2xl font-semibold leading-tight text-white md:text-4xl">
                        Laporan uang kebun yang mudah dibaca.
                      </h2>
                      <p className="max-w-3xl text-sm leading-7 text-white/68 md:text-base">
                        Di sini Anda bisa melihat uang masuk, uang keluar, untung, dan kebun mana yang hasilnya paling baik atau perlu dicek lagi.
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <SnapshotPill
                          label="Untung Bersih"
                          value={`${financeSummary.marginPct.toFixed(1)}%`}
                          hint={financeSummary.marginPct >= 40 ? 'Untung masih bagus dibanding uang masuk.' : 'Biaya perlu dijaga supaya untung tidak turun.'}
                          accent={financeSummary.marginPct >= 40 ? '#4ade80' : '#f87171'}
                        />
                        <SnapshotPill
                          label="Biaya per Ton"
                          value={fmtRpFull(financeSummary.biayaPerTon)}
                          hint="Mudah melihat biaya untuk tiap ton hasil."
                          accent="#f87171"
                        />
                        <SnapshotPill
                          label="Harga Tertinggi"
                          value={fmtRp(financeSummary.highestPricePoint?.harga_avg ?? 0)}
                          hint={financeSummary.highestPricePoint ? `Terjadi pada ${financeSummary.highestPricePoint.label}` : 'Belum ada titik harga kuat.'}
                          accent="#facc15"
                        />
                        <SnapshotPill
                          label="Rata-rata Bersih"
                          value={fmtRpFull(financeSummary.avgNetPerPanen)}
                          hint="Rata-rata hasil bersih per catatan panen."
                          accent="#38bdf8"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card) => (
                  <FinanceMetricCard key={card.label} {...card} />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
                <section
                  className="rounded-[30px] p-5 md:p-6"
                  style={{
                    background: 'linear-gradient(150deg, rgba(255,255,255,0.04), rgba(5,10,14,0.92) 72%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">Grafik Keuangan</div>
                      <div className="mt-1 text-xs text-white/35">{selectedLahanName} · {periodLabel}</div>
                      <div className="mt-2 text-sm leading-relaxed text-white/58">
                        Pilih grafik sesuai yang ingin dilihat: hasil panen, uang, atau biaya.
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {([
                        { key: 'produksi', label: 'Produksi', color: '#22c55e' },
                        { key: 'cashflow', label: 'Uang', color: '#facc15' },
                        { key: 'biaya', label: 'Biaya', color: '#f87171' },
                      ] as { key: ChartMode; label: string; color: string }[]).map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setChartMode(item.key)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
                          style={chartMode === item.key
                            ? { background: `${item.color}22`, border: `1px solid ${item.color}55`, color: item.color }
                            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/7 bg-white/[0.03] p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Rata-rata</div>
                      <div className="mt-1 text-base font-semibold leading-tight text-white break-words md:text-lg">
                        {chartMode === 'produksi' ? fmtTon(chartAverage) : fmtRpFull(chartAverage)}
                      </div>
                      <div className="mt-1 text-xs text-white/42">Sebagai patokan selama periode yang dipilih.</div>
                    </div>
                    <div className="rounded-2xl border border-white/7 bg-white/[0.03] p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Waktu Terbaik</div>
                      <div className="mt-1 text-lg font-semibold text-white">{financeSummary.bestPoint?.label ?? '-'}</div>
                      <div className="mt-1 text-xs text-white/42">
                        {financeSummary.bestPoint ? `Untung bersih ${fmtRpFull(financeSummary.bestPoint.hasil_bersih)}` : 'Belum ada data terbaik.'}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/7 bg-white/[0.03] p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Harga Rata-rata</div>
                      <div className="mt-1 text-base font-semibold leading-tight text-white break-words md:text-lg">{fmtRp(data.summary.avg_harga_per_kg)}</div>
                      <div className="mt-1 text-xs text-white/42">Mudah dipakai untuk membandingkan hasil jual.</div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={340}>
                    {chartMode === 'produksi' ? (
                      <AreaChart data={chartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
                        <defs>
                          <linearGradient id="reportProductionFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.34} />
                            <stop offset="75%" stopColor="#22c55e" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.42)' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtAxisTon} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.42)' }} axisLine={false} tickLine={false} width={52} />
                        <Tooltip
                          content={({ active, payload, label }: TooltipArgs) => {
                            if (!active || !payload?.length) return null
                            const row = payload[0]?.payload
                            return (
                              <div className="rounded-2xl border border-white/12 bg-[rgba(12,18,20,0.96)] p-4 text-sm shadow-lg">
                                <div className="font-semibold text-white">{label}</div>
                                <div className="mt-3 flex items-center justify-between gap-4">
                                  <span className="text-white/55">Produksi</span>
                                  <span className="font-medium text-white">{fmtTon(Number(row?.produksi || 0))}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-4">
                                  <span className="text-white/55">Harga rata-rata</span>
                                  <span className="font-medium text-white">{fmtRp(Number(row?.hargaAvg || 0))}/kg</span>
                                </div>
                              </div>
                            )
                          }}
                        />
                        <ReferenceLine
                          y={chartAverage}
                          stroke="rgba(255,255,255,0.32)"
                          strokeDasharray="6 6"
                          label={{ value: 'Rata-rata', position: 'insideTopRight', fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="produksi"
                          name="Produksi"
                          stroke="#22c55e"
                          strokeWidth={3}
                          fill="url(#reportProductionFill)"
                          dot={{ r: 3, strokeWidth: 2, fill: '#08120f', stroke: '#22c55e' }}
                          activeDot={{ r: 6, fill: '#22c55e', stroke: '#08120f', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    ) : (
                      <ComposedChart data={chartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.42)' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtAxisRupiah} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.42)' }} axisLine={false} tickLine={false} width={96} />
                        <Tooltip
                          content={({ active, payload, label }: TooltipArgs) => {
                            if (!active || !payload?.length) return null
                            const row = payload[0]?.payload
                            return (
                              <div className="rounded-2xl border border-white/12 bg-[rgba(12,18,20,0.96)] p-4 text-sm shadow-lg">
                                <div className="font-semibold text-white">{label}</div>
                                <div className="mt-3 space-y-1.5">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-white/55">Pendapatan</span>
                                    <span className="font-medium text-white">{fmtRp(Number(row?.pendapatan || 0))}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-white/55">Biaya Panen</span>
                                    <span className="font-medium text-white">{fmtRp(Number(row?.biayaPanen || 0))}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-white/55">Biaya Perawatan</span>
                                    <span className="font-medium text-white">{fmtRp(Number(row?.biayaPerawatan || 0))}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-white/55">Laba Bersih</span>
                                    <span className="font-medium text-white">{fmtRp(Number(row?.labaBersih || 0))}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 16 }} />
                        <ReferenceLine
                          y={chartAverage}
                          stroke="rgba(255,255,255,0.28)"
                          strokeDasharray="6 6"
                          label={{ value: 'Rata-rata', position: 'insideTopRight', fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                        />
                        {chartMode === 'cashflow' ? (
                          <>
                            <Bar dataKey="pendapatan" name="Pendapatan" fill="#22c55e" barSize={24} radius={[8, 8, 0, 0]} />
                            <Bar dataKey="totalBiaya" name="Total Biaya" fill="#f87171" barSize={24} radius={[8, 8, 0, 0]} />
                            <Line
                              type="monotone"
                              dataKey="labaBersih"
                              name="Laba Bersih"
                              stroke="#facc15"
                              strokeWidth={3}
                              dot={{ r: 4, strokeWidth: 2, fill: '#08120f' }}
                              activeDot={{ r: 6, fill: '#facc15', stroke: '#08120f', strokeWidth: 2 }}
                            />
                          </>
                        ) : (
                          <>
                            <Bar dataKey="biayaPanen" name="Biaya Panen" stackId="costs" fill="#f97316" barSize={24} radius={[8, 8, 0, 0]} />
                            <Bar dataKey="biayaPerawatan" name="Biaya Perawatan" stackId="costs" fill="#a78bfa" barSize={24} radius={[8, 8, 0, 0]} />
                            <Line
                              type="monotone"
                              dataKey="totalBiaya"
                              name="Total Biaya"
                              stroke="#f87171"
                              strokeWidth={3}
                              dot={{ r: 4, strokeWidth: 2, fill: '#08120f' }}
                              activeDot={{ r: 6, fill: '#f87171', stroke: '#08120f', strokeWidth: 2 }}
                            />
                          </>
                        )}
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>

                  <div className="mt-4 rounded-2xl border border-white/7 bg-white/[0.03] px-4 py-3 text-sm text-white/58">
                    {chartMode === 'produksi' && 'Pakai mode produksi untuk melihat kapan hasil panen paling banyak.'}
                    {chartMode === 'cashflow' && 'Pakai mode uang untuk melihat apakah uang masuk masih jauh di atas biaya.'}
                    {chartMode === 'biaya' && 'Pakai mode biaya untuk melihat apakah beban terbesar datang dari panen atau perawatan.'}
                  </div>
                </section>

                <section
                  className="rounded-[30px] p-5 md:p-6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="mb-5 flex flex-col gap-3">
                    <div>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/32">Urutan Kebun</p>
                      <h2 className="text-xl font-semibold text-white">Perbandingan kebun</h2>
                      <p className="mt-1 text-sm text-white/45">
                        Lihat kebun mana yang hasilnya paling baik dari sisi produksi dan hasil bersih.
                      </p>
                    </div>
                    <div className="rounded-full px-3 py-1 text-xs font-medium w-max" style={{ background: 'rgba(250,204,21,0.12)', color: '#fde68a' }}>
                      {data.ranking.length} kebun sedang dihitung
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.ranking.slice(0, 3).map((farm, index) => (
                      <RankingCard key={farm.id_lahan} farm={farm} rank={index + 1} />
                    ))}
                  </div>
                </section>
              </div>

              <section
                className="rounded-[30px] p-5 md:p-6"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/32">Daftar Panen</p>
                    <h2 className="text-xl font-semibold text-white">Detail panen</h2>
                    <p className="mt-1 text-sm text-white/45">
                      Lihat catatan panen per tanggal supaya mudah memeriksa hasil dan biaya.
                    </p>
                  </div>
                  <div className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(56,189,248,0.12)', color: '#bae6fd' }}>
                    {data.detail.length} catatan panen
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {['Tanggal', 'Kebun', 'Luas (Ha)', 'Janjang', 'Berat (Ton)', 'Harga/Kg', 'Pendapatan', 'Biaya Panen', 'Laba Bersih', 'Hasil/Ha'].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.detail.slice(0, 50).map((row) => (
                        <tr
                          key={row.id_panen}
                          className="transition hover:bg-white/[0.02]"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-white/60">{fmtDate(row.tanggal_panen)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-white">{row.nama_kebun}</td>
                          <td className="px-4 py-3 text-right text-sm text-white/70">{fmtNum(row.luas_panen_ha)}</td>
                          <td className="px-4 py-3 text-right text-sm text-white/70">{row.jumlah_janjang.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right text-sm text-white/70">{fmtNum(row.berat_ton, 2)} ton</td>
                          <td className="px-4 py-3 text-right text-sm text-white/70">{fmtRp(row.harga_per_kg)}</td>
                          <td className="px-4 py-3 text-right text-sm text-white/80">{fmtRpFull(row.total_pendapatan)}</td>
                          <td className="px-4 py-3 text-right text-sm" style={{ color: 'rgba(248,113,113,0.85)' }}>{fmtRpFull(row.biaya_panen)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: row.hasil_bersih >= 0 ? '#4ade80' : '#f87171' }}>
                            {fmtRpFull(row.hasil_bersih)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-white/55">{fmtNum(row.produktivitas, 2)} t/ha</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                        <td className="px-4 py-3 text-xs font-bold text-white/60" colSpan={4}>TOTAL</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-white">{fmtNum(data.summary.total_ton, 2)} ton</td>
                        <td className="px-4 py-3 text-right text-xs text-white/35">rata-rata<br />{fmtRp(data.summary.avg_harga_per_kg)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-white">{fmtRpFull(data.summary.total_pendapatan)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'rgba(248,113,113,0.9)' }}>
                          {fmtRpFull(data.summary.total_biaya_panen)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: data.summary.hasil_bersih >= 0 ? '#4ade80' : '#f87171' }}>
                          {fmtRpFull(data.summary.hasil_bersih)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-white/35">rata-rata<br />{fmtNum(data.summary.rata_produktivitas, 2)} t/ha</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
