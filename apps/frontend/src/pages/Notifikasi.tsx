import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import api from '../api/client'

type Row = {
  id?: string
  title?: string
  message?: string
  type?: string
  created_at?: string
  is_read?: boolean
}

type TabKey = 'semua' | 'jadwal' | 'harga' | 'keuangan' | 'sistem'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'semua',    label: 'Semua' },
  { key: 'jadwal',   label: 'Jadwal' },
  { key: 'harga',    label: 'Harga TBS' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'sistem',   label: 'Sistem' },
]

function getTabKey(type: string | undefined): TabKey {
  const t = (type || '').toLowerCase()
  if (t.includes('jadwal') || t.includes('schedule') || t.includes('perawatan') || t.includes('pengingat')) return 'jadwal'
  if (t.includes('harga') || t.includes('price') || t.includes('tbs')) return 'harga'
  if (t.includes('keuangan') || t.includes('tagihan') || t.includes('billing') || t.includes('bayar') || t.includes('laporan')) return 'keuangan'
  if (t.includes('sistem') || t.includes('system') || t.includes('update') || t.includes('info')) return 'sistem'
  return 'jadwal'
}

function getItemColor(type: string | undefined) {
  const key = getTabKey(type)
  const map: Record<TabKey, string> = {
    jadwal: 'var(--c2)',
    harga: 'var(--c3)',
    keuangan: 'var(--terra)',
    sistem: 'var(--c4)',
    semua: 'var(--c1)',
  }
  return map[key]
}

function getChipLabel(type: string | undefined) {
  const t = (type || '').toLowerCase()
  if (t.includes('jadwal') || t.includes('schedule') || t.includes('perawatan')) return 'Jadwal'
  if (t.includes('pengingat') || t.includes('reminder')) return 'Pengingat'
  if (t.includes('harga') || t.includes('price') || t.includes('tbs')) return 'Harga'
  if (t.includes('laporan') || t.includes('report')) return 'Laporan'
  if (t.includes('tagihan') || t.includes('billing') || t.includes('bayar')) return 'Tagihan'
  if (t.includes('keuangan') || t.includes('subsidi') || t.includes('psr')) return 'Keuangan'
  if (t.includes('saran') || t.includes('ai')) return 'Saran'
  if (t.includes('sistem') || t.includes('system')) return 'Sistem'
  return 'Notifikasi'
}

function NotifIcon({ type }: { type: string | undefined }) {
  const t = (type || '').toLowerCase()
  let symbol = '🔔'
  if (t.includes('harga') || t.includes('price')) symbol = '↑'
  else if (t.includes('jadwal') || t.includes('schedule') || t.includes('perawatan')) symbol = '📅'
  else if (t.includes('laporan') || t.includes('chart')) symbol = '📊'
  else if (t.includes('tagihan') || t.includes('billing')) symbol = '✓'
  else if (t.includes('pengingat') || t.includes('reminder')) symbol = '⏰'
  else if (t.includes('saran') || t.includes('ai')) symbol = '✦'
  else if (t.includes('keuangan') || t.includes('subsidi')) symbol = 'Rp'
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: getItemColor(type),
      color: 'white', display: 'grid', placeItems: 'center',
      flexShrink: 0, fontSize: 16, fontWeight: 700,
    }}>
      {symbol}
    </div>
  )
}

function fmtTime(s: string | undefined) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

function dayGroupLabel(dateStr: string | undefined): string {
  if (!dateStr) return 'Sebelumnya'
  const d = new Date(dateStr)
  const now = new Date()
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayMid = new Date(todayMid.getTime() - 86400000)
  const weekAgoMid = new Date(todayMid.getTime() - 7 * 86400000)
  const itemMid = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (itemMid.getTime() === todayMid.getTime()) {
    return 'Hari ini · ' + d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
  }
  if (itemMid.getTime() === yesterdayMid.getTime()) {
    return 'Kemarin · ' + d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
  }
  if (itemMid.getTime() >= weekAgoMid.getTime()) {
    return 'Minggu lalu'
  }
  return 'Lebih lama'
}

