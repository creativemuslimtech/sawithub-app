import { useCallback, useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHero,
  AdminPagination,
  AdminPanel,
  AdminSearchField,
  AdminSkeleton,
} from '../../components/AdminUI'
import api from '../../api/client'

interface ActivityLog {
  username: string
  user_email: string
  action_type: string
  entity_type: string
  detail: string
  activity_time: string
}

const ACTION_META: Record<string, { label: string; color: string; tone: 'forest' | 'amber' | 'terra' | 'neutral' }> = {
  tambah_panen:     { label: 'Panen',     color: 'var(--forest)',    tone: 'forest' },
  tambah_lahan:     { label: 'Lahan',     color: 'var(--c-sky)',     tone: 'neutral' },
  tambah_perawatan: { label: 'Perawatan', color: 'var(--forest-3)',  tone: 'forest' },
  daftar:           { label: 'Daftar',    color: 'var(--amber-2)',   tone: 'amber' },
}

const FILTER_OPTIONS = [
  { value: 'all',             label: 'Semua' },
  { value: 'tambah_panen',    label: 'Panen' },
  { value: 'tambah_lahan',    label: 'Lahan' },
  { value: 'tambah_perawatan', label: 'Perawatan' },
  { value: 'daftar',          label: 'Daftar' },
]

function fmtDate(raw: string) {
  if (!raw) return '-'
  const d = new Date(raw)
  return isNaN(d.getTime()) ? raw : d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  })
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchAudit = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (filterType !== 'all') params.set('type', filterType)
    api.get(`/admin/audit?${params}`)
      .then(r => setLogs(r.data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [filterType, page])

  useEffect(() => {
    const timeout = window.setTimeout(fetchAudit, 0)
    return () => window.clearTimeout(timeout)
  }, [fetchAudit])

  const filtered = search
    ? logs.filter(l =>
        l.username.toLowerCase().includes(search.toLowerCase()) ||
        l.user_email.toLowerCase().includes(search.toLowerCase()) ||
        l.detail.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  const activityCounts = logs.reduce<Record<string, number>>((acc, item) => {
    acc[item.action_type] = (acc[item.action_type] ?? 0) + 1
    return acc
  }, {})

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHero
          eyebrow="Audit Trail"
          title="Aktivitas pengguna dibaca sebagai riwayat keputusan."
          description="Filter aktivitas penting, cari aktor tertentu, dan gunakan paging agar audit tetap ringan."
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminMetricCard label="Aktivitas Halaman" value={logs.length.toLocaleString('id-ID')} hint={`page ${page}`} color="var(--c-sky)" />
          <AdminMetricCard label="Panen" value={(activityCounts.tambah_panen ?? 0).toLocaleString('id-ID')} hint="catatan panen masuk" color="var(--forest)" />
          <AdminMetricCard label="Lahan" value={(activityCounts.tambah_lahan ?? 0).toLocaleString('id-ID')} hint="data kebun dibuat" color="var(--c-sky)" />
          <AdminMetricCard label="Perawatan" value={(activityCounts.tambah_perawatan ?? 0).toLocaleString('id-ID')} hint="tindakan perawatan" color="var(--forest-3)" />
        </div>

        <AdminPanel eyebrow="Filter" title="Cari aktivitas" description="Filter tipe aktivitas lalu persempit dengan username, email, atau detail.">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setFilterType(opt.value); setPage(1) }}
                style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: filterType === opt.value ? 'var(--forest)' : 'var(--paper)',
                  color: filterType === opt.value ? 'var(--paper)' : 'var(--ink-3)',
                  border: filterType === opt.value ? 'none' : '1px solid var(--line-2)',
                  fontFamily: 'var(--f-mono)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminSearchField value={search} onChange={setSearch} placeholder="Cari username, email, atau detail..." className="flex-1" />
            {search && (
              <button onClick={() => setSearch('')} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10 }}>
                Bersihkan
              </button>
            )}
          </div>
        </AdminPanel>

        {loading ? (
          <AdminSkeleton rows={6} height="h-20" />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>}
            title={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada aktivitas tercatat'}
            description="Aktivitas muncul saat pengguna menambah lahan, panen, perawatan, atau membuat akun."
          />
        ) : (
          <AdminPanel eyebrow="Feed" title="Riwayat aktivitas" description={`${filtered.length.toLocaleString('id-ID')} aktivitas pada halaman ini.`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((log, idx) => {
                const meta = ACTION_META[log.action_type] ?? { label: log.action_type, color: 'var(--ink-4)', tone: 'neutral' as const }
                return (
                  <article
                    key={`${log.activity_time}-${idx}`}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px',
                      background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 12,
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{
                        width: 36, height: 36, flexShrink: 0, borderRadius: 10,
                        background: 'var(--forest-soft)', color: 'var(--forest)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/></svg>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{log.username}</span>
                          <span className={`sh-chip sh-chip-${meta.tone === 'forest' ? 'forest' : meta.tone === 'amber' ? 'amber' : meta.tone === 'terra' ? 'terra' : ''}`} style={{ color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>{log.user_email}</p>
                        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{log.detail}</p>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--ink-5)', flexShrink: 0, fontFamily: 'var(--f-mono)', textAlign: 'right' }}>
                        {fmtDate(log.activity_time)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
            <AdminPagination
              page={page}
              totalLabel={`Halaman ${page} · ${filtered.length.toLocaleString('id-ID')} aktivitas`}
              onPrev={() => setPage(p => p - 1)}
              onNext={() => setPage(p => p + 1)}
              disableNext={logs.length < 20}
            />
          </AdminPanel>
        )}
      </div>
    </AdminLayout>
  )
}
