import { formatRupiahDisplay } from './rupiah'
import type { ExportFormat, Period } from '../pages/LaporanKeuangan/types'

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** Same wording as Laporan Keuangan — use for dashboard subtitles and KPI footers. */
export function formatReportPeriodLabel(
  period: Period,
  selYear: number,
  selMonth: number,
  selWeek: number,
): string {
  if (period === 'week') {
    return `${MONTHS[selMonth - 1]} ${selYear} · Minggu ${selWeek + 1}`
  }
  if (period === 'month') {
    return `${MONTHS[selMonth - 1]} ${selYear}`
  }
  return `Tahun ${selYear}`
}
export const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).reverse()

export const fmtRp = formatRupiahDisplay
export const fmtRpFull = formatRupiahDisplay

export const fmtNum = (value: number, decimals = 2) =>
  value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export const fmtTon = (value: number) => `${fmtNum(value, value >= 10 ? 1 : 2)} ton`
export const safeDivide = (value: number, divisor: number) => (divisor === 0 ? 0 : value / divisor)

export const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

export const fmtDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

export const fmtDate = (value: string) => {
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

export const fmtAxisRupiah = (value: number) => fmtRp(value)
export const fmtAxisTon = (value: number) => `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })} t`

export const sanitizeFilePart = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()

/** Short stable hash for filenames — avoids embedding legal name (DW-16). */
export function reportExportUserIdToken(seed: string): string {
  const s = seed.trim() || 'anon'
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export const buildReportFileName = (
  format: ExportFormat,
  userId: string,
  username: string,
  lahanName: string,
  periodLabel: string,
) => {
  const dateStamp = new Date().toISOString().slice(0, 10)
  const idSeed = userId.trim() || username.trim() || 'anon'
  const base = [
    'laporan-keuangan',
    `uid-${reportExportUserIdToken(idSeed)}`,
    sanitizeFilePart(username || 'user'),
    sanitizeFilePart(lahanName || 'semua-kebun'),
    sanitizeFilePart(periodLabel || 'periode'),
    dateStamp,
  ]
    .filter(Boolean)
    .join('-')

  return `${base}.${format}`
}

export async function blobToBase64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

export function getErrorMessage(error: unknown, fallback: string) {
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

export function deltaTone(value: number) {
  if (value > 0) return { color: '#86efac', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.22)' }
  if (value < 0) return { color: '#fda4af', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.22)' }
  return { color: 'rgba(226,232,240,0.72)', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.22)' }
}
