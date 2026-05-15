import { useEffect, useState } from 'react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'

interface HargaItem {
  id_harga: string
  tanggal: string
  harga_per_kg: number
  sumber: string
  created_at: string
}

function fmtDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

function fmtDateShort(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('id-ID', { month: 'short', year: '2-digit', timeZone: 'Asia/Jakarta' })
}

function timeAgo(s: string) {
  if (!s) return '—'
  const diff = Math.round((Date.now() - new Date(s).getTime()) / 60000)
  if (diff < 1) return 'baru saja'
  if (diff < 60) return `${diff} menit lalu`
  const hrs = Math.round(diff / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  return `${Math.round(hrs / 24)} hari lalu`
}

const AGE_CLASS = [
  { label: 'TBS umur ≥ 10 tahun', discount: 1.0, color: 'var(--c1)' },
  { label: 'TBS umur 7 – 9 tahun', discount: 0.978, color: 'var(--c4)' },
  { label: 'TBS umur 4 – 6 tahun', discount: 0.945, color: 'var(--c5)' },
  { label: 'TBS umur 3 tahun', discount: 0.891, color: 'var(--c2)' },
  { label: 'Brondolan', discount: 0.786, color: 'var(--c3)' },
]

export default function HargaTbs() {
  const [hargas, setHargas] = useState<HargaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/FinanceCommodityPriceService')
      .then(res => setHargas(res.data || []))
      .catch(() => toast.error('Gagal memuat data harga'))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...hargas].sort((a, b) =>
    new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  )
  const latest = sorted[0]
  const latestPrice = latest?.harga_per_kg || 0

  // Compute period averages
  const [now] = useState(() => Date.now())
  const avg = (items: HargaItem[]) =>
    items.length > 0 ? Math.round(items.reduce((s, h) => s + h.harga_per_kg, 0) / items.length) : 0

  const week = hargas.filter(h => now - new Date(h.tanggal).getTime() <= 7 * 86400000)
  const month = hargas.filter(h => now - new Date(h.tanggal).getTime() <= 30 * 86400000)
  const year = hargas.filter(h => now - new Date(h.tanggal).getTime() <= 365 * 86400000)

  const avgWeek = avg(week)
  const avgMonth = avg(month)
  const avgYear = avg(year)

  // Build chart data — last 12 data points sorted ascending
  const chartData = sorted.slice(0, 12).reverse().map(h => ({
    label: fmtDateShort(h.tanggal),
    harga: h.harga_per_kg,
  }))

  // Sources: group by sumber, show latest per source
  const sourceMap: Record<string, HargaItem> = {}
  for (const h of sorted) {
    if (!sourceMap[h.sumber]) sourceMap[h.sumber] = h
  }
  const sources = Object.values(sourceMap).slice(0, 5)
  const sourceColors = ['var(--c1)', 'var(--c4)', 'var(--c5)', 'var(--c2)', 'var(--c6)']

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <AppLayout>
      <div className="px-7 py-7 pb-12">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2">Harga</p>
            <h1 className="display text-4xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>Harga TBS Hari Ini</h1>
            <p className="mt-2 text-sm text-ink-3 max-w-xl">
              Pantau harga Tandan Buah Segar di Riau dan sekitarnya. Data dikumpulkan dari Disbun provinsi, pengepul, dan pabrik resmi.
            </p>
          </div>
        </div>

        {/* Hero row: price card + age class table */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 mb-4">
          {/* Emerald hero card */}
          <div
            className="lg:col-span-3 rounded-lg-1 p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-2) 100%)', color: 'white', border: 'none' }}
          >
            <div className="relative">
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {loading ? 'Memuat...' : latest ? todayStr : 'Belum ada data'}
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span
                  className="num font-black text-white leading-none"
                  style={{ fontSize: 88, letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  {loading ? '—' : latestPrice.toLocaleString('id-ID')}
                </span>
                <span className="text-xl mb-2" style={{ opacity: 0.7 }}>Rp/kg</span>
              </div>
              {!loading && hargas.length >= 2 && (() => {
                const prev = sorted[1]?.harga_per_kg || 0
                const delta = latestPrice - prev
                const pct = prev > 0 ? ((delta / prev) * 100).toFixed(1) : '0'
                const up = delta >= 0
                return (
                  <div className="flex items-center gap-3 mt-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-white"
                      style={{ background: 'var(--terra)' }}
                    >
                      {up ? '↑' : '↓'} Rp {Math.abs(delta).toLocaleString('id-ID')} ({up ? '+' : ''}{pct}%)
                    </span>
                    <span className="text-sm" style={{ opacity: 0.7 }}>
                      vs sebelumnya · Rp {prev.toLocaleString('id-ID')}/kg
                    </span>
                  </div>
                )
              })()}
              {/* Period averages */}
              <div
                className="grid grid-cols-3 gap-5 mt-7 pt-6"
                style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
              >
                {[
                  { label: '7 hari', value: avgWeek },
                  { label: '30 hari', value: avgMonth },
                  { label: '1 tahun', value: avgYear },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {label} avg
                    </p>
                    <p className="num text-[22px] font-bold mt-1">
                      {value > 0 ? `Rp ${value.toLocaleString('id-ID')}` : '—'}
                    </p>
                    {value > 0 && latestPrice > 0 && (
                      <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--terra)' }}>
                        {latestPrice > value ? '↑' : '↓'} {Math.abs(((latestPrice - value) / value) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Age class price table */}
          <div className="lg:col-span-2 bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
            <p className="eyebrow mb-1">Per kelas umur tanaman</p>
            <h3 className="display text-lg font-bold text-ink mt-1 mb-4">Harga PKS Riau</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
              </div>
            ) : (
              <div>
                {AGE_CLASS.map(({ label, discount, color }) => {
                  const price = Math.round(latestPrice * discount)
                  const pct = discount < 1 ? `−${((1 - discount) * 100).toFixed(0)}%` : 'Standar'
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                        <span className="text-sm font-semibold text-ink">{label}</span>
                      </div>
                      <div className="text-right">
                        <p className="num text-[15px] font-bold text-ink">
                          {price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : '—'}
                        </p>
                        <p className="text-[11px] text-ink-4">{pct}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* History chart + sources */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Area chart */}
          <div className="lg:col-span-3 bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="eyebrow mb-1">Riwayat harga</p>
                <h3 className="display text-xl font-bold text-ink">{hargas.length} data terakhir</h3>
              </div>
            </div>
            {loading ? (
              <div className="h-56 animate-pulse rounded-lg" style={{ background: 'var(--paper-2)' }} />
            ) : chartData.length > 1 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hargaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--emerald)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--ink-4)' }}
                      axisLine={false} tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: 'var(--ink)', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }}
                      formatter={(v) => [`Rp ${Number(v).toLocaleString('id-ID')}/kg`, 'Harga']}
                      cursor={{ stroke: 'var(--emerald)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="harga"
                      stroke="var(--emerald)"
                      strokeWidth={2}
                      fill="url(#hargaGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-ink-4">
                Belum cukup data untuk menampilkan grafik
              </div>
            )}
          </div>

          {/* Sources */}
          <div className="lg:col-span-2 bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
            <p className="eyebrow mb-1">Sumber data</p>
            <h3 className="display text-lg font-bold text-ink mt-1 mb-4">Pengepul & pabrik</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
              </div>
            ) : sources.length === 0 ? (
              <p className="text-sm text-ink-4">Belum ada data sumber.</p>
            ) : (
              <div>
                {sources.map((h, i) => (
                  <div
                    key={h.id_harga}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: '1px solid var(--line)' }}
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">{h.sumber || 'Tidak diketahui'}</p>
                      <p className="text-[11px] text-ink-4">{timeAgo(h.created_at || h.tanggal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="num text-[15px] font-bold" style={{ color: sourceColors[i] }}>
                        Rp {h.harga_per_kg.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] text-ink-4">/kg</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary stat */}
            {!loading && hargas.length > 0 && (
              <div
                className="mt-4 rounded-xl p-4"
                style={{ background: 'var(--emerald-soft)', border: '1px solid rgba(10,120,71,0.18)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--emerald-2)' }}>
                  Rata-rata semua sumber
                </p>
                <p className="num text-2xl font-bold" style={{ color: 'var(--emerald-2)' }}>
                  Rp {Math.round(hargas.reduce((s, h) => s + h.harga_per_kg, 0) / hargas.length).toLocaleString('id-ID')}/kg
                </p>
                <p className="text-xs text-ink-3 mt-0.5">Dari {hargas.length} catatan · {fmtDate(latest?.tanggal || '')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
