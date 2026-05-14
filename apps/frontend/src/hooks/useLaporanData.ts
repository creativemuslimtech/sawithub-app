import { useEffect, useMemo, useState } from 'react'
import type { AxiosInstance } from 'axios'
import api from '../api/client'
import { useFarm } from '../context/useFarm'
import {
  fmtNum,
  fmtRp,
  fmtRpFull,
  fmtTon,
  formatReportPeriodLabel,
  percentChange,
  safeDivide,
} from '../utils/reportFormat'
import type {
  ChartPoint,
  FarmRanking,
  LahanOption,
  LaporanData,
  Period,
  ReportChartRow,
  RevenueReconciliation,
} from '../pages/LaporanKeuangan/types'
import type { AppMetricIconKind } from '../components/design-system'

export type FinanceSummary = {
  totalBiaya: number
  marginPct: number
  biayaPerTon: number
  avgNetPerPanen: number
  latestPoint: ChartPoint | null
  previousPoint: ChartPoint | null
  bestPoint: ChartPoint | null
  weakestPoint: ChartPoint | null
  highestPricePoint: ChartPoint | null
  focusFarm: FarmRanking | null
  pressureFarm: FarmRanking | null
}

export function useLaporanData(client: AxiosInstance = api) {
  const farm = useFarm()
  const [period, setPeriod] = useState<Period>('month')
  const [lahanId, setLahanId] = useState('')
  const [selYear, setSelYear] = useState(new Date().getFullYear())
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1)
  const [selWeek, setSelWeek] = useState(0)
  const [data, setData] = useState<LaporanData | null>(null)
  const [reconciliation, setReconciliation] = useState<RevenueReconciliation | null>(null)
  const [loading, setLoading] = useState(false)
  const [lahans, setLahans] = useState<LahanOption[]>([])

  useEffect(() => {
    client.get('/CorePlotService').then((response) => setLahans(response.data || [])).catch(() => {})
  }, [client])

  useEffect(() => {
    if (farm.activeFarmLimit <= 1) return
    const id = farm.activeFarmId.trim()
    setLahanId(id)
  }, [farm.activeFarmId, farm.activeFarmLimit])

  useEffect(() => {
    const params = new URLSearchParams({ period, year: String(selYear) })
    if (period !== 'year') params.append('month', String(selMonth))
    if (period === 'week') params.append('week', String(selWeek))
    if (lahanId) params.append('lahan_id', lahanId)

    const fetchReport = async () => {
      setLoading(true)
      try {
        const [lapRes, recRes] = await Promise.allSettled([
          client.get<LaporanData>(`/ReportingFarmFinanceService?${params}`),
          client.get<RevenueReconciliation>(`/ReportingReconciliationService?${params}`),
        ])
        if (lapRes.status === 'fulfilled') setData(lapRes.value.data)
        else setData(null)
        if (recRes.status === 'fulfilled') setReconciliation(recRes.value.data)
        else setReconciliation(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchReport()
  }, [period, selYear, selMonth, selWeek, lahanId, client])

  const selectedLahanName = lahans.find((item) => item.id_lahan === lahanId)?.nama_kebun ?? 'Semua Kebun'
  const periodLabel = formatReportPeriodLabel(period, selYear, selMonth, selWeek)

  const chartRows = useMemo((): ReportChartRow[] => {
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

  const financeSummary = useMemo((): FinanceSummary => {
    if (!data) {
      return {
        totalBiaya: 0,
        marginPct: 0,
        biayaPerTon: 0,
        avgNetPerPanen: 0,
        latestPoint: null,
        previousPoint: null,
        bestPoint: null,
        weakestPoint: null,
        highestPricePoint: null,
        focusFarm: null,
        pressureFarm: null,
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
    const pressureFarm =
      [...data.ranking].sort(
        (a, b) => safeDivide(a.hasil_bersih, a.total_pendapatan || 1) - safeDivide(b.hasil_bersih, b.total_pendapatan || 1),
      )[0] ?? null

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

  const financeInsights = useMemo(
    () => [
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
    ],
    [financeSummary],
  )

  const metricCards = data
    ? [
        {
          label: 'Total Produksi',
          shortLabel: 'Produksi',
          value: fmtTon(data.summary.total_ton),
          sub: `${selectedLahanName} · ${periodLabel}`,
          accent: '#22c55e',
          iconKind: 'harvest' as const,
          delta: percentChange(financeSummary.latestPoint?.total_ton ?? 0, financeSummary.previousPoint?.total_ton ?? 0),
          insight: `Rata-rata hasil ${fmtNum(data.summary.rata_produktivitas)} t/ha dari ${data.summary.jumlah_panen} catatan panen.`,
        },
        {
          label: 'Pendapatan',
          shortLabel: 'Pendapatan',
          value: fmtRpFull(data.summary.total_pendapatan),
          sub: `${selectedLahanName} · ${periodLabel}`,
          accent: '#facc15',
          iconKind: 'revenue' as const,
          delta: percentChange(financeSummary.latestPoint?.pendapatan ?? 0, financeSummary.previousPoint?.pendapatan ?? 0),
          insight: `Harga paling tinggi ada di ${financeSummary.highestPricePoint?.label ?? '-'} sebesar ${fmtRp(financeSummary.highestPricePoint?.harga_avg ?? 0)}/kg.`,
        },
        {
          label: 'Total Biaya',
          shortLabel: 'Biaya',
          value: fmtRpFull(financeSummary.totalBiaya),
          sub: `${selectedLahanName} · ${periodLabel}`,
          accent: '#f87171',
          iconKind: 'cost' as const,
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
          iconKind: (data.summary.hasil_bersih >= 0 ? 'profit-up' : 'profit-down') as AppMetricIconKind,
          delta: percentChange(financeSummary.latestPoint?.hasil_bersih ?? 0, financeSummary.previousPoint?.hasil_bersih ?? 0),
          insight: `Untung bersih saat ini ${financeSummary.marginPct.toFixed(1)}% dengan rata-rata ${fmtRpFull(financeSummary.avgNetPerPanen)} per panen.`,
        },
      ]
    : []

  const hasData = !!(data?.detail?.length || data?.chart?.length || data?.ranking?.length)

  return {
    period,
    setPeriod,
    lahanId,
    setLahanId,
    selYear,
    setSelYear,
    selMonth,
    setSelMonth,
    selWeek,
    setSelWeek,
    data,
    reconciliation,
    loading,
    lahans,
    selectedLahanName,
    periodLabel,
    chartRows,
    financeSummary,
    financeInsights,
    metricCards,
    hasData,
  }
}
