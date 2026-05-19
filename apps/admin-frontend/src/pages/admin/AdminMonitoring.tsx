import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminPageHero,
  AdminSectionLabel,
  AdminSkeleton,
} from '../../components/AdminUI'
import api, { setGlobalApiState } from '../../api/client'

interface ApiStatus {
  key: string
  name: string
  endpoint: string
  status: 'healthy' | 'degraded' | 'critical' | 'disabled' | 'idle'
  message: string
  code?: number
  latency_ms: number
  checked_at: string
}

interface InternalApiStatus {
  key: string
  name: string
  method: string
  path: string
  group: string
  access: 'public' | 'protected' | 'admin' | 'unknown'
  description: string
  status: 'healthy' | 'degraded' | 'critical' | 'idle'
  enabled?: boolean
  total_requests: number
  client_error_requests: number
  server_error_requests: number
  avg_latency_ms: number
  last_latency_ms: number
  max_latency_ms: number
  last_status_code?: number
  last_seen_at: string
  last_seen_relative: string
  observed: boolean
  observed_unknown: boolean
  health_note?: string
}

interface ApiSummary {
  total: number
  observed: number
  healthy: number
  degraded: number
  critical: number
  idle: number
  total_requests: number
  client_error_requests: number
  server_error_requests: number
}

interface SystemData {
  db_status: string
  total_users: number
  new_users_today: number
  panen_today: number
  revenue_today: number
  total_lahan: number
  total_perawatan: number
  api_status: ApiStatus[]
  api_enabled?: boolean
  api_summary: ApiSummary
  internal_api_status: InternalApiStatus[]
  recent_activity: Array<{
    username: string
    email: string
    role: string
    created_at: string
  }>
}

function fmtDate(raw: string) {
  if (!raw || raw === '-') return '-'
  const d = new Date(raw)
  return isNaN(d.getTime()) ? raw : d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  })
}

