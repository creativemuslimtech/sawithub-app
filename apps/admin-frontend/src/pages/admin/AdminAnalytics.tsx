import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../../api/client'
import { formatRupiahDisplay } from '../../utils/rupiah'

interface UsersTrend {
  month: string
  count: number
}

interface PanenTrend {
  month: string
  jumlah_panen: number
  berat_ton: number
  total_pendapatan: number
  avg_pendapatan: number
  avg_berat_ton: number
  avg_harga_per_kg: number
  revenue_per_ton: number
  registrasi_pengguna: number
  kontribusi_revenue_pct: number
}

interface BestMonth {
  month: string
  jumlah_panen: number
  berat_ton: number
  total_pendapatan: number
}

interface TopProducer {
  username: string
  panen_count: number
  total_berat_ton: number
  total_pendapatan: number
  avg_harga_per_kg: number
  avg_revenue_panen: number
}

interface AnalyticsData {
  generated_at: string
  period_label: string
  users_trend: UsersTrend[]
  panen_trend: PanenTrend[]
  new_users_month: number
  panen_month: number
  revenue_month: number
  weight_month: number
  new_users_growth_pct: number
  panen_growth_pct: number
  revenue_growth_pct: number
  weight_growth_pct: number
  active_users_30d: number
  active_lahan_90d: number
  avg_revenue_per_harvest_month: number
  avg_weight_ton_per_harvest_month: number
  avg_price_per_kg_month: number
  total_users_6m: number
  total_panen_6m: number
  total_revenue_6m: number
  total_weight_6m: number
  avg_revenue_per_harvest_6m: number
  avg_weight_ton_per_harvest_6m: number
  avg_price_per_kg_6m: number
  best_month: BestMonth | null
  top_producers: TopProducer[]
  /** Gross langganan (Midtrans), terpisah dari nilai panen */
  saas_gross_revenue_6m?: number
  saas_gross_revenue_month?: number
  /** BI-08 / machine-readable filter flags from admin-backend */
  saas_revenue_filters_applied?: Record<string, unknown>
  revenue_attribution_note?: string
}

function fmtMonth(month: string) {
  if (!month) return month
  const [year, monthValue] = month.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  return `${names[Math.max(0, parseInt(monthValue, 10) - 1)]} ${year}`
}

