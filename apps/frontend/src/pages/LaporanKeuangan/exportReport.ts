import type { AxiosInstance } from 'axios'
import { createXlsxBlob } from '../../utils/xlsx'
import {
  blobToBase64,
  fmtDate,
  fmtNum,
  fmtRp,
  fmtRpFull,
  fmtTon,
} from '../../utils/reportFormat'
import type { ExportEmailResponse, ExportFormat, LaporanData, ReportChartRow } from './types'
import type { FinanceSummary } from '../../hooks/useLaporanData'
import { REVENUE_DISCLOSURE_FOOTNOTE_ID } from './revenueDisclosure'
import {
  LAPORAN_XLSX_DAFTAR_PANEN_HEADER,
  LAPORAN_XLSX_RINGKASAN_TABLE_HEADER,
  LAPORAN_XLSX_TREN_FINANSIAL_HEADER,
  LAPORAN_XLSX_URUTAN_KEBUN_HEADER,
} from './laporanXlsxSheetHeaders'

type ExportUser = { full_name?: string; username?: string; email?: string } | null

export function buildExcelBlob(args: {
  data: LaporanData
  user: ExportUser
  selectedLahanName: string
  periodLabel: string
  financeInsights: string[]
  chartRows: ReportChartRow[]
  financeSummary: FinanceSummary
}) {
  const { data, user, selectedLahanName, periodLabel, financeInsights, chartRows, financeSummary } = args
  const generatedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  })
  const totalBiaya = data.summary.total_biaya_panen + data.summary.total_biaya_perawatan

  const displayName = (user?.full_name?.trim() || user?.username?.trim() || 'Pengguna').slice(0, 120)

  const summaryRows = [
    ['Ringkasan Keuangan SawitHub'],
    [`Laporan Keuangan - ${selectedLahanName}`],
    [`Periode ${periodLabel}`],
    [`Disiapkan untuk ${displayName}`],
    [`Dibuat pada ${generatedAt}`],
    [],
    [...LAPORAN_XLSX_RINGKASAN_TABLE_HEADER],
    ['Total Produksi', fmtTon(data.summary.total_ton), `${data.summary.jumlah_panen} catatan panen dengan hasil rata-rata ${fmtNum(data.summary.rata_produktivitas, 2)} t/ha.`],
    ['Total Pendapatan', fmtRpFull(data.summary.total_pendapatan), `Harga rata-rata periode ini ${fmtRp(data.summary.avg_harga_per_kg)}/kg.`],
    ['Total Biaya', fmtRpFull(totalBiaya), `Biaya panen ${fmtRpFull(data.summary.total_biaya_panen)} dan perawatan ${fmtRpFull(data.summary.total_biaya_perawatan)}.`],
    ['Hasil Bersih', fmtRpFull(data.summary.hasil_bersih), `Untung bersih ${financeSummary.marginPct.toFixed(1)}% untuk ${selectedLahanName}.`],
    [],
    ['Catatan Singkat'],
    ...financeInsights.map((insight) => [insight]),
    [],
    [`Sumber: SawitHub, periode ${periodLabel}`],
    [],
    ['Definisi pendapatan (audit)'],
    [REVENUE_DISCLOSURE_FOOTNOTE_ID],
  ]

  const disclaimerTitleRow = 18 + financeInsights.length
  const disclaimerBodyRow = disclaimerTitleRow + 1

  return createXlsxBlob({
    title: `Laporan Keuangan ${selectedLahanName} - ${periodLabel}`,
    subject: 'Ringkasan Keuangan SawitHub',
    author: 'SawitHub',
    company: 'SawitHub',
    sheets: [
      {
        name: 'Ringkasan',
        columns: [28, 22, 78],
        merges: [
          'A1:C1',
          'A2:C2',
          'A3:C3',
          'A4:C4',
          'A5:C5',
          'A13:C13',
          ...financeInsights.map((_, index) => `A${14 + index}:C${14 + index}`),
          `A${disclaimerTitleRow}:C${disclaimerTitleRow}`,
          `A${disclaimerBodyRow}:C${disclaimerBodyRow}`,
        ],
        rows: summaryRows,
      },
      {
        name: 'Tren Finansial',
        rows: [
          [...LAPORAN_XLSX_TREN_FINANSIAL_HEADER],
          ...chartRows.map((row) => [
            row.label,
            fmtNum(row.produksi, 2),
            fmtRp(row.pendapatan),
            fmtRp(row.biayaPanen),
            fmtRp(row.biayaPerawatan),
            fmtRp(row.totalBiaya),
            fmtRp(row.labaBersih),
            fmtRp(row.hargaAvg),
          ]),
        ],
      },
      {
        name: 'Urutan Kebun',
        rows: [
          [...LAPORAN_XLSX_URUTAN_KEBUN_HEADER],
          ...data.ranking.map((row, index) => [
            index + 1,
            row.nama_kebun,
            fmtNum(row.luas_ha),
            row.jumlah_panen,
            fmtNum(row.total_ton),
            fmtNum(row.produktivitas),
            fmtRp(row.total_pendapatan),
            fmtRp(row.hasil_bersih),
          ]),
        ],
      },
      {
        name: 'Daftar Panen',
        rows: [
          [...LAPORAN_XLSX_DAFTAR_PANEN_HEADER],
          ...data.detail.map((row) => [
            row.tanggal_panen,
            row.nama_kebun,
            fmtNum(row.luas_panen_ha),
            row.jumlah_janjang,
            fmtNum(row.berat_kg),
            fmtNum(row.berat_ton, 4),
            fmtRp(row.harga_per_kg),
            fmtRp(row.total_pendapatan),
            fmtRp(row.biaya_panen),
            fmtRp(row.hasil_bersih),
            fmtNum(row.produktivitas, 4),
            row.catatan || '-',
          ]),
        ],
      },
    ],
  })
}

export async function buildPdfBlob(args: {
  data: LaporanData
  user: ExportUser
  selectedLahanName: string
  periodLabel: string
  financeInsights: string[]
}) {
  const { data, user, selectedLahanName, periodLabel, financeInsights } = args
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
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
  const pdfDisplayName = (user?.full_name?.trim() || user?.username?.trim() || 'Pengguna').slice(0, 120)
  const introLines = doc.splitTextToSize(
    `Disiapkan untuk ${pdfDisplayName} • ${selectedLahanName} • ${periodLabel}. Laporan ini membantu melihat hasil panen, uang masuk, biaya, dan kebun yang paling bagus hasilnya.`,
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
      const h = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      let y = h - 52
      doc.text(`Sumber: SawitHub, periode ${periodLabel}`, 42, y)
      y += 11
      doc.text(`${selectedLahanName}`, 42, y)
      y += 11
      const disc = doc.splitTextToSize(REVENUE_DISCLOSURE_FOOTNOTE_ID, pageWidth - 84)
      doc.text(disc, 42, y)
    },
  })
  return doc.output('blob')
}

export async function emailExportCopy(
  client: AxiosInstance,
  args: {
    format: ExportFormat
    filename: string
    blob: Blob
    periodLabel: string
    selectedLahanName: string
    financeInsights: string[]
    data: LaporanData | null
  },
) {
  const { format, filename, blob, periodLabel, selectedLahanName, financeInsights, data } = args
  const totalBiaya = (data?.summary.total_biaya_panen ?? 0) + (data?.summary.total_biaya_perawatan ?? 0)
  const contentBase64 = await blobToBase64(blob)

  const response = await client.post<ExportEmailResponse>('/ReportingExportService/email-export', {
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