function groupByDay(items: Row[]): { day: string; items: Row[] }[] {
  const map = new Map<string, Row[]>()
  for (const item of items) {
    const label = dayGroupLabel(item.created_at)
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(item)
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }))
}

export default function Notifikasi() {
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('semua')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ items?: Row[] }>('/NotificationCenterService', { params: { limit: 80 } })
      setItems(data.items ?? [])
    } catch {
      toast.error('Gagal memuat notifikasi.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const markRead = async (id: string) => {
    try {
      await api.patch(`/NotificationCenterService/${encodeURIComponent(id)}/read`)
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, is_read: true } : x)))
    } catch {
      toast.error('Gagal menandai dibaca.')
    }
  }

  const markAllRead = async () => {
    const unread = items.filter(x => !x.is_read && x.id)
    await Promise.all(unread.map(x => markRead(x.id!)))
  }

  const sorted = [...items].sort((a, b) =>
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )

  const filtered = activeTab === 'semua'
    ? sorted
    : sorted.filter(n => getTabKey(n.type) === activeTab)

  const tabCounts = TABS.map(t => ({
    ...t,
    count: t.key === 'semua' ? sorted.length : sorted.filter(n => getTabKey(n.type) === t.key).length,
  }))

  const groups = groupByDay(filtered)

  return (
    <AppLayout>
      <div className="px-7 py-7 pb-12">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2">Pemberitahuan</p>
            <h1 className="display text-4xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>Notifikasi</h1>
            <p className="mt-2 text-sm text-ink-3 max-w-xl">
              Pengingat jadwal, perubahan harga TBS, dan update sistem.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-3 hover:bg-paper transition-colors"
            >
              Tandai semua dibaca
            </button>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-3 hover:bg-paper transition-colors"
            >
              Muat ulang
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
          {tabCounts.map(({ key, label, count }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  color: active ? 'var(--ink)' : 'var(--ink-4)',
                  borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent',
                  marginBottom: -1,
                  display: 'inline-flex',
                  gap: 8,
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                {label}
                <span style={{
                  fontSize: 11,
                  padding: '1px 7px',
                  background: active ? 'var(--forest-soft)' : 'var(--paper-2)',
                  color: active ? 'var(--forest-3)' : 'var(--ink-3)',
                  borderRadius: 99,
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: 'var(--paper-2)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded animate-pulse w-2/3" style={{ background: 'var(--paper-2)' }} />
                    <div className="h-3 rounded animate-pulse w-full" style={{ background: 'var(--paper-2)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-4">Belum ada notifikasi{activeTab !== 'semua' ? ' di kategori ini' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ day, items: groupItems }) => (
              <div key={day}>
                <p className="eyebrow mb-2.5">{day}</p>
                <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm overflow-hidden">
                  {groupItems.map((n, i) => (
                    <div
                      key={n.id ?? `${n.title}-${n.created_at}`}
                      style={{
                        display: 'flex',
                        gap: 16,
                        padding: 18,
                        borderBottom: i < groupItems.length - 1 ? '1px solid var(--line)' : 'none',
                        background: !n.is_read ? 'rgba(10,120,71,0.03)' : 'transparent',
                      }}
                    >
                      <NotifIcon type={n.type} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {!n.is_read && (
                              <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--terra)', flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{n.title ?? 'Notifikasi'}</span>
                            <span className="chip" style={{ fontSize: 10, padding: '2px 7px' }}>
                              {getChipLabel(n.type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                              {fmtTime(n.created_at)}
                            </span>
                            {n.id && !n.is_read && (
                              <button
                                onClick={() => void markRead(n.id!)}
                                className="text-[11px] text-ink-4 hover:text-ink transition-colors"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55 }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
