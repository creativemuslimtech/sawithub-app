import { useCallback, useMemo, useRef, useState } from 'react'
import { fmtDate, fmtNum, fmtRp, fmtRpFull } from '../../utils/reportFormat'
import type { DetailRow, LaporanSummary } from './types'

const ROW_HEIGHT = 52
const VIRTUAL_THRESHOLD = 200
const VIEWPORT_MAX = 520

function DetailTotalsFoot({ summary }: { summary: LaporanSummary }) {
  return (
    <tfoot>
      <tr style={{ borderTop: '2px solid var(--line)', background: 'var(--paper-2)' }}>
        <td className="px-4 py-3 text-xs font-bold text-ink-4" colSpan={4}>TOTAL</td>
        <td className="px-4 py-3 text-right text-sm font-bold text-ink">{fmtNum(summary.total_ton, 2)} ton</td>
        <td className="px-4 py-3 text-right text-xs text-ink-4">rata-rata<br />{fmtRp(summary.avg_harga_per_kg)}</td>
        <td className="px-4 py-3 text-right text-sm font-bold text-ink">{fmtRpFull(summary.total_pendapatan)}</td>
        <td className="px-4 py-3 text-right text-sm font-bold text-terra">
          {fmtRpFull(summary.total_biaya_panen)}
        </td>
        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: summary.hasil_bersih >= 0 ? 'var(--emerald)' : 'var(--terra)' }}>
          {fmtRpFull(summary.hasil_bersih)}
        </td>
        <td className="px-4 py-3 text-right text-xs text-ink-4">rata-rata<br />{fmtNum(summary.rata_produktivitas, 2)} t/ha</td>
      </tr>
    </tfoot>
  )
}

function DetailDataRows({ rows }: { rows: DetailRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <tr
          key={row.id_panen}
          className="transition hover:bg-paper-2"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-4">{fmtDate(row.tanggal_panen)}</td>
          <td className="px-4 py-3 text-sm font-medium text-ink">{row.nama_kebun}</td>
          <td className="px-4 py-3 text-right text-sm text-ink-3">{fmtNum(row.luas_panen_ha)}</td>
          <td className="px-4 py-3 text-right text-sm text-ink-3">{row.jumlah_janjang.toLocaleString('id-ID')}</td>
          <td className="px-4 py-3 text-right text-sm text-ink-3">{fmtNum(row.berat_ton, 2)} ton</td>
          <td className="px-4 py-3 text-right text-sm text-ink-3">{fmtRp(row.harga_per_kg)}</td>
          <td className="px-4 py-3 text-right text-sm text-ink">{fmtRpFull(row.total_pendapatan)}</td>
          <td className="px-4 py-3 text-right text-sm text-terra">{fmtRpFull(row.biaya_panen)}</td>
          <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: row.hasil_bersih >= 0 ? 'var(--emerald)' : 'var(--terra)' }}>
            {fmtRpFull(row.hasil_bersih)}
          </td>
          <td className="px-4 py-3 text-right text-sm text-ink-4">{fmtNum(row.produktivitas, 2)} t/ha</td>
        </tr>
      ))}
    </>
  )
}

