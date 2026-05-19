import { useMemo } from 'react'
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
import { fmtAxisRupiah, fmtAxisTon, fmtRp, fmtRpFull, fmtTon } from '../../utils/reportFormat'
import type { ChartMode, ReportChartRow, TooltipArgs } from './types'
import type { FinanceSummary } from '../../hooks/useLaporanData'
import type { LaporanSummary } from './types'

const GRID_COLOR = '#e7e2d4'
const AXIS_COLOR = '#7b8a83'
const REF_COLOR = '#b0a98d'

export function LaporanCharts({
  chartRows,
  chartMode,
  setChartMode,
  selectedLahanName,
  periodLabel,
  financeSummary,
  summary,
}: {
  chartRows: ReportChartRow[]
  chartMode: ChartMode
  setChartMode: (mode: ChartMode) => void
  selectedLahanName: string
  periodLabel: string
  financeSummary: FinanceSummary
  summary: LaporanSummary
}) {
  const chartAverage = useMemo(() => {
    if (!chartRows.length) return 0
    const key = chartMode === 'produksi' ? 'produksi' : chartMode === 'cashflow' ? 'labaBersih' : 'totalBiaya'
    return chartRows.reduce((sum, row) => sum + row[key], 0) / chartRows.length
  }, [chartRows, chartMode])

  return (
    <section className="rounded-xl-1 bg-surface border border-line shadow-card p-5 md:p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-ink">Grafik Keuangan</div>
          <div className="mt-1 text-xs text-ink-4">{selectedLahanName} · {periodLabel}</div>
          <div className="mt-2 text-sm leading-relaxed text-ink-3">Pilih grafik sesuai yang ingin dilihat: hasil panen, uang, atau biaya.</div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {([
            { key: 'produksi', label: 'Produksi', color: 'var(--forest)' },
            { key: 'cashflow', label: 'Uang', color: '#d97706' },
            { key: 'biaya', label: 'Biaya', color: 'var(--terra)' },
          ] as { key: ChartMode; label: string; color: string }[]).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setChartMode(item.key)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
              style={
                chartMode === item.key
                  ? { background: `color-mix(in srgb, ${item.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${item.color} 30%, transparent)`, color: item.color }
                  : { background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)' }
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-paper-2 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Rata-rata</div>
          <div className="mt-1 text-base font-semibold leading-tight text-ink break-words md:text-lg">
            {chartMode === 'produksi' ? fmtTon(chartAverage) : fmtRpFull(chartAverage)}
          </div>
          <div className="mt-1 text-xs text-ink-4">Sebagai patokan selama periode yang dipilih.</div>
        </div>
        <div className="rounded-xl border border-line bg-paper-2 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Waktu Terbaik</div>
          <div className="mt-1 text-lg font-semibold text-ink">{financeSummary.bestPoint?.label ?? '-'}</div>
          <div className="mt-1 text-xs text-ink-4">
            {financeSummary.bestPoint ? `Untung bersih ${fmtRpFull(financeSummary.bestPoint.hasil_bersih)}` : 'Belum ada data terbaik.'}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-paper-2 p-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Harga Rata-rata</div>
          <div className="mt-1 text-base font-semibold leading-tight text-ink break-words md:text-lg">{fmtRp(summary.avg_harga_per_kg)}</div>
          <div className="mt-1 text-xs text-ink-4">Mudah dipakai untuk membandingkan hasil jual.</div>
        </div>
      </div>

      <div
        role="img"
        aria-label={
          chartMode === 'produksi'
            ? 'Grafik produksi panen per waktu untuk kebun dan periode yang dipilih.'
            : chartMode === 'cashflow'
              ? 'Grafik pendapatan, total biaya, dan laba bersih per waktu.'
              : 'Grafik biaya panen, biaya perawatan, dan total biaya per waktu.'
        }
      >
        <ResponsiveContainer width="100%" height={340}>
          {chartMode === 'produksi' ? (
            <AreaChart data={chartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="reportProductionFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--forest)" stopOpacity={0.28} />
                  <stop offset="75%" stopColor="var(--forest)" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="var(--forest)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtAxisTon} tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                content={({ active, payload, label }: TooltipArgs) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0]?.payload
                  return (
                    <div className="rounded-xl border border-line bg-surface p-4 text-sm shadow-card">
                      <div className="font-semibold text-ink">{label}</div>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-ink-4">Produksi</span>
                        <span className="font-medium text-ink">{fmtTon(Number(row?.produksi || 0))}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-4">
                        <span className="text-ink-4">Harga rata-rata</span>
                        <span className="font-medium text-ink">{fmtRp(Number(row?.hargaAvg || 0))}/kg</span>
                      </div>
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={chartAverage}
                stroke={REF_COLOR}
                strokeDasharray="6 6"
                label={{ value: 'Rata-rata', position: 'insideTopRight', fill: AXIS_COLOR, fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="produksi"
                name="Produksi"
                stroke="var(--forest)"
                strokeWidth={2.5}
                fill="url(#reportProductionFill)"
                dot={{ r: 3, strokeWidth: 2, fill: '#ffffff', stroke: 'var(--forest)' }}
                activeDot={{ r: 6, fill: 'var(--forest)', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={chartRows} margin={{ top: 20, right: 10, left: 6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtAxisRupiah} tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={96} />
              <Tooltip
                content={({ active, payload, label }: TooltipArgs) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0]?.payload
                  return (
                    <div className="rounded-xl border border-line bg-surface p-4 text-sm shadow-card">
                      <div className="font-semibold text-ink">{label}</div>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-ink-4">Pendapatan</span>
                          <span className="font-medium text-ink">{fmtRp(Number(row?.pendapatan || 0))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-ink-4">Biaya Panen</span>
                          <span className="font-medium text-ink">{fmtRp(Number(row?.biayaPanen || 0))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-ink-4">Biaya Perawatan</span>
                          <span className="font-medium text-ink">{fmtRp(Number(row?.biayaPerawatan || 0))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-ink-4">Laba Bersih</span>
                          <span className="font-medium text-ink">{fmtRp(Number(row?.labaBersih || 0))}</span>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: AXIS_COLOR, paddingTop: 16 }} />
              <ReferenceLine
                y={chartAverage}
                stroke={REF_COLOR}
                strokeDasharray="6 6"
                label={{ value: 'Rata-rata', position: 'insideTopRight', fill: AXIS_COLOR, fontSize: 11 }}
              />
              {chartMode === 'cashflow' ? (
                <>
                  <Bar dataKey="pendapatan" name="Pendapatan" fill="#0a7847" stroke="#065f38" strokeWidth={1} barSize={24} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="totalBiaya" name="Total Biaya" fill="#d96a2c" stroke="#a84e1a" strokeWidth={1} barSize={24} radius={[8, 8, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="labaBersih"
                    name="Laba Bersih"
                    stroke="#d97706"
                    strokeWidth={3}
                    strokeDasharray="6 3"
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#d97706' }}
                    activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </>
              ) : (
                <>
                  <Bar dataKey="biayaPanen" name="Biaya Panen" stackId="costs" fill="#d96a2c" stroke="#a84e1a" strokeWidth={1} barSize={24} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="biayaPerawatan" name="Biaya Perawatan" stackId="costs" fill="#7c3aed" stroke="#5b21b6" strokeWidth={1} barSize={24} radius={[8, 8, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="totalBiaya"
                    name="Total Biaya"
                    stroke="#b84e1a"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#b84e1a' }}
                    activeDot={{ r: 6, fill: '#b84e1a', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </>
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm text-ink-3">
        {chartMode === 'produksi' && 'Pakai mode produksi untuk melihat kapan hasil panen paling banyak.'}
        {chartMode === 'cashflow' && 'Pakai mode uang untuk melihat apakah uang masuk masih jauh di atas biaya.'}
        {chartMode === 'biaya' && 'Pakai mode biaya untuk melihat apakah beban terbesar datang dari panen atau perawatan.'}
      </div>
    </section>
  )
}