function statusTone(status: string) {
  if (status === 'healthy') return { label: 'Sehat', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }
  if (status === 'degraded') return { label: 'Terganggu', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }
  if (status === 'disabled') return { label: 'Nonaktif', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
  if (status === 'idle') return { label: 'Idle', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
  return { label: 'Kritis', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
}

function accessTone(access: string) {
  if (access === 'admin') return { label: 'Admin', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
  if (access === 'protected') return { label: 'Login', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' }
  if (access === 'public') return { label: 'Publik', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }
  return { label: 'Unknown', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
}

function methodTone(method: string) {
  if (method === 'GET') return { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' }
  if (method === 'POST') return { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }
  if (method === 'PUT') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  if (method === 'DELETE') return { color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
  return { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }
}

function StatCard({
  label, value, sub, accent, icon,
}: { label: string; value: string; sub?: string; accent: string; icon: string }) {
  return (
    <div
      className="rounded-[24px] p-4 md:p-5"
      style={{
        background: `linear-gradient(150deg, ${accent}16 0%, rgba(8,12,18,0.9) 72%)`,
        border: `1px solid ${accent}30`,
        boxShadow: `0 18px 42px ${accent}10`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase" style={{ color: `${accent}bb`, letterSpacing: '0.12em' }}>{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-lg font-bold leading-tight text-white break-words md:text-xl xl:text-2xl">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
    </div>
  )
}

export default function AdminMonitoring() {
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiToggleError, setApiToggleError] = useState('')
  const [globalToggleLoading, setGlobalToggleLoading] = useState(false)
  const [endpointToggleLoading, setEndpointToggleLoading] = useState<Record<string, boolean>>({})

  const fetchData = () => {
    api.get('/admin/system')
      .then(r => {
        setData(r.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleGlobalApiToggle = async (enabled: boolean) => {
    if (!enabled) {
      if (
        !window.confirm(
          'Nonaktifkan seluruh API publik? Aplikasi pengguna akan terblokir sampai dihidupkan lagi (perlu Redis).',
        )
      ) {
        return
      }
    }
    setGlobalToggleLoading(true)
    setApiToggleError('')
    try {
      await setGlobalApiState(enabled)
      fetchData()
    } catch {
      setApiToggleError(
        'Gagal mengubah status API global. Pastikan Redis aktif di admin backend.',
      )
    } finally {
      setGlobalToggleLoading(false)
    }
  }

  const handleToggleEndpointAPI = async (endpoint: InternalApiStatus, enabled: boolean) => {
    const endpointKey = `${endpoint.method} ${endpoint.path}`
    setEndpointToggleLoading(prev => ({ ...prev, [endpointKey]: true }))
    setApiToggleError('')
    try {
      await api.put('/admin/system/api-endpoint-state', {
        method: endpoint.method,
        path: endpoint.path,
        enabled,
      })
      fetchData()
    } catch {
      setApiToggleError(`Gagal mengubah status endpoint ${endpoint.method} ${endpoint.path}`)
    } finally {
      setEndpointToggleLoading(prev => ({ ...prev, [endpointKey]: false }))
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [])

  const dbHealthy = data?.db_status === 'healthy'
  const apiHealthyCount = useMemo(
    () => data?.api_status.filter(apiItem => apiItem.status === 'healthy').length ?? 0,
    [data],
  )
  const internalSummary = data?.api_summary ?? {
    total: 0,
    observed: 0,
    healthy: 0,
    degraded: 0,
    critical: 0,
    idle: 0,
    total_requests: 0,
    client_error_requests: 0,
    server_error_requests: 0,
  }
  const internalProblemCount = internalSummary.degraded + internalSummary.critical
  const globalApiEnabled = data?.api_enabled !== false

  return (
    <AdminLayout>
      <div className="space-y-6">
            <AdminPageHero
              eyebrow="Monitoring"
              title="Monitoring API dan database."
              description="Pantau status endpoint, error, dan latency dalam tampilan ringkas."
              accent={dbHealthy ? 'var(--forest)' : '#f87171'}
            />

            {loading ? (
              <AdminSkeleton rows={5} height="h-28" />
            ) : !data ? (
              <p className="text-white/40">Gagal memuat data sistem</p>
            ) : (
              <>
                {apiToggleError && (
                  <div className="rounded-xl px-5 py-3 mb-6"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p className="text-xs font-medium" style={{ color: '#f87171' }}>{apiToggleError}</p>
                  </div>
                )}
                <AdminSectionLabel>Ringkasan API</AdminSectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <StatCard label="API Eksternal" value={`${apiHealthyCount}/${data.api_status.length}`} sub="layanan pihak ketiga sehat" accent="#0ea5e9" icon="🌐" />
                  <StatCard label="API Internal" value={`${internalSummary.observed}/${internalSummary.total}`} sub={`${internalSummary.total_requests.toLocaleString('id-ID')} request tercatat`} accent="#ef4444" icon="🧭" />
                  <StatCard label="API Bermasalah" value={String(internalProblemCount)} sub="endpoint lambat atau 5xx" accent="#f87171" icon="🚨" />
                  <StatCard label="API Idle" value={String(internalSummary.idle)} sub="belum dipanggil sejak backend hidup" accent="#94a3b8" icon="⏸️" />
                  <StatCard label="Client Error" value={internalSummary.client_error_requests.toLocaleString('id-ID')} sub="respons 4xx tercatat" accent="#f59e0b" icon="⚠️" />
                  <StatCard label="Database" value={dbHealthy ? 'Sehat' : 'Kritis'} sub="status koneksi MySQL" accent={dbHealthy ? '#4ade80' : '#f87171'} icon={dbHealthy ? '🟢' : '🔴'} />
                </div>

                <AdminSectionLabel>Kill switch — API publik (global)</AdminSectionLabel>
                <div
                  className="rounded-2xl p-6 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                  style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)' }}
                >
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white mb-1">Master toggle API</h2>
                    <p className="text-white/45 text-xs max-w-xl">
                      Mengatur Redis key kontrol untuk seluruh API publik (user backend). Saat OFF, gate mengembalikan respons layanan tidak tersedia. Endpoint-per-endpoint di bawah tetap bisa dipakai untuk penyempitan lebih lanjut.
                    </p>
                  </div>
                  <label
                    className="flex items-center gap-3 shrink-0 rounded-xl px-4 py-3 cursor-pointer select-none"
                    style={{ border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <input
                      type="checkbox"
                      checked={globalApiEnabled}
                      disabled={globalToggleLoading || loading || !data}
                      onChange={e => handleGlobalApiToggle(e.target.checked)}
                      className="h-5 w-5 accent-forest"
                    />
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      {globalToggleLoading ? 'Menyimpan…' : globalApiEnabled ? 'API publik ON' : 'API publik OFF'}
                    </span>
                  </label>
                </div>

                <div className="rounded-2xl p-6 mb-8"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">Status API Eksternal</h2>
                      <p className="text-white/35 text-xs">API pihak ketiga yang digunakan backend SawitHub</p>
                    </div>
                  </div>
                  {data.api_status.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">Belum ada API eksternal yang dipantau</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.api_status.map(service => {
                        const tone = statusTone(service.status)
                        return (
                          <div key={service.key} className="rounded-2xl p-5"
                            style={{ background: `${tone.color}10`, border: `1px solid ${tone.color}30` }}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-sm font-semibold text-white">{service.name}</h3>
                                <p className="text-[11px] mt-1 break-all" style={{ color: 'rgba(255,255,255,0.35)' }}>{service.endpoint}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: tone.color, background: tone.bg }}>
                                {tone.label}
                              </span>
                            </div>
                            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>{service.message}</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <p style={{ color: 'rgba(255,255,255,0.3)' }}>Latency</p>
                                <p className="text-white font-semibold">{service.latency_ms} ms</p>
                              </div>
                              <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <p style={{ color: 'rgba(255,255,255,0.3)' }}>HTTP Code</p>
                                <p className="text-white font-semibold">{service.code ?? '-'}</p>
                              </div>
                            </div>
                            <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              Dicek: {fmtDate(service.checked_at)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl p-6 mb-8"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">API Internal SawitHub</h2>
                      <p className="text-white/35 text-xs">Seluruh endpoint `/api` yang dipakai aplikasi, beserta request count, error bucket, dan latency</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Total Endpoint</p>
                        <p className="text-white font-semibold">{internalSummary.total}</p>
                      </div>
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Observed</p>
                        <p className="text-white font-semibold">{internalSummary.observed}</p>
                      </div>
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)' }}>5xx</p>
                        <p className="text-white font-semibold">{internalSummary.server_error_requests.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Total Request</p>
                        <p className="text-white font-semibold">{internalSummary.total_requests.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  {data.internal_api_status.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">Belum ada endpoint internal yang terpantau</p>
                  ) : (
                    <div className="overflow-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <table className="w-full min-w-[980px] text-sm">
                        <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <tr className="text-left">
                            <th className="px-4 py-3 text-white/40 font-medium">Endpoint</th>
                            <th className="px-4 py-3 text-white/40 font-medium">Akses</th>
                            <th className="px-4 py-3 text-white/40 font-medium">Status</th>
                            <th className="px-4 py-3 text-white/40 font-medium">Toggle API</th>
                            <th className="px-4 py-3 text-white/40 font-medium">Request</th>
                            <th className="px-4 py-3 text-white/40 font-medium">4xx / 5xx</th>
                            <th className="px-4 py-3 text-white/40 font-medium">Latency</th>
                            <th className="px-4 py-3 text-white/40 font-medium">Terakhir</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.internal_api_status.map((endpoint) => {
                            const tone = statusTone(endpoint.status)
                            const access = accessTone(endpoint.access)
                            const method = methodTone(endpoint.method)
                            const endpointKey = `${endpoint.method} ${endpoint.path}`
                            const endpointEnabled = endpoint.enabled !== false
                            const rowToggleLoading = endpointToggleLoading[endpointKey] === true
                            return (
                              <tr key={endpoint.key} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex items-start gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: method.color, background: method.bg }}>
                                      {endpoint.method}
                                    </span>
                                    <span className="text-white font-medium">{endpoint.name}</span>
                                    {endpoint.observed_unknown && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.12)' }}>
                                        Runtime
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-xs mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{endpoint.path}</p>
                                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    {endpoint.group} • {endpoint.health_note || endpoint.description}
                                  </p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: access.color, background: access.bg }}>
                                    {access.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: tone.color, background: tone.bg }}>
                                    {tone.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <label
                                    className="flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer select-none w-fit"
                                    style={{ border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.04)' }}
                                    title={`Toggle ${endpoint.method} ${endpoint.path}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={endpointEnabled}
                                      disabled={rowToggleLoading}
                                      onChange={e => handleToggleEndpointAPI(endpoint, e.target.checked)}
                                      className="h-4 w-4 accent-forest"
                                    />
                                    <span className="text-xs font-medium text-white/80">
                                      {rowToggleLoading ? '...' : (endpointEnabled ? 'ON' : 'OFF')}
                                    </span>
                                  </label>
                                </td>
                                <td className="px-4 py-4 align-top text-white">
                                  <p className="font-semibold">{endpoint.total_requests.toLocaleString('id-ID')}</p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <p className="text-white font-semibold">{endpoint.client_error_requests} / {endpoint.server_error_requests}</p>
                                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    status terakhir {endpoint.last_status_code ?? '-'}
                                  </p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <p className="text-white font-semibold">{endpoint.avg_latency_ms} ms</p>
                                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    last {endpoint.last_latency_ms} ms • max {endpoint.max_latency_ms} ms
                                  </p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <p className="text-white font-semibold">{endpoint.last_seen_relative}</p>
                                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtDate(endpoint.last_seen_at)}</p>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </>
            )}
      </div>
    </AdminLayout>
  )
}
