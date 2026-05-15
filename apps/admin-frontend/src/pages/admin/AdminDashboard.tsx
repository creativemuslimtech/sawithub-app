import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminPageHero,
  AdminSectionLabel,
  AdminSkeleton,
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
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

function VisitBar({ web, mobile, total }: { web: number; mobile: number; total: number }) {
  if (total === 0) return <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
  const webPct = (web / total) * 100
  const mobPct = (mobile / total) * 100
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full gap-0.5">
      <div className="rounded-full" style={{ width: `${webPct}%`, background: '#38bdf8' }} />
      <div className="rounded-full" style={{ width: `${mobPct}%`, background: '#a78bfa' }} />
    </div>
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

  return (
    <AdminLayout>
      <div className="space-y-6">
            {loading ? (
              <AdminSkeleton rows={5} height="h-28" />
            ) : stats ? (
              <div className="space-y-8">
                <AdminPageHero
                  eyebrow="Admin Command Center"
                  title="Kontrol sistem yang lebih tajam, rapi, dan cepat dibaca."
                  description="Pantau kunjungan, pengguna aktif, kualitas data, dan aktivitas panen dari satu pusat kendali. Setiap menu admin dibuat konsisten agar keputusan harian lebih mudah diambil dari desktop maupun mobile."
                  accent="#22c55e"
                />

                {/* ── Kunjungan Website ── */}
                <section>
                  <AdminSectionLabel>Kunjungan Website</AdminSectionLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <StatCard title="Total Kunjungan" value={stats.visit_total.toLocaleString('id-ID')} icon="🌐" color="#38bdf8"
                      sub="Semua waktu" />
                    <StatCard title="Kunjungan Hari Ini" value={stats.visit_today.toLocaleString('id-ID')} icon="📅" color="#4ade80"
                      sub={new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })} />
                    <StatCard title="Via Web Browser" value={stats.visit_web.toLocaleString('id-ID')} icon="💻" color="#38bdf8"
                      sub={`${stats.visit_total > 0 ? ((stats.visit_web / stats.visit_total) * 100).toFixed(1) : 0}% dari total`} />
                    <StatCard title="Via Mobile" value={stats.visit_mobile.toLocaleString('id-ID')} icon="📱" color="#a78bfa"
                      sub={`${stats.visit_total > 0 ? ((stats.visit_mobile / stats.visit_total) * 100).toFixed(1) : 0}% dari total`} />
                  </div>

                  {/* Visit trend + top countries */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* 7-day trend */}
                    <div className="rounded-2xl p-5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h3 className="text-sm font-semibold text-white mb-4">Tren 7 Hari Terakhir</h3>
                      {stats.visit_trend && stats.visit_trend.length > 0 ? (
                        <div className="space-y-2.5">
                          {stats.visit_trend.map((t, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                  {fmtDate(t.day)}
                                </span>
                                <div className="flex gap-3 text-[11px]">
                                  <span style={{ color: '#38bdf8' }}>💻 {t.web}</span>
                                  <span style={{ color: '#a78bfa' }}>📱 {t.mobile}</span>
                                  <span className="font-semibold text-white">{t.total}</span>
                                </div>
                              </div>
                              <VisitBar web={t.web} mobile={t.mobile} total={t.total} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/30 text-sm text-center py-6">Belum ada data kunjungan</p>
                      )}
                      <div className="flex gap-4 mt-4">
                        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#38bdf8' }} /> Web
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#a78bfa' }} /> Mobile
                        </span>
                      </div>
                    </div>

                    {/* Top countries */}
                    <div className="rounded-2xl p-5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h3 className="text-sm font-semibold text-white mb-4">Top Negara Pengunjung</h3>
                      {stats.top_countries && stats.top_countries.length > 0 ? (
                        <div className="space-y-3">
                          {stats.top_countries.map((c, i) => (
                            <div key={i}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-white">{c.country || 'Unknown'}</span>
                                <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>{c.count.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div className="h-full rounded-full"
                                  style={{
                                    width: `${stats.visit_total > 0 ? (c.count / stats.visit_total) * 100 : 0}%`,
                                    background: `hsl(${140 + i * 30}, 70%, 60%)`,
                                  }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/30 text-sm text-center py-6">Belum ada data lokasi</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* ── Pengguna ── */}
                <section>
                  <AdminSectionLabel>Pengguna</AdminSectionLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Pengguna" value={stats.total_users} icon="👥" color="#7a5cff"
                      sub="Semua akun terdaftar" />
                    <StatCard title="Online Sekarang" value={stats.online_users_now} icon="🟢" color="#84cc16"
                      sub="Aktif dalam 3 menit terakhir" />
                    <StatCard title="Aktif (30 hari)" value={stats.active_users_30d} icon="✅" color="#06b6d4"
                      sub="Berdasarkan aktivitas panen" />
                    <StatCard title="Pengguna Baru (7h)" value={stats.new_users_7d} icon="🆕" color="#a78bfa"
                      sub="Registrasi 7 hari terakhir" />
                    <StatCard title="Uptime Sistem" value={stats.system_uptime} icon="⚡" color="#f59e0b"
                      sub="Ketersediaan layanan" />
                  </div>
                </section>

                {/* ── Data Platform ── */}
                <section>
                  <AdminSectionLabel>Data Platform</AdminSectionLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Pendapatan" value={fmtRupiah(stats.total_revenue)} icon="💰" color="#10b981"
                      sub="Kumulatif semua user" />
                    <StatCard title="Total Panen" value={`${stats.total_panen} sesi`} icon="🌾" color="#4ade80"
                      sub="Seluruh catatan panen" />
                    <StatCard title="Total TBS Dipanen" value={`${stats.total_berat_ton.toFixed(1)} ton`} icon="⚖️" color="#facc15"
                      sub="Berat kumulatif" />
                    <StatCard title="Total Lahan" value={`${stats.total_lahan} kebun`} icon="🗺️" color="#38bdf8"
                      sub="Lahan terdaftar" />
                  </div>
                </section>

              </div>
            ) : (
              <div className="text-white/40">Gagal memuat data</div>
            )}
      </div>
    </AdminLayout>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  sub: string
}

function StatCard({ title, value, icon, color, sub }: StatCardProps) {
  return (
    <div
      className="rounded-[24px] p-4 md:p-5"
      style={{
        background: `linear-gradient(150deg, ${color}16 0%, rgba(8,12,18,0.9) 72%)`,
        border: `1px solid ${color}30`,
        boxShadow: `0 18px 42px ${color}10`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-white/45 text-xs leading-snug">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mb-1 text-lg font-bold leading-tight break-words md:text-xl xl:text-2xl" style={{ color }}>{value}</p>
      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</p>
    </div>
  )
}
