import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import type { PanenRow, Lahan } from '../types'
import { formatRupiahDisplay } from '../utils/rupiah'

const rp = formatRupiahDisplay

function fmtDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

const CAT_COLORS = ['var(--c1)', 'var(--c2)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c3)']

export default function Panen() {
  const [panens, setPanens] = useState<PanenRow[]>([])
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/CoreHarvestService'),
      api.get('/CorePlotService'),
    ]).then(([pr, lr]) => {
      setPanens(pr.data || [])
      setLahans(lr.data || [])
    }).catch(() => toast.error('Gagal memuat data panen'))
      .finally(() => setLoading(false))
  }, [])

  const lahanMap = Object.fromEntries(lahans.map((l, i) => [l.id_lahan, { name: l.nama_kebun, color: CAT_COLORS[i % CAT_COLORS.length] }]))

  const totalTon = panens.reduce((s, p) => s + (p.berat_ton || p.berat_kg / 1000), 0)
  const totalPendapatan = panens.reduce((s, p) => s + (p.total_pendapatan || 0), 0)
  const totalBersih = panens.reduce((s, p) => s + (p.hasil_bersih || 0), 0)

  // Build weekly chart data (last 8 items)
  const chartData = panens.slice(0, 8).reverse().map((p, i) => ({
    label: `P-${i + 1}`,
    ton: parseFloat(((p.berat_ton || p.berat_kg / 1000)).toFixed(2)),
  }))

  const sorted = [...panens].sort((a, b) =>
    new Date(b.tanggal_panen).getTime() - new Date(a.tanggal_panen).getTime()
  )

  return (
    <AppLayout>
      <div className="px-7 py-7 pb-12">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2">Catat Panen</p>
            <h1 className="display text-4xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>Riwayat Panen</h1>
            <p className="mt-2 text-sm text-ink-3 max-w-xl">
              Tanggal, berat janjang, harga, dan biaya panen — hitungan harga rata-rata dan uang masuk otomatis.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/panen/add"
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              + Catat Panen
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: chart + table */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Chart card */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="eyebrow mb-1">Hasil panen · {panens.length} catatan</p>
                  <div className="flex items-baseline gap-3 mt-1.5">
                    <span className="num text-3xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>
                      {totalTon.toFixed(1)} ton
                    </span>
                    <span className="chip chip-emerald text-[11px]">Total TBS</span>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="h-44 animate-pulse rounded-lg" style={{ background: 'var(--paper-2)' }} />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} unit=" t" />
                    <Tooltip
                      contentStyle={{ background: 'var(--ink)', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }}
                      formatter={(v) => [`${v} ton`, 'Berat']}
                      cursor={{ fill: 'rgba(10,120,71,0.06)' }}
                    />
                    <Bar dataKey="ton" fill="var(--c1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-sm text-ink-4">Belum ada data panen</div>
              )}
            </div>

            {/* Table */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-line">
                <h3 className="display text-lg font-bold text-ink">Daftar panen</h3>
                <span className="text-xs text-ink-4">{sorted.length} catatan</span>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
                </div>
              ) : sorted.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-ink-4">Belum ada data panen.</p>
                  <Link to="/panen/add" className="mt-3 inline-flex text-sm font-semibold" style={{ color: 'var(--emerald-2)' }}>+ Catat panen pertama →</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ fontSize: 11, background: 'var(--paper)', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <th className="text-left px-6 py-3 font-semibold">Tanggal</th>
                        <th className="text-left py-3 font-semibold">Kebun</th>
                        <th className="text-right py-3 font-semibold">Janjang</th>
                        <th className="text-right py-3 font-semibold">Berat</th>
                        <th className="text-right py-3 font-semibold">Harga/kg</th>
                        <th className="text-right py-3 font-semibold">Biaya</th>
                        <th className="text-right px-6 py-3 font-semibold">Total bersih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((p) => {
                        const lahan = lahanMap[p.id_lahan]
                        return (
                          <tr key={p.id_panen} className="border-t border-line hover:bg-paper transition-colors" style={{ fontSize: 13 }}>
                            <td className="px-6 py-3.5 font-mono text-xs text-ink-3">{fmtDate(p.tanggal_panen)}</td>
                            <td className="py-3.5 font-semibold text-ink flex items-center gap-2">
                              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: lahan?.color || 'var(--ink-4)' }} />
                              {lahan?.name || `Lahan #${p.id_lahan}`}
                            </td>
                            <td className="py-3.5 text-right font-mono text-xs">{p.jumlah_janjang?.toLocaleString('id-ID') || '—'}</td>
                            <td className="py-3.5 text-right font-mono text-xs">{p.berat_kg?.toLocaleString('id-ID')} kg</td>
                            <td className="py-3.5 text-right font-mono text-xs">{rp(p.harga_per_kg)}</td>
                            <td className="py-3.5 text-right font-mono text-xs" style={{ color: 'var(--terra-2)' }}>{rp(p.biaya_panen)}</td>
                            <td className="px-6 py-3.5 text-right font-bold num">{rp(p.hasil_bersih || p.total_pendapatan - p.biaya_panen)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {sorted.length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-ink bg-paper" style={{ fontSize: 13 }}>
                          <td className="px-6 py-3.5 font-bold text-ink" colSpan={3}>Total</td>
                          <td className="py-3.5 text-right font-bold num font-mono text-xs">{totalTon.toFixed(1)} ton</td>
                          <td className="py-3.5" />
                          <td className="py-3.5 text-right font-bold font-mono text-xs" style={{ color: 'var(--terra-2)' }}>{rp(panens.reduce((s, p) => s + (p.biaya_panen || 0), 0))}</td>
                          <td className="px-6 py-3.5 text-right font-bold num">{rp(totalBersih || totalPendapatan)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
              {sorted.length > 0 && (
                <div className="px-6 py-3 border-t border-line flex justify-between items-center text-xs text-ink-3">
                  <span>Menampilkan {sorted.length} panen</span>
                  <Link to="/panen/add" className="font-semibold" style={{ color: 'var(--emerald-2)' }}>+ Catat panen baru →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: summary + quick link */}
          <div className="flex flex-col gap-4">
            {/* Summary stat card */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
              <p className="eyebrow mb-1">Ringkasan</p>
              <h3 className="display text-xl font-bold text-ink mt-1 mb-5">Semua waktu</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Total produksi', value: `${totalTon.toFixed(2)} ton`, color: 'var(--c1)' },
                  { label: 'Total pendapatan', value: rp(totalPendapatan), color: 'var(--c4)' },
                  { label: 'Bersih setelah biaya', value: rp(totalBersih || totalPendapatan), color: 'var(--emerald-2)' },
                  { label: 'Jumlah catatan', value: `${panens.length} panen`, color: 'var(--c2)' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-[11px] text-ink-4 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="num text-lg font-bold mt-0.5" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick add */}
            <div
              className="rounded-lg-1 p-6"
              style={{ background: 'var(--emerald-soft)', border: '1px solid rgba(10,120,71,0.18)' }}
            >
              <p className="eyebrow mb-1" style={{ color: 'var(--emerald-2)' }}>Catat panen baru</p>
              <h3 className="display text-lg font-bold text-ink mt-1 mb-3">Formulir lengkap</h3>
              <p className="text-sm text-ink-3 mb-5 leading-relaxed">
                Isi tanggal, berat janjang, harga/kg, dan biaya panen. Total bersih dihitung otomatis.
              </p>
              <Link
                to="/panen/add"
                className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--emerald)' }}
              >
                Buka formulir panen →
              </Link>
            </div>

            {/* Per-farm breakdown */}
            {!loading && lahans.length > 0 && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
                <p className="eyebrow mb-3">Per kebun</p>
                <div className="flex flex-col gap-3">
                  {lahans.map((l, i) => {
                    const lahanPanens = panens.filter(p => String(p.id_lahan) === String(l.id_lahan))
                    const tonLahan = lahanPanens.reduce((s, p) => s + (p.berat_ton || p.berat_kg / 1000), 0)
                    return (
                      <div key={l.id_lahan}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="font-semibold text-ink flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                            {l.nama_kebun}
                          </span>
                          <span className="num font-bold text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{tonLahan.toFixed(1)} t</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: totalTon > 0 ? `${(tonLahan / totalTon) * 100}%` : '0%',
                              background: CAT_COLORS[i % CAT_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
