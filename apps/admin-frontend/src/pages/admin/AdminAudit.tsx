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

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
  tambah_panen:     { label: 'Panen',     color: '#4ade80', icon: '🌾' },
  tambah_lahan:     { label: 'Lahan',     color: '#38bdf8', icon: '🌱' },
  tambah_perawatan: { label: 'Perawatan', color: '#a78bfa', icon: '🔧' },
  daftar:           { label: 'Daftar',    color: '#f59e0b', icon: '🆕' },
}

const FILTER_OPTIONS = [
  { value: 'all',             label: 'Semua Aktivitas' },
  { value: 'tambah_panen',    label: '🌾 Panen' },
  { value: 'tambah_lahan',    label: '🌱 Lahan' },
  { value: 'tambah_perawatan',label: '🔧 Perawatan' },
  { value: 'daftar',          label: '🆕 Pendaftaran' },
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
          description="Filter aktivitas penting, cari aktor tertentu, dan gunakan paging agar audit tetap ringan. Setiap baris menonjolkan siapa, apa, kapan, dan dampak ringkasnya."
          accent="#ec4899"
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminMetricCard label="Aktivitas Halaman" value={logs.length.toLocaleString('id-ID')} hint={`page ${page}`} accent="#ec4899" icon="📋" />
          <AdminMetricCard label="Panen" value={(activityCounts.tambah_panen ?? 0).toLocaleString('id-ID')} hint="catatan panen masuk" accent="var(--forest)" icon="🌾" />
          <AdminMetricCard label="Lahan" value={(activityCounts.tambah_lahan ?? 0).toLocaleString('id-ID')} hint="data kebun dibuat" accent="#38bdf8" icon="🌱" />
          <AdminMetricCard label="Perawatan" value={(activityCounts.tambah_perawatan ?? 0).toLocaleString('id-ID')} hint="tindakan perawatan" accent="#a78bfa" icon="🔧" />
        </div>

        <AdminPanel
          eyebrow="Filter"
          title="Cari aktivitas"
          description="Filter tipe aktivitas untuk investigasi cepat, lalu persempit dengan username, email, atau detail."
        >
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setFilterType(opt.value); setPage(1) }}
                className="px-3 py-2 rounded-xl text-xs font-medium transition"
                style={{
                  background: filterType === opt.value ? 'rgba(236,72,153,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${filterType === opt.value ? 'rgba(236,72,153,0.45)' : 'rgba(255,255,255,0.08)'}`,
                  color: filterType === opt.value ? '#f9a8d4' : 'rgba(255,255,255,0.5)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <AdminSearchField
              value={search}
              onChange={setSearch}
              placeholder="Cari username, email, atau detail..."
              className="flex-1"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="rounded-2xl px-4 py-3 text-sm font-medium transition"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Bersihkan
              </button>
            )}
          </div>
        </AdminPanel>

        {loading ? (
          <AdminSkeleton rows={6} height="h-20" />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon="📋"
            title={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada aktivitas tercatat'}
            description="Aktivitas akan muncul ketika pengguna menambah lahan, panen, perawatan, atau membuat akun."
          />
        ) : (
          <AdminPanel
            eyebrow="Feed"
            title="Riwayat aktivitas"
            description={`Menampilkan ${filtered.length.toLocaleString('id-ID')} aktivitas pada halaman ini.`}
          >
            <div className="space-y-3">
              {filtered.map((log, idx) => {
                const meta = ACTION_META[log.action_type] ?? { label: log.action_type, color: '#94a3b8', icon: '📝' }
                return (
                  <article key={`${log.activity_time}-${idx}`}
                    className="flex flex-col gap-3 rounded-[22px] px-4 py-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
                      style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}28` }}
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{log.username}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                          background: `${meta.color}20`,
                          color: meta.color,
                        }}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {log.user_email}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>
                        {log.detail}
                      </p>
                    </div>
                    <p className="text-xs shrink-0 text-left sm:text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {fmtDate(log.activity_time)}
                    </p>
                  </article>
                )
              })}
            </div>

            <AdminPagination
              page={page}
              totalLabel={`Halaman ${page} · ${filtered.length.toLocaleString('id-ID')} aktivitas terlihat`}
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