function fmtMonthLong(month: string) {
  if (!month) return month
  const [year, monthValue] = month.split('-')
  const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${names[Math.max(0, parseInt(monthValue, 10) - 1)]} ${year}`
}

function fmtRp(value: number) {
  return formatRupiahDisplay(value)
}

function fmtTon(value: number) {
  if (value >= 100) return `${value.toFixed(0)} ton`
  if (value >= 10) return `${value.toFixed(1)} ton`
  return `${value.toFixed(2)} ton`
}

function fmtNumber(value: number) {
  return value.toLocaleString('id-ID')
}

function fmtDelta(value: number) {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

function deltaTone(value: number) {
  if (value > 0) return { color: '#86efac', bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.24)' }
  if (value < 0) return { color: '#fda4af', bg: 'rgba(244,63,94,0.14)', border: 'rgba(244,63,94,0.24)' }
  return { color: '#cbd5e1', bg: 'rgba(148,163,184,0.14)', border: 'rgba(148,163,184,0.24)' }
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(7, 11, 16, 0.94)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    color: '#fff',
    boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
  },
  cursor: { stroke: 'rgba(255,255,255,0.08)' },
}

function KpiCard({
  label,
  value,
  delta,
  sub,
  accent,
}: {
  label: string
  value: string
  delta: number
  sub: string
  accent: string
}) {
  const tone = deltaTone(delta)

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-5 md:p-6"
      style={{
        background: `linear-gradient(160deg, ${accent}22 0%, rgba(10,12,18,0.92) 65%)`,
        border: `1px solid ${accent}2f`,
        boxShadow: `0 16px 50px ${accent}12`,
      }}
    >
      <div
        className="absolute -top-14 right-[-18px] h-28 w-28 rounded-full blur-3xl"
        style={{ background: `${accent}3a` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] mb-1" style={{ color: `${accent}dd` }}>{label}</p>
            <p className="text-lg font-semibold leading-tight text-white break-words md:text-xl xl:text-[1.45rem]">{value}</p>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border"
            style={{ color: tone.color, background: tone.bg, borderColor: tone.border }}
          >
            {fmtDelta(delta)}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,232,240,0.66)' }}>{sub}</p>
      </div>
    </div>
  )
}

function GlassStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent: string
}) {
  return (
    <div
      className="rounded-[24px] p-4"
      style={{
        background: 'rgba(7, 11, 16, 0.45)',
        border: `1px solid ${accent}28`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 40px ${accent}12`,
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: `${accent}d9` }}>{label}</p>
      <p className="text-base font-semibold leading-tight text-white break-words md:text-lg">{value}</p>
      <p className="text-xs mt-2" style={{ color: 'rgba(226,232,240,0.58)' }}>{hint}</p>
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const combinedTrend = data?.panen_trend.map((item, index) => ({
    ...item,
    user_count: data.users_trend[index]?.count ?? 0,
  })) ?? []
  const topRevenue = data?.top_producers[0]?.total_pendapatan ?? 0

  return (
    <AdminLayout>
      <div>
            {loading ? (
              <div className="space-y-5">
                <div className="h-64 rounded-[32px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 rounded-[28px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
                  <div className="h-[420px] rounded-[30px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <div className="h-[420px] rounded-[30px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </div>
            ) : !data ? (
              <div
                className="rounded-[28px] py-16 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-white/40">Gagal memuat data analytics</p>
              </div>
            ) : (
              <div className="space-y-6">
                <section
                  className="relative overflow-hidden rounded-[34px] p-6 md:p-8"
                  style={{
                    background: 'linear-gradient(140deg, rgba(12,19,20,0.95) 0%, rgba(12,30,24,0.92) 45%, rgba(30,16,11,0.94) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 28px 90px rgba(0,0,0,0.28)',
                  }}
                >
                  <div className="absolute inset-0 opacity-90" style={{
                    background: `
                      radial-gradient(circle at 18% 22%, rgba(34,197,94,0.16), transparent 26%),
                      radial-gradient(circle at 80% 24%, rgba(249,115,22,0.18), transparent 24%),
                      radial-gradient(circle at 55% 80%, rgba(56,189,248,0.12), transparent 24%)
                    `,
                  }} />
                  <div className="relative">
                    <div>
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] mb-4"
                        style={{ color: '#d1fae5', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.25)' }}
                      >
                        Executive Snapshot
                      </span>
                      <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight mb-4">
                        Analytics & Laporan yang lebih hidup, lebih terbaca, dan lebih strategis.
                      </h1>
                      <p className="max-w-3xl text-sm md:text-base leading-7" style={{ color: 'rgba(226,232,240,0.72)' }}>
                        Satukan pertumbuhan pengguna, ritme panen, volume produksi, dan nilai bisnis dalam satu layar admin.
                        Bukan cuma angka, tapi sinyal yang membantu membaca momentum platform dengan cepat.
                      </p>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                        <GlassStat
                          label="Pendapatan 6 Bulan (panen)"
                          value={fmtRp(data.total_revenue_6m)}
                          hint={`${fmtNumber(data.total_panen_6m)} transaksi panen · dari t_sawit_hub_panen`}
                          accent="#4ade80"
                        />
                        <GlassStat
                          label="Volume 6 Bulan"
                          value={fmtTon(data.total_weight_6m)}
                          hint={`${fmtRp(data.avg_price_per_kg_6m)}/kg rerata historis`}
                          accent="#38bdf8"
                        />
                        <GlassStat
                          label="Registrasi Baru"
                          value={fmtNumber(data.total_users_6m)}
                          hint="akun baru dalam periode analitik"
                          accent="#a78bfa"
                        />
                        <GlassStat
                          label="Bulan Terkuat"
                          value={data.best_month ? fmtMonth(data.best_month.month) : 'Belum ada'}
                          hint={data.best_month ? fmtRp(data.best_month.total_pendapatan) : 'Belum ada pendapatan'}
                          accent="#fb923c"
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <GlassStat
                          label="Pendapatan langganan (SaaS) · bulan ini"
                          value={fmtRp(data.saas_gross_revenue_month ?? 0)}
                          hint="Bruto dari t_sawit_hub_payments (status paid); mock & non-production dikecualikan saat kolom/metadata mendukung — bukan P&L kebun."
                          accent="#e879f9"
                        />
                        <GlassStat
                          label="Pendapatan langganan (SaaS) · 6 bulan"
                          value={fmtRp(data.saas_gross_revenue_6m ?? 0)}
                          hint="Sumber sama dengan kartu bulan ini; lihat saas_revenue_filters_applied di API untuk export/BI."
                          accent="#c084fc"
                        />
                      </div>
                      {data.revenue_attribution_note && (
                        <p className="mt-4 text-xs leading-relaxed max-w-3xl" style={{ color: 'rgba(226,232,240,0.55)' }}>
                          {data.revenue_attribution_note}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <aside
                  className="rounded-[24px] border border-white/10 px-4 py-3 text-xs leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(226,232,240,0.62)' }}
                >
                  <p className="font-semibold text-white/80">Pelacakan konversi langganan (GA4 · aplikasi pengguna)</p>
                  <p className="mt-1">
                    Event yang dipancarkan dari SPA untuk funnel revenue:{' '}
                    <code className="text-forest-3">trial_banner_click</code>,{' '}
                    <code className="text-forest-3">checkout_start</code> — selaras dengan{' '}
                    <code className="text-forest-3">export_excel</code> /{' '}
                    <code className="text-forest-3">export_pdf</code> pada laporan.
                  </p>
                </aside>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KpiCard
                    label="Pengguna Baru"
                    value={fmtNumber(data.new_users_month)}
                    delta={data.new_users_growth_pct}
                    sub="Arus registrasi bulan berjalan dibanding bulan lalu."
                    accent="#8b5cf6"
                  />
                  <KpiCard
                    label="Transaksi Panen"
                    value={fmtNumber(data.panen_month)}
                    delta={data.panen_growth_pct}
                    sub="Frekuensi panen bulan ini sebagai indikator aktivitas lapangan."
                    accent="#f59e0b"
                  />
                  <KpiCard
                    label="Pendapatan Bulan Ini (panen)"
                    value={fmtRp(data.revenue_month)}
                    delta={data.revenue_growth_pct}
                    sub="Nilai bruto dari t_sawit_hub_panen — ekonomi kebun pengguna, bukan MRR SaaS."
                    accent="var(--forest)"
                  />
                  <KpiCard
                    label="Volume Panen"
                    value={fmtTon(data.weight_month)}
                    delta={data.weight_growth_pct}
                    sub="Total tonase bulan berjalan untuk membaca kapasitas produksi."
                    accent="#38bdf8"
                  />
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
                  <div
                    className="rounded-[30px] p-5 md:p-6"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-1">Business Momentum</p>
                        <h2 className="text-2xl font-semibold text-white mb-1">Pendapatan, volume, dan ritme panen</h2>
                        <p className="text-sm text-white/45">Bar pendapatan dipadukan dengan tren volume panen dan jumlah transaksi.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full px-3 py-1 border border-white/10" style={{ background: 'rgba(74,222,128,0.14)', color: '#86efac' }}>Pendapatan (batang)</span>
                        <span className="rounded-full px-3 py-1 border border-white/10" style={{ background: 'rgba(56,189,248,0.14)', color: '#7dd3fc' }}>Berat ton (garis padat)</span>
                        <span className="rounded-full px-3 py-1 border border-white/10" style={{ background: 'rgba(249,115,22,0.14)', color: '#fdba74' }}>Jumlah panen (garis putus)</span>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={360}>
                      <ComposedChart data={combinedTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={fmtMonth}
                          stroke="rgba(255,255,255,0.35)"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="rgba(255,255,255,0.35)"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => fmtRp(Number(value))}
                          width={96}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="rgba(255,255,255,0.35)"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          {...TOOLTIP_STYLE}
                          labelFormatter={(value) => fmtMonthLong(String(value))}
                          formatter={(value, name) => {
                            if (name === 'Pendapatan') return [fmtRp(Number(value)), name]
                            if (name === 'Berat (ton)') return [fmtTon(Number(value)), name]
                            return [fmtNumber(Number(value)), name]
                          }}
                        />
                        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                        <Bar
                          yAxisId="left"
                          dataKey="total_pendapatan"
                          name="Pendapatan"
                          fill="#4ade80"
                          fillOpacity={0.82}
                          stroke="#14532d"
                          strokeWidth={1.25}
                          radius={[10, 10, 0, 0]}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="berat_ton"
                          name="Berat (ton)"
                          stroke="#38bdf8"
                          strokeWidth={3}
                          strokeDasharray="0"
                          dot={{ r: 4, fill: '#38bdf8', stroke: '#0c4a6e', strokeWidth: 1 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="jumlah_panen"
                          name="Jumlah Panen"
                          stroke="#fb923c"
                          strokeWidth={2.5}
                          strokeDasharray="6 4"
                          dot={{ r: 3, fill: '#fb923c', stroke: '#7c2d12', strokeWidth: 1 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-6">
                    <div
                      className="rounded-[30px] p-5 md:p-6"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-1">Akuisisi Pengguna</p>
                      <h2 className="text-2xl font-semibold text-white mb-1">Pertumbuhan registrasi</h2>
                      <p className="text-sm text-white/45 mb-5">Baca energi pertumbuhan platform dari pola pendaftaran pengguna baru.</p>
                      <ResponsiveContainer width="100%" height={230}>
                        <AreaChart data={combinedTrend}>
                          <defs>
                            <linearGradient id="usersArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.65} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="month"
                            tickFormatter={fmtMonth}
                            stroke="rgba(255,255,255,0.35)"
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
                          <Tooltip
                            {...TOOLTIP_STYLE}
                            labelFormatter={(value) => fmtMonthLong(String(value))}
                            formatter={(value) => [fmtNumber(Number(value)), 'Pengguna Baru']}
                          />
                          <Area
                            type="monotone"
                            dataKey="user_count"
                            stroke="#a78bfa"
                            strokeWidth={2.5}
                            fill="url(#usersArea)"
                            name="Pengguna Baru"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div
                      className="rounded-[30px] p-5 md:p-6"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-3">Operational Radar</p>
                      <div className="grid grid-cols-2 gap-3">
                        <GlassStat
                          label="Pengguna Aktif 30H"
                          value={fmtNumber(data.active_users_30d)}
                          hint="user yang mencatat panen dalam 30 hari"
                          accent="var(--forest)"
                        />
                        <GlassStat
                          label="Lahan Aktif 90H"
                          value={fmtNumber(data.active_lahan_90d)}
                          hint="lahan yang masih produktif dalam 90 hari"
                          accent="#f97316"
                        />
                        <GlassStat
                          label="Avg per Panen"
                          value={fmtRp(data.avg_revenue_per_harvest_month)}
                          hint={`${fmtTon(data.avg_weight_ton_per_harvest_month)} per transaksi`}
                          accent="#38bdf8"
                        />
                        <GlassStat
                          label="Harga Rata-rata"
                          value={`${fmtRp(data.avg_price_per_kg_month)}/kg`}
                          hint={`${fmtRp(data.avg_price_per_kg_6m)}/kg baseline 6 bulan`}
                          accent="#a78bfa"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                  <div
                    className="rounded-[30px] p-5 md:p-6"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-1">Top Performers</p>
                        <h2 className="text-2xl font-semibold text-white">Kontributor utama panen</h2>
                      </div>
                      <span className="text-xs text-white/40">berdasarkan pendapatan 6 bulan</span>
                    </div>

                    {data.top_producers.length === 0 ? (
                      <p className="text-white/35 text-sm py-8 text-center">Belum ada data panen untuk menentukan performer utama.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.top_producers.map((producer, index) => {
                          const share = topRevenue > 0 ? (producer.total_pendapatan / topRevenue) * 100 : 0
                          return (
                            <div
                              key={`${producer.username}-${index}`}
                              className="rounded-[24px] p-4 md:p-5"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <span
                                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                                      style={{ color: '#fff', background: index === 0 ? 'rgba(34,197,94,0.24)' : 'rgba(148,163,184,0.18)' }}
                                    >
                                      {index + 1}
                                    </span>
                                    <div>
                                      <p className="text-base font-semibold text-white">{producer.username}</p>
                                      <p className="text-xs text-white/40">{fmtNumber(producer.panen_count)} panen tercatat</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-[11px] mt-2">
                                    <span className="rounded-full px-2.5 py-1" style={{ color: '#86efac', background: 'rgba(34,197,94,0.12)' }}>
                                      {fmtTon(producer.total_berat_ton)}
                                    </span>
                                    <span className="rounded-full px-2.5 py-1" style={{ color: '#7dd3fc', background: 'rgba(56,189,248,0.12)' }}>
                                      {fmtRp(producer.avg_harga_per_kg)}/kg
                                    </span>
                                    <span className="rounded-full px-2.5 py-1" style={{ color: '#fdba74', background: 'rgba(249,115,22,0.12)' }}>
                                      Avg {fmtRp(producer.avg_revenue_panen)}/panen
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-base font-semibold leading-tight text-white break-words md:text-lg">{fmtRp(producer.total_pendapatan)}</p>
                                  <p className="text-xs text-white/40">total pendapatan</p>
                                </div>
                              </div>

                              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${share}%`,
                                    background: index === 0
                                      ? 'linear-gradient(90deg, var(--forest) 0%, var(--forest-3) 100%)'
                                      : 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div
                    className="rounded-[30px] p-5 md:p-6"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="mb-5">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-1">Monthly Report</p>
                      <h2 className="text-2xl font-semibold text-white">Snapshot bulanan</h2>
                      <p className="text-sm text-white/45">Laporan padat untuk membaca kontribusi tiap bulan terhadap total pendapatan periode.</p>
                    </div>

                    <div className="space-y-3">
                      {combinedTrend.map((item) => (
                        <div
                          key={item.month}
                          className="rounded-[24px] p-4"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{fmtMonthLong(item.month)}</p>
                              <p className="text-xs text-white/40">
                                {fmtNumber(item.jumlah_panen)} panen • {fmtTon(item.berat_ton)} • {fmtNumber(item.user_count)} user baru
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-white">{fmtRp(item.total_pendapatan)}</p>
                              <p className="text-[11px] text-white/40">{item.kontribusi_revenue_pct.toFixed(1)}% kontribusi</p>
                            </div>
                          </div>

                          <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, item.kontribusi_revenue_pct)}%`,
                                background: 'linear-gradient(90deg, #4ade80 0%, #38bdf8 100%)',
                              }}
                            />
                          </div>

                          <div className="flex flex-wrap gap-2 text-[11px]">
                            <span className="rounded-full px-2.5 py-1" style={{ color: '#86efac', background: 'rgba(34,197,94,0.12)' }}>
                              Avg {fmtRp(item.avg_pendapatan)}/panen
                            </span>
                            <span className="rounded-full px-2.5 py-1" style={{ color: '#7dd3fc', background: 'rgba(56,189,248,0.12)' }}>
                              Avg {fmtTon(item.avg_berat_ton)}
                            </span>
                            <span className="rounded-full px-2.5 py-1" style={{ color: '#c4b5fd', background: 'rgba(139,92,246,0.12)' }}>
                              {fmtRp(item.avg_harga_per_kg)}/kg
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
      </div>
    </AdminLayout>
  )
}
