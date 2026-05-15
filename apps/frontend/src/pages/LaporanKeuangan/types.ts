import type { AppMetricIconKind } from '../../components/design-system'

export interface LaporanSummary {
  total_ton: number
  total_pendapatan: number
  total_biaya_panen: number
  total_biaya_perawatan: number
  hasil_bersih: number
  avg_harga_per_kg: number
  jumlah_panen: number
  rata_produktivitas: number
  /** Backend: panen | pendapatan_fallback | mixed */
  revenue_source?: string
}

export interface RevenueReconciliation {
  panen_total: number
  pendapatan_manual_total: number
  flag_conflict: boolean
}

export interface ChartPoint {
  label: string
  total_ton: number
  pendapatan: number
  biaya_panen: number
  biaya_perawatan: number
  hasil_bersih: number
  harga_avg: number
  per_lahan: Record<string, number>
}

export interface FarmRanking {
  id_lahan: string
  nama_kebun: string
  total_ton: number
  luas_ha: number
  produktivitas: number
  total_pendapatan: number
  hasil_bersih: number
  jumlah_panen: number
}

export interface DetailRow {
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

export interface LaporanData {
  summary: LaporanSummary
  chart: ChartPoint[]
  ranking: FarmRanking[]
  detail: DetailRow[]
}

export interface ReportChartRow {
  label: string
  produksi: number
  pendapatan: number
  biayaPanen: number
  biayaPerawatan: number
  totalBiaya: number
  labaBersih: number
  hargaAvg: number
}

export interface LahanOption {
  id_lahan: string
  nama_kebun: string
}

export interface ExportEmailResponse {
  message: string
  email: string
}

export type Period = 'week' | 'month' | 'year'
export type ChartMode = 'produksi' | 'cashflow' | 'biaya'
export type ExportFormat = 'pdf' | 'xlsx'

export type TooltipRow = {
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

export type TooltipArgs = {
  active?: boolean
  label?: string | number
  payload?: readonly TooltipRow[]
}

export type FinanceMetricCardProps = {
  label: string
  shortLabel: string
  value: string
  sub: string
  accent: string
  iconKind: AppMetricIconKind
  delta: number
  insight: string
}
