import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import type { PendapatanRow, Lahan } from '../types'
import { formatRupiahDisplay } from '../utils/rupiah'

const rp = formatRupiahDisplay

function fmtDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

const TABS = [
  { key: 'semua', label: 'Semua' },
  { key: 'subsidi', label: 'Subsidi PSR' },
  { key: 'brondolan', label: 'Brondolan' },
  { key: 'bibit', label: 'Penjualan bibit' },
  { key: 'lain', label: 'Lain-lain' },
]

function getTabKey(catatan: string): string {
  const c = (catatan || '').toLowerCase()
  if (c.includes('subsidi') || c.includes('psr')) return 'subsidi'
  if (c.includes('brondolan')) return 'brondolan'
  if (c.includes('bibit')) return 'bibit'
  return 'lain'
}

const CAT_COLORS: Record<string, string> = {
  subsidi: 'var(--c2)',
  brondolan: 'var(--c4)',
  bibit: 'var(--c5)',
  lain: 'var(--c6)',
  semua: 'var(--c1)',
}

export default function Pendapatan() {
  const [pendapatans, setPendapatans] = useState<PendapatanRow[]>([])
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('semua')

  useEffect(() => {
    Promise.all([
      api.get('/FinanceIncomeService'),
      api.get('/CorePlotService'),
    ]).then(([pr, lr]) => {
      setPendapatans(pr.data || [])
      setLahans(lr.data || [])
    }).catch(() => toast.error('Gagal memuat data pendapatan'))
      .finally(() => setLoading(false))
  }, [])

  const lahanMap = Object.fromEntries(lahans.map(l => [l.id_lahan, l.nama_kebun]))

  const sorted = [...pendapatans].sort((a, b) =>
    new Date(b.tanggal_panen).getTime() - new Date(a.tanggal_panen).getTime()
  )

  const filtered = activeTab === 'semua'
    ? sorted
    : sorted.filter(p => getTabKey(p.catatan) === activeTab)

  // Tab counts
  const tabCounts = TABS.map(t => ({
    ...t,
    count: t.key === 'semua'
      ? sorted.length
      : sorted.filter(p => getTabKey(p.catatan) === t.key).length,
  }))

  // KPI totals
  const totalBersih = sorted.reduce((s, p) => s + (p.pendapatan_bersih || 0), 0)
  const totalKotor = sorted.reduce((s, p) => s + (p.pendapatan_kotor || 0), 0)
  const totalBiaya = sorted.reduce((s, p) => s + (p.biaya_total || 0), 0)

  const subsidiItems = sorted.filter(p => getTabKey(p.catatan) === 'subsidi')
  const totalSubsidi = subsidiItems.reduce((s, p) => s + (p.pendapatan_bersih || 0), 0)

  const brondolanItems = sorted.filter(p => getTabKey(p.catatan) === 'brondolan')
  const totalBrondolan = brondolanItems.reduce((s, p) => s + (p.pendapatan_bersih || 0), 0)

  // Sparkline data (last 7 sorted by date)
  const sparkBase = sorted.slice(0, 7).map(p => p.pendapatan_bersih || 0).reverse()

  return (
    <AppLayout>
      <div className="px-7 py-7 pb-12">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2">Keuangan</p>
            <h1 className="display text-4xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>Pendapatan Lain</h1>
            <p className="mt-2 text-sm text-ink-3 max-w-xl">
              Catat pendapatan di luar penjualan TBS — subsidi, hibah, penjualan brondolan, atau pendapatan sampingan.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/pendapatan/add"
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              + Catat Pendapatan
            </Link>
          </div>
        </div>

        {/* Tab filters */}
        <div
          className="inline-flex p-1 rounded-xl border border-line bg-white mb-5"
        >
          {tabCounts.map(({ key, label, count }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'white' : 'var(--ink-2)',
                  border: 'none',
                }}
              >
                {label}
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(255,255,255,0.18)' : 'var(--paper-2)',
                    color: active ? 'white' : 'var(--ink-4)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* KPI cards */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-5">
            {[
              {
                label: 'Total pendapatan',
                value: rp(totalBersih),
                sub: `${sorted.length} catatan`,
                accent: 'var(--c1)',
                data: sparkBase,
                stroke: 'var(--c1)',
                fill: 'rgba(10,120,71,0.18)',
              },
              {
                label: 'Subsidi diterima',
                value: rp(totalSubsidi),
                sub: `${subsidiItems.length} pencairan PSR`,
                accent: 'var(--c2)',
                data: subsidiItems.slice(0, 7).map(p => p.pendapatan_bersih || 0).reverse(),
                stroke: 'var(--c2)',
                fill: 'rgba(217,106,44,0.18)',
              },
              {
                label: 'Brondolan & lain',
                value: rp(totalBrondolan),
                sub: 'catatan harian',
                accent: 'var(--c4)',
                data: brondolanItems.slice(0, 7).map(p => p.pendapatan_bersih || 0).reverse(),
                stroke: 'var(--c4)',
                fill: 'rgba(28,142,138,0.18)',
              },
            ].map(({ label, value, sub, accent, data, stroke, fill }) => (
              <div
                key={label}
                className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-5"
                style={{ borderTop: `3px solid ${accent}` }}
              >
                <p className="eyebrow mb-0.5">{label}</p>
                <p className="num text-2xl font-bold text-ink mt-1" style={{ letterSpacing: '-0.02em' }}>{value}</p>
                <p className="text-xs text-ink-4 mt-0.5">{sub}</p>
                {data.length > 1 && (
                  <div className="mt-3 -mx-1">
                    <ResponsiveContainer width="100%" height={56}>
                      <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={fill} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Data table */}
        <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-line">
            <h3 className="display text-lg font-bold text-ink">
              {activeTab === 'semua' ? 'Semua pendapatan' : tabCounts.find(t => t.key === activeTab)?.label}
            </h3>
            <span className="text-xs text-ink-4">{filtered.length} catatan</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-ink-4">Belum ada data pendapatan.</p>
              <Link to="/pendapatan/add" className="mt-3 inline-flex text-sm font-semibold" style={{ color: 'var(--emerald-2)' }}>
                + Catat pendapatan pertama →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ fontSize: 11, background: 'var(--paper)', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <th className="text-left px-6 py-3 font-semibold">Tanggal</th>
                    <th className="text-left py-3 font-semibold">Kebun</th>
                    <th className="text-left py-3 font-semibold">Kategori</th>
                    <th className="text-right py-3 font-semibold">Berat</th>
                    <th className="text-right py-3 font-semibold">Pendapatan kotor</th>
                    <th className="text-right py-3 font-semibold">Biaya</th>
                    <th className="text-right px-6 py-3 font-semibold">Bersih</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const tabKey = getTabKey(p.catatan)
                    const color = CAT_COLORS[tabKey]
                    const lahanName = lahanMap[p.id_lahan] || `Lahan #${p.id_lahan}`
                    return (
                      <tr key={p.id_pendapatan} className="border-t border-line hover:bg-paper transition-colors" style={{ fontSize: 13 }}>
                        <td className="px-6 py-3.5 font-mono text-xs text-ink-3">{fmtDate(p.tanggal_panen)}</td>
                        <td className="py-3.5 font-semibold text-ink">{lahanName}</td>
                        <td className="py-3.5">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                            style={{ background: color }}
                          >
                            {TABS.find(t => t.key === tabKey)?.label || 'Lain-lain'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-mono text-xs text-ink-3">
                          {p.total_berat_kg ? `${p.total_berat_kg.toLocaleString('id-ID')} kg` : '—'}
                        </td>
                        <td className="py-3.5 text-right font-mono text-xs" style={{ color: 'var(--emerald-2)' }}>
                          {rp(p.pendapatan_kotor)}
                        </td>
                        <td className="py-3.5 text-right font-mono text-xs" style={{ color: 'var(--terra-2)' }}>
                          {rp(p.biaya_total)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold num">{rp(p.pendapatan_bersih)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-ink bg-paper" style={{ fontSize: 13 }}>
                      <td className="px-6 py-3.5 font-bold text-ink" colSpan={4}>Total</td>
                      <td className="py-3.5 text-right font-bold font-mono text-xs" style={{ color: 'var(--emerald-2)' }}>
                        {rp(filtered.reduce((s, p) => s + (p.pendapatan_kotor || 0), 0))}
                      </td>
                      <td className="py-3.5 text-right font-bold font-mono text-xs" style={{ color: 'var(--terra-2)' }}>
                        {rp(filtered.reduce((s, p) => s + (p.biaya_total || 0), 0))}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold num">
                        {rp(filtered.reduce((s, p) => s + (p.pendapatan_bersih || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-line flex justify-between items-center text-xs text-ink-3">
              <span>Menampilkan {filtered.length} catatan</span>
              <Link to="/pendapatan/add" className="font-semibold" style={{ color: 'var(--emerald-2)' }}>+ Catat pendapatan baru →</Link>
            </div>
          )}
        </div>

        {/* Summary bottom row */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: 'Total pendapatan kotor', value: rp(totalKotor), color: 'var(--c1)' },
              { label: 'Total biaya', value: rp(totalBiaya), color: 'var(--terra-2)' },
              { label: 'Total bersih', value: rp(totalBersih), color: 'var(--emerald-2)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-4">{label}</p>
                <p className="num text-xl font-bold mt-1" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