function VirtualizedDetailBody({ detail, summary }: { detail: DetailRow[]; summary: LaporanSummary }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const totalRows = detail.length
  const totalHeight = totalRows * ROW_HEIGHT
  const viewport = Math.min(VIEWPORT_MAX, Math.max(240, Math.min(480, totalHeight + 80)))
  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setScrollTop(el.scrollTop)
  }, [])

  const { start, end } = useMemo(() => {
    const overscan = 6
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan)
    const visible = Math.ceil(viewport / ROW_HEIGHT) + overscan * 2
    const endIdx = Math.min(totalRows, startIdx + visible)
    return { start: startIdx, end: endIdx }
  }, [scrollTop, totalRows, viewport])

  const slice = detail.slice(start, end)
  const padTop = start * ROW_HEIGHT
  const padBottom = Math.max(0, totalHeight - end * ROW_HEIGHT)

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="overflow-x-auto overflow-y-auto rounded-xl"
      style={{ maxHeight: viewport }}
    >
      <table className="w-full min-w-[1080px]">
        <thead className="sticky top-0 z-10" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <tr>
            {['Tanggal', 'Kebun', 'Luas (Ha)', 'Janjang', 'Berat (Ton)', 'Harga/Kg', 'Pendapatan', 'Biaya Panen', 'Laba Bersih', 'Hasil/Ha'].map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap text-ink-4"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {padTop > 0 && (
            <tr style={{ height: padTop }}>
              <td colSpan={10} className="p-0 border-0" />
            </tr>
          )}
          {slice.map((row) => (
            <tr
              key={row.id_panen}
              className="transition hover:bg-paper-2"
              style={{ height: ROW_HEIGHT, borderBottom: '1px solid var(--line)' }}
            >
              <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-4 align-middle">{fmtDate(row.tanggal_panen)}</td>
              <td className="px-4 py-3 text-sm font-medium text-ink align-middle">{row.nama_kebun}</td>
              <td className="px-4 py-3 text-right text-sm text-ink-3 align-middle">{fmtNum(row.luas_panen_ha)}</td>
              <td className="px-4 py-3 text-right text-sm text-ink-3 align-middle">{row.jumlah_janjang.toLocaleString('id-ID')}</td>
              <td className="px-4 py-3 text-right text-sm text-ink-3 align-middle">{fmtNum(row.berat_ton, 2)} ton</td>
              <td className="px-4 py-3 text-right text-sm text-ink-3 align-middle">{fmtRp(row.harga_per_kg)}</td>
              <td className="px-4 py-3 text-right text-sm text-ink align-middle">{fmtRpFull(row.total_pendapatan)}</td>
              <td className="px-4 py-3 text-right text-sm text-terra align-middle">{fmtRpFull(row.biaya_panen)}</td>
              <td className="px-4 py-3 text-right text-sm font-semibold align-middle" style={{ color: row.hasil_bersih >= 0 ? 'var(--emerald)' : 'var(--terra)' }}>
                {fmtRpFull(row.hasil_bersih)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-ink-4 align-middle">{fmtNum(row.produktivitas, 2)} t/ha</td>
            </tr>
          ))}
          {padBottom > 0 && (
            <tr style={{ height: padBottom }}>
              <td colSpan={10} className="p-0 border-0" />
            </tr>
          )}
        </tbody>
        <DetailTotalsFoot summary={summary} />
      </table>
    </div>
  )
}

export function HarvestDetailTable({ detail, summary }: { detail: DetailRow[]; summary: LaporanSummary }) {
  const useVirtual = detail.length > VIRTUAL_THRESHOLD
  const tableRows = useVirtual ? detail : detail.slice(0, 50)

  return (
    <section className="rounded-xl-1 bg-surface border border-line shadow-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-4">Daftar Panen</p>
          <h2 className="text-xl font-semibold text-ink">Detail panen</h2>
          <p className="mt-1 text-sm text-ink-3">Lihat catatan panen per tanggal supaya mudah memeriksa hasil dan biaya.</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="rounded-full px-3 py-1 text-xs font-medium border border-emerald-soft bg-emerald-tint text-emerald">
            {detail.length} catatan panen
          </div>
          {useVirtual && (
            <p className="max-w-md text-xs text-ink-4">Tabel memakai gulir virtual untuk banyak baris agar halaman tetap ringan.</p>
          )}
        </div>
      </div>

      {useVirtual ? (
        <VirtualizedDetailBody detail={detail} summary={summary} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Tanggal', 'Kebun', 'Luas (Ha)', 'Janjang', 'Berat (Ton)', 'Harga/Kg', 'Pendapatan', 'Biaya Panen', 'Laba Bersih', 'Hasil/Ha'].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap text-ink-4"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <DetailDataRows rows={tableRows} />
            </tbody>
            <DetailTotalsFoot summary={summary} />
          </table>
        </div>
      )}
    </section>
  )
}
