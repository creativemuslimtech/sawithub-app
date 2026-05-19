import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminPageHero,
  AdminPanel,
  AdminSectionLabel,
  AdminMetricCard,
  AdminBadge,
  AdminProgressBar,
  AdminSkeleton,
  MiniSparkline,
} from '../../components/AdminUI'
import api from '../../api/client'
import { formatRupiahDisplay } from '../../utils/rupiah'

interface VisitTrend {
  day: string
  total: number
  web: number
  mobile: number
}

interface TopCountry {
  country: string
  count: number
}

interface AdminStats {
  total_users: number
  online_users_now: number
  active_users_30d: number
  new_users_7d: number
  total_revenue: number
  total_panen: number
  total_berat_ton: number
  total_lahan: number
  total_perawatan: number
  system_uptime: string
  visit_total: number
  visit_today: number
  visit_web: number
  visit_mobile: number
  visit_trend: VisitTrend[]
  top_countries: TopCountry[]
}

function fmtRupiah(val: number) {
  return formatRupiahDisplay(val)
}

function fmtDate(raw: string) {
  if (!raw) return '-'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' })
}

/* ── Platform activity SVG chart (14-day) ── */
function PlatformChart({ trend }: { trend: VisitTrend[] }) {
  const days = trend.length || 7
  const data = trend.length > 0 ? trend : Array.from({ length: 7 }, () => ({ day: '', total: 0, web: 0, mobile: 0 }))
  const maxTotal = Math.max(...data.map(d => d.total), 1)

  const chartW = 640
  const chartH = 160
  const padL = 32
  const padR = 16
  const padT = 8
  const padB = 24
  const innerW = chartW - padL - padR
  const innerH = chartH - padT - padB
  const stepX = days > 1 ? innerW / (days - 1) : innerW

  const webLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * stepX} ${padT + innerH - (d.web / maxTotal) * innerH}`).join(' ')
  const mobLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * stepX} ${padT + innerH - (d.mobile / maxTotal) * innerH}`).join(' ')

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="webgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--forest)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--forest)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((f, i) => (
        <line
          key={i}
          x1={padL} x2={chartW - padR}
          y1={padT + innerH - f * innerH} y2={padT + innerH - f * innerH}
          stroke="var(--line-2)"
        />
      ))}

      {/* Web area fill */}
      {trend.length > 0 && (
        <path
          d={`${webLine} L ${padL + (days - 1) * stepX} ${padT + innerH} L ${padL} ${padT + innerH} Z`}
          fill="url(#webgrad)"
        />
      )}
      <path d={webLine} stroke="var(--forest)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={mobLine} stroke="var(--amber-2)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 2" />

      {/* X labels — show every 2nd */}
      {data.map((d, i) => i % 2 === 0 && (
        <text
          key={i}
          x={padL + i * stepX}
          y={chartH - 4}
          fontSize="9"
          textAnchor="middle"
          fontFamily="var(--f-mono)"
          fill="var(--ink-5)"
        >
          {fmtDate(d.day)}
        </text>
      ))}
    </svg>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/overview')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <AdminSkeleton rows={6} height="h-24" />
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div style={{ fontSize: 14, color: 'var(--ink-4)', padding: 24 }}>Gagal memuat data overview.</div>
      </AdminLayout>
    )
  }

  const visitWebPct = stats.visit_total > 0 ? ((stats.visit_web / stats.visit_total) * 100).toFixed(1) : '0'
  const visitMobPct = stats.visit_total > 0 ? ((stats.visit_mobile / stats.visit_total) * 100).toFixed(1) : '0'

  const trendVisitValues = stats.visit_trend?.map(t => t.total) ?? []
  const trendWebValues = stats.visit_trend?.map(t => t.web) ?? []
  const trendMobValues = stats.visit_trend?.map(t => t.mobile) ?? []

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Editorial header */}
        <AdminPageHero
          eyebrow="Command Center · Live"
          title={
            <>
              <em className="sh-italic" style={{ color: 'var(--forest)' }}>{stats.total_users.toLocaleString('id-ID')}</em> pengguna terdaftar
              {' '}—{' '}
              <em className="sh-italic" style={{ color: 'var(--amber-2)' }}>{stats.online_users_now}</em> aktif sekarang.
            </>
          }
          description={`Uptime sistem: ${stats.system_uptime} · Data diperbarui tiap 30 detik`}
        />

        {/* ── Top metric grid — 6 col ── */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
            className="lg:!grid-cols-6">
            <AdminMetricCard
              label="Pengguna"
              value={stats.total_users.toLocaleString('id-ID')}
              trend={`+${stats.new_users_7d} (7h)`}
              color="var(--forest)"
              sparkData={trendVisitValues}
            />
            <AdminMetricCard
              label="Online"
              value={stats.online_users_now.toLocaleString('id-ID')}
              trend="↑ live"
              color="var(--amber-2)"
              live={true}
            />
            <AdminMetricCard
              label="Aktif 30h"
              value={stats.active_users_30d.toLocaleString('id-ID')}
              hint="Berdasarkan panen"
              color="var(--forest-3)"
            />
            <AdminMetricCard
              label="Total Panen"
              value={`${stats.total_panen.toLocaleString('id-ID')} sesi`}
              hint="Semua catatan"
              color="var(--c-bark)"
            />
            <AdminMetricCard
              label="Volume TBS"
              value={`${stats.total_berat_ton.toFixed(1)} ton`}
              hint="Berat kumulatif"
              color="var(--c-sky)"
            />
            <AdminMetricCard
              label="Pendapatan"
              value={fmtRupiah(stats.total_revenue)}
              hint="Semua waktu"
              color="var(--amber)"
            />
          </div>
        </section>

        {/* ── Visit chart + Top countries ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}
          className="!grid-cols-1 lg:!grid-cols-[1.6fr_1fr]">

          <AdminPanel eyebrow="Aktivitas platform · 7 hari" title="Kunjungan web & mobile">
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              {[
                { l: 'Web', c: 'var(--forest)' },
                { l: 'Mobile', c: 'var(--amber-2)', dashed: true },
              ].map(leg => (
                <div key={leg.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 12, height: 0,
                    borderTop: leg.dashed ? `2px dashed ${leg.c}` : `2px solid ${leg.c}`,
                    display: 'inline-block',
                  }} />
                  <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{leg.l}</span>
                </div>
              ))}
            </div>

            {stats.visit_trend && stats.visit_trend.length > 0 ? (
              <PlatformChart trend={stats.visit_trend} />
            ) : (
              <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--ink-5)' }}>Belum ada data kunjungan</p>
              </div>
            )}

            {/* Summary stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line-2)' }}>
              {[
                { l: 'Total kunjungan', v: stats.visit_total.toLocaleString('id-ID') },
                { l: 'Hari ini', v: stats.visit_today.toLocaleString('id-ID') },
                { l: 'Via web', v: `${visitWebPct}%` },
                { l: 'Via mobile', v: `${visitMobPct}%` },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: i > 0 ? '0 0 0 16px' : '0 16px 0 0',
                    borderLeft: i > 0 ? '1px solid var(--line-2)' : undefined,
                  }}
                >
                  <div className="sh-eyebrow" style={{ fontSize: 10 }}>{s.l}</div>
                  <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, marginTop: 6, color: 'var(--ink)' }}>{s.v}</div>
                </div>
              ))}
            </div>
          </AdminPanel>

          {/* Geographic breakdown */}
          <AdminPanel eyebrow="Sebaran pengunjung" title={`Top negara · ${stats.top_countries?.length ?? 0} terdeteksi`}>
            {stats.top_countries && stats.top_countries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.top_countries.map((c, i) => {
                  const pct = stats.visit_total > 0 ? (c.count / stats.visit_total) * 100 : 0
                  const color = i === 0 ? 'var(--amber)' : i < 3 ? 'var(--forest)' : 'var(--forest-3)'
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{c.country || 'Unknown'}</span>
                        <span className="sh-num" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                          {c.count.toLocaleString('id-ID')} <span style={{ color: 'var(--ink-5)' }}>· {pct.toFixed(0)}%</span>
                        </span>
                      </div>
                      <AdminProgressBar pct={pct * 2.5} color={color} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--ink-5)', padding: '24px 0', textAlign: 'center' }}>Belum ada data lokasi</p>
            )}
          </AdminPanel>
        </div>

        {/* ── Visit trend detail + Platform health ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}
          className="!grid-cols-1 lg:!grid-cols-2">

          {/* 7-day trend detail table */}
          <AdminPanel eyebrow="Tren harian" title="Kunjungan 7 hari terakhir">
            {stats.visit_trend && stats.visit_trend.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.visit_trend.map((t, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>
                        {fmtDate(t.day)}
                      </span>
                      <div style={{ display: 'flex', gap: 14, fontSize: 11, fontFamily: 'var(--f-mono)' }}>
                        <span style={{ color: 'var(--forest)' }}>W {t.web}</span>
                        <span style={{ color: 'var(--amber-2)' }}>M {t.mobile}</span>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.total}</span>
                      </div>
                    </div>
                    {/* Stacked bar */}
                    {t.total > 0 ? (
                      <div style={{ display: 'flex', height: 5, borderRadius: 999, overflow: 'hidden', background: 'var(--line-soft)', gap: 1 }}>
                        <div style={{ borderRadius: 999, background: 'var(--forest)', width: `${(t.web / t.total) * 100}%` }} />
                        <div style={{ borderRadius: 999, background: 'var(--amber-3)', width: `${(t.mobile / t.total) * 100}%` }} />
                      </div>
                    ) : (
                      <div style={{ height: 5, borderRadius: 999, background: 'var(--line-soft)' }} />
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  {[['var(--forest)', 'Web'], ['var(--amber-3)', 'Mobile']].map(([c, l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--ink-4)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: c as string, display: 'inline-block' }} />
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--ink-5)', padding: '24px 0', textAlign: 'center' }}>Belum ada data kunjungan</p>
            )}
          </AdminPanel>

          {/* Platform data quality */}
          <AdminPanel eyebrow="Data Platform" title="Ringkasan data kebun">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { l: 'Total lahan', v: `${stats.total_lahan.toLocaleString('id-ID')} kebun`, color: 'var(--forest)' },
                { l: 'Total panen', v: `${stats.total_panen.toLocaleString('id-ID')} sesi`, color: 'var(--c-bark)' },
                { l: 'Volume TBS', v: `${stats.total_berat_ton.toFixed(1)} ton`, color: 'var(--c-sky)' },
                { l: 'Perawatan', v: `${stats.total_perawatan?.toLocaleString('id-ID') ?? '-'} catatan`, color: 'var(--forest-3)' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: 16, borderRadius: 10,
                    background: 'var(--cream)',
                    border: '1px solid var(--line-2)',
                  }}
                >
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, fontFamily: 'var(--f-mono)', marginBottom: 8 }}>
                    {item.l}
                  </div>
                  <div className="sh-num" style={{ fontSize: 18, fontWeight: 500, color: item.color }}>
                    {item.v}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: '14px 0 0', borderTop: '1px solid var(--line-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Pendapatan platform</span>
                <span className="sh-num" style={{ fontSize: 16, fontWeight: 500, color: 'var(--forest)' }}>
                  {fmtRupiah(stats.total_revenue)}
                </span>
              </div>
            </div>
          </AdminPanel>
        </div>

        {/* ── User activity sparklines ── */}
        <AdminPanel eyebrow="Aktivitas pengguna" title="Registrasi & retensi">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
            className="md:!grid-cols-4">
            {[
              {
                label: 'Pengguna baru (7h)',
                value: stats.new_users_7d,
                color: 'var(--forest)',
                data: trendVisitValues,
                badge: 'forest' as const,
                badgeText: `+${stats.new_users_7d} minggu ini`,
              },
              {
                label: 'Aktif 30 hari',
                value: stats.active_users_30d,
                color: 'var(--forest-3)',
                data: trendWebValues,
                badge: 'forest' as const,
                badgeText: 'Berdasarkan panen',
              },
              {
                label: 'Online sekarang',
                value: stats.online_users_now,
                color: 'var(--amber-2)',
                data: trendMobValues,
                badge: 'amber' as const,
                badgeText: '↑ live',
              },
              {
                label: 'Total terdaftar',
                value: stats.total_users,
                color: 'var(--c-sky)',
                data: trendVisitValues,
                badge: undefined,
                badgeText: 'Semua akun',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 16, borderRadius: 12,
                  background: 'var(--paper)',
                  border: '1px solid var(--line-2)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: item.color }} />
                <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, fontFamily: 'var(--f-mono)', marginBottom: 8 }}>
                  {item.label}
                </div>
                <div className="sh-num" style={{ fontSize: 26, fontWeight: 500, color: 'var(--ink)', marginBottom: 10 }}>
                  {typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : item.value}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  {item.badge ? (
                    <AdminBadge tone={item.badge}>{item.badgeText}</AdminBadge>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--ink-5)' }}>{item.badgeText}</span>
                  )}
                  {item.data.length > 1 && (
                    <MiniSparkline data={item.data} color={item.color} width={52} height={22} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

      </div>
    </AdminLayout>
  )
}
