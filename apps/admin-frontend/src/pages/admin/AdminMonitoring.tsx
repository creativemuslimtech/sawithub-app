import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminMetricCard,
  AdminPageHero,
  AdminPanel,
  AdminSkeleton,
  StatusDot,
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
  recent_activity: Array<{ username: string; email: string; role: string; created_at: string }>
}

function fmtDate(raw: string) {
  if (!raw || raw === '-') return '-'
  const d = new Date(raw)
  return isNaN(d.getTime()) ? raw : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

function statusTone(status: string): { label: string; sevClass: string; color: string; bg: string } {
  if (status === 'healthy')  return { label: 'Sehat',     sevClass: 'sh-chip sh-chip-forest', color: 'var(--forest)',    bg: 'var(--forest-soft)' }
  if (status === 'degraded') return { label: 'Terganggu', sevClass: 'sh-chip sh-chip-amber',  color: 'var(--amber-2)',   bg: 'var(--amber-soft)' }
  if (status === 'disabled') return { label: 'Nonaktif',  sevClass: 'sh-chip',                color: 'var(--ink-4)',     bg: 'var(--line-soft)' }
  if (status === 'idle')     return { label: 'Idle',      sevClass: 'sh-chip',                color: 'var(--ink-4)',     bg: 'var(--line-soft)' }
  return                            { label: 'Kritis',    sevClass: 'sh-chip sh-chip-terra',  color: 'var(--terracotta-2)', bg: 'var(--terra-soft)' }
}

function accessTone(access: string) {
  if (access === 'admin')     return { label: 'Admin',   cls: 'sh-chip sh-chip-terra' }
  if (access === 'protected') return { label: 'Login',   cls: 'sh-chip' }
  if (access === 'public')    return { label: 'Publik',  cls: 'sh-chip sh-chip-forest' }
  return                             { label: 'Unknown', cls: 'sh-chip' }
}

function methodColor(method: string) {
  if (method === 'GET')    return 'var(--c-sky)'
  if (method === 'POST')   return 'var(--forest)'
  if (method === 'PUT')    return 'var(--amber-2)'
  if (method === 'DELETE') return 'var(--terracotta-2)'
  return 'var(--ink-3)'
}

export default function AdminMonitoring() {
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiToggleError, setApiToggleError] = useState('')
  const [globalToggleLoading, setGlobalToggleLoading] = useState(false)
  const [endpointToggleLoading, setEndpointToggleLoading] = useState<Record<string, boolean>>({})

  const fetchData = () => {
    api.get('/admin/system')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleGlobalApiToggle = async (enabled: boolean) => {
    if (!enabled && !window.confirm('Nonaktifkan seluruh API publik? Aplikasi pengguna akan terblokir sampai dihidupkan lagi (perlu Redis).')) return
    setGlobalToggleLoading(true)
    setApiToggleError('')
    try {
      await setGlobalApiState(enabled)
      fetchData()
    } catch {
      setApiToggleError('Gagal mengubah status API global. Pastikan Redis aktif di admin backend.')
    } finally {
      setGlobalToggleLoading(false)
    }
  }

  const handleToggleEndpointAPI = async (endpoint: InternalApiStatus, enabled: boolean) => {
    const endpointKey = `${endpoint.method} ${endpoint.path}`
    setEndpointToggleLoading(prev => ({ ...prev, [endpointKey]: true }))
    setApiToggleError('')
    try {
      await api.put('/admin/system/api-endpoint-state', { method: endpoint.method, path: endpoint.path, enabled })
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
  const apiHealthyCount = useMemo(() => data?.api_status.filter(a => a.status === 'healthy').length ?? 0, [data])
  const internalSummary = data?.api_summary ?? { total: 0, observed: 0, healthy: 0, degraded: 0, critical: 0, idle: 0, total_requests: 0, client_error_requests: 0, server_error_requests: 0 }
  const internalProblemCount = internalSummary.degraded + internalSummary.critical
  const globalApiEnabled = data?.api_enabled !== false

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHero
          eyebrow="Monitoring"
          title="Status API dan database dalam satu tampilan."
          description="Pantau endpoint, error rate, dan latency. Toggle kill switch untuk kontrol darurat."
        />

        {loading ? (
          <AdminSkeleton rows={5} height="h-28" />
        ) : !data ? (
          <p style={{ fontSize: 14, color: 'var(--ink-4)', padding: 24 }}>Gagal memuat data sistem</p>
        ) : (
          <>
            {apiToggleError && (
              <div className="sh-chip sh-chip-terra" style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13, display: 'block' }}>
                {apiToggleError}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AdminMetricCard label="API Eksternal" value={`${apiHealthyCount}/${data.api_status.length}`} hint="layanan pihak ketiga sehat" color="var(--c-sky)" />
              <AdminMetricCard label="API Internal" value={`${internalSummary.observed}/${internalSummary.total}`} hint={`${internalSummary.total_requests.toLocaleString('id-ID')} request`} color="var(--forest-3)" />
              <AdminMetricCard label="API Bermasalah" value={String(internalProblemCount)} hint="endpoint lambat atau 5xx" color={internalProblemCount > 0 ? 'var(--terracotta)' : 'var(--forest)'} />
              <AdminMetricCard label="API Idle" value={String(internalSummary.idle)} hint="belum dipanggil" color="var(--ink-4)" />
              <AdminMetricCard label="Client Error" value={internalSummary.client_error_requests.toLocaleString('id-ID')} hint="respons 4xx" color="var(--amber-2)" />
              <AdminMetricCard label="Database" value={dbHealthy ? 'Sehat' : 'Kritis'} hint="status koneksi MySQL" color={dbHealthy ? 'var(--forest)' : 'var(--terracotta)'} />
            </div>

            {/* Kill switch */}
            <AdminPanel eyebrow="Kontrol darurat" title="Kill switch API publik (global)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 680 }}>
                  Mengatur Redis key kontrol untuk seluruh API publik. Saat OFF, gate mengembalikan respons layanan tidak tersedia. Toggle endpoint individual di bawah untuk penyempitan lebih lanjut.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 16px', borderRadius: 10, border: '1px solid var(--line-2)', background: globalApiEnabled ? 'var(--forest-soft)' : 'var(--terra-soft)' }}>
                    <input
                      type="checkbox"
                      checked={globalApiEnabled}
                      disabled={globalToggleLoading || loading || !data}
                      onChange={e => handleGlobalApiToggle(e.target.checked)}
                      style={{ accentColor: 'var(--forest)', width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: globalApiEnabled ? 'var(--forest)' : 'var(--terracotta-2)' }}>
                      {globalToggleLoading ? 'Menyimpan…' : globalApiEnabled ? 'API publik ON' : 'API publik OFF'}
                    </span>
                  </label>
                </div>
              </div>
            </AdminPanel>

            {/* External API */}
            <AdminPanel eyebrow="API Eksternal" title="Layanan pihak ketiga" description="API pihak ketiga yang digunakan backend SawitHub">
              {data.api_status.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--ink-5)', textAlign: 'center', padding: '24px 0' }}>Belum ada API eksternal yang dipantau</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {data.api_status.map(service => {
                    const tone = statusTone(service.status)
                    return (
                      <div key={service.key} style={{ padding: 18, borderRadius: 12, background: 'var(--cream)', border: '1px solid var(--line-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <StatusDot severity={service.status === 'healthy' ? 'ok' : service.status === 'degraded' ? 'warn' : service.status === 'idle' ? 'info' : 'critical'} />
                              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{service.name}</h3>
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--ink-4)', wordBreak: 'break-all' }}>{service.endpoint}</p>
                          </div>
                          <span className={tone.sevClass}>{tone.label}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12 }}>{service.message}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[['Latency', `${service.latency_ms} ms`], ['HTTP Code', String(service.code ?? '-')]].map(([l, v]) => (
                            <div key={l} style={{ padding: '8px 10px', background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line-2)' }}>
                              <p style={{ fontSize: 10.5, color: 'var(--ink-4)', marginBottom: 2 }}>{l}</p>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--f-mono)' }}>{v}</p>
                            </div>
                          ))}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 10, fontFamily: 'var(--f-mono)' }}>Dicek: {fmtDate(service.checked_at)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </AdminPanel>

            {/* Internal API table */}
            <AdminPanel eyebrow="API Internal" title="Endpoint SawitHub" description="Seluruh endpoint `/api` beserta request count, error bucket, dan latency">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  ['Total Endpoint', String(internalSummary.total)],
                  ['Observed', String(internalSummary.observed)],
                  ['5xx Errors', internalSummary.server_error_requests.toLocaleString('id-ID')],
                  ['Total Request', internalSummary.total_requests.toLocaleString('id-ID')],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px 14px', background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--line-2)' }}>
                    <p style={{ fontSize: 10.5, color: 'var(--ink-4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--f-mono)' }}>{l}</p>
                    <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--f-mono)' }}>{v}</p>
                  </div>
                ))}
              </div>

              {data.internal_api_status.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--ink-5)', textAlign: 'center', padding: '24px 0' }}>Belum ada endpoint internal yang terpantau</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--line-2)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line-2)' }}>
                        {['Endpoint', 'Akses', 'Status', 'Toggle', 'Request', '4xx / 5xx', 'Latency', 'Terakhir'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-4)', fontFamily: 'var(--f-mono)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.internal_api_status.map(endpoint => {
                        const tone = statusTone(endpoint.status)
                        const access = accessTone(endpoint.access)
                        const endpointKey = `${endpoint.method} ${endpoint.path}`
                        const endpointEnabled = endpoint.enabled !== false
                        const rowToggleLoading = endpointToggleLoading[endpointKey] === true
                        return (
                          <tr key={endpoint.key} style={{ borderBottom: '1px solid var(--line-2)' }} className="transition hover:bg-[var(--paper-2)]">
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700, fontFamily: 'var(--f-mono)', color: methodColor(endpoint.method), background: `${methodColor(endpoint.method)}14` }}>
                                  {endpoint.method}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{endpoint.name}</span>
                                {endpoint.observed_unknown && (
                                  <span className="sh-chip" style={{ fontSize: 10 }}>Runtime</span>
                                )}
                              </div>
                              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 2 }}>{endpoint.path}</p>
                              <p style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{endpoint.group} · {endpoint.health_note || endpoint.description}</p>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <span className={access.cls}>{access.label}</span>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <span className={tone.sevClass}>{tone.label}</span>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line-2)', background: endpointEnabled ? 'var(--forest-soft)' : 'var(--paper-2)', width: 'fit-content' }}>
                                <input
                                  type="checkbox"
                                  checked={endpointEnabled}
                                  disabled={rowToggleLoading}
                                  onChange={e => handleToggleEndpointAPI(endpoint, e.target.checked)}
                                  style={{ accentColor: 'var(--forest)', width: 14, height: 14 }}
                                />
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: endpointEnabled ? 'var(--forest)' : 'var(--ink-4)' }}>
                                  {rowToggleLoading ? '...' : endpointEnabled ? 'ON' : 'OFF'}
                                </span>
                              </label>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <p style={{ fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--f-mono)' }}>{endpoint.total_requests.toLocaleString('id-ID')}</p>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <p style={{ fontWeight: 600, fontFamily: 'var(--f-mono)', color: (endpoint.client_error_requests + endpoint.server_error_requests) > 0 ? 'var(--terracotta-2)' : 'var(--ink)' }}>
                                {endpoint.client_error_requests} / {endpoint.server_error_requests}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>terakhir {endpoint.last_status_code ?? '-'}</p>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <p style={{ fontWeight: 600, fontFamily: 'var(--f-mono)', color: endpoint.avg_latency_ms > 500 ? 'var(--terracotta-2)' : 'var(--ink)' }}>{endpoint.avg_latency_ms} ms</p>
                              <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>last {endpoint.last_latency_ms} ms · max {endpoint.max_latency_ms} ms</p>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                              <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 12 }}>{endpoint.last_seen_relative}</p>
                              <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{fmtDate(endpoint.last_seen_at)}</p>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminPanel>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
