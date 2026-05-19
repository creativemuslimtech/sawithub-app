import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import { PlusIcon } from '../components/ds/icons'

interface ScheduleItem {
  id_jadwal?: string
  id_lahan: string
  jenis_perawatan: string
  deskripsi?: string
  frequensi_tipe: string
  frequensi_custom_hari?: number
  tanggal_mulai: string
  estimasi_biaya?: number
  catatan?: string
}

interface Lahan {
  id_lahan: string
  nama_kebun: string
}

const EVENT_COLORS: Record<string, string> = {
  pemupukan: 'var(--c1)',
  pupuk: 'var(--c1)',
  semprot: 'var(--c3)',
  penyemprotan: 'var(--c3)',
  pruning: 'var(--c5)',
  weeding: 'var(--c6)',
  tebas: 'var(--c6)',
}

function getEventColor(jenis: string): string {
  const key = jenis?.toLowerCase() || ''
  for (const [k, v] of Object.entries(EVENT_COLORS)) {
    if (key.includes(k)) return v
  }
  return 'var(--c2)'
}

function intervalDays(tipe: string, custom: number): number {
  switch (tipe) {
    case 'mingguan': return 7
    case 'dua_mingguan': return 14
    case 'bulanan': return 30
    case 'dua_bulanan': return 60
    case 'tiga_bulanan': return 90
    case 'empat_bulanan': return 120
    case 'enam_bulanan': return 180
    case 'dua_kali_tahunan': return 180
    case 'tiga_kali_tahunan': return 120
    case 'tahunan': return 365
    case 'custom': return custom > 0 ? custom : 30
    default: return 30
  }
}

function getOccurrencesInMonth(schedule: ScheduleItem, year: number, month: number): Date[] {
  if (!schedule.tanggal_mulai) return []
  const start = new Date(schedule.tanggal_mulai)
  if (isNaN(start.getTime())) return []
  const interval = intervalDays(schedule.frequensi_tipe, schedule.frequensi_custom_hari || 0)
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const results: Date[] = []
  let cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)
  // advance to month range
  while (cursor < monthStart) {
    cursor = new Date(cursor.getTime() + interval * 86400000)
  }
  while (cursor <= monthEnd) {
    results.push(new Date(cursor))
    cursor = new Date(cursor.getTime() + interval * 86400000)
  }
  return results
}

function getUpcomingSchedules(schedules: ScheduleItem[], lahanMap: Record<string, string>, n = 8): Array<{
  date: Date
  schedule: ScheduleItem
  lahanName: string
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming: Array<{ date: Date; schedule: ScheduleItem; lahanName: string }> = []
  const horizon = new Date(today.getTime() + 90 * 86400000)

  for (const s of schedules) {
    if (!s.tanggal_mulai) continue
    const start = new Date(s.tanggal_mulai)
    if (isNaN(start.getTime())) continue
    const interval = intervalDays(s.frequensi_tipe, s.frequensi_custom_hari || 0)
    let cursor = new Date(start)
    cursor.setHours(0, 0, 0, 0)
    while (cursor < today) cursor = new Date(cursor.getTime() + interval * 86400000)
    while (cursor <= horizon) {
      upcoming.push({ date: new Date(cursor), schedule: s, lahanName: lahanMap[s.id_lahan] || `Lahan #${s.id_lahan}` })
      cursor = new Date(cursor.getTime() + interval * 86400000)
    }
  }

  return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, n)
}

const DAYS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']

const ROTATION_PRESETS = [
  { label: 'Pemupukan 3 bulanan', name: 'Rotasi NPK', color: 'var(--c1)', matchKey: 'pupuk' },
  { label: 'Semprot rumput bulanan', name: 'Round-up + ajuvan', color: 'var(--c3)', matchKey: 'semprot' },
  { label: 'Pruning 6 bulanan', name: 'Pelepah tua + sanitasi', color: 'var(--c5)', matchKey: 'pruning' },
  { label: 'Weeding piringan', name: 'Manual + cangkul', color: 'var(--c6)', matchKey: 'weeding' },
]

const LEGEND = [
  { label: 'Pupuk', color: 'var(--c1)' },
  { label: 'Semprot', color: 'var(--c3)' },
  { label: 'Pruning', color: 'var(--c5)' },
  { label: 'Weeding', color: 'var(--c6)' },
]

export default function JadwalPerawatan() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(true)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  useEffect(() => {
    Promise.all([
      api.get('/CoreMaintenanceScheduleService'),
      api.get('/CorePlotService'),
    ]).then(([sr, lr]) => {
      setSchedules(sr.data || [])
      setLahans(lr.data || [])
    }).catch(() => toast.error('Gagal memuat jadwal perawatan'))
      .finally(() => setLoading(false))
  }, [])

  const lahanMap = Object.fromEntries(lahans.map(l => [l.id_lahan, l.nama_kebun]))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1)
  // Monday-based: getDay() returns 0=Sun, need to shift
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  const totalCells = 35

  // Build event map: day -> events
  const eventsByDay: Record<number, Array<{ label: string; color: string }>> = {}
  for (const s of schedules) {
    const occurrences = getOccurrencesInMonth(s, viewYear, viewMonth)
    for (const d of occurrences) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      if (eventsByDay[day].length < 3) {
        eventsByDay[day].push({
          label: s.jenis_perawatan,
          color: getEventColor(s.jenis_perawatan),
        })
      }
    }
  }

  const upcoming = getUpcomingSchedules(schedules, lahanMap)

  // Find next schedule per rotation preset
  const presetNextMap: Record<string, { date: Date; schedule: ScheduleItem } | null> = {}
  for (const preset of ROTATION_PRESETS) {
    const matched = schedules.filter(s => s.jenis_perawatan?.toLowerCase().includes(preset.matchKey))
    let earliest: { date: Date; schedule: ScheduleItem } | null = null
    for (const s of matched) {
      if (!s.tanggal_mulai) continue
      const start = new Date(s.tanggal_mulai)
      if (isNaN(start.getTime())) continue
      const interval = intervalDays(s.frequensi_tipe, s.frequensi_custom_hari || 0)
      let cursor = new Date(start)
      cursor.setHours(0, 0, 0, 0)
      while (cursor < today) cursor = new Date(cursor.getTime() + interval * 86400000)
      if (!earliest || cursor < earliest.date) earliest = { date: cursor, schedule: s }
    }
    presetNextMap[preset.matchKey] = earliest
  }

  function formatNextDate(date: Date | null): string {
    if (!date) return '—'
    const diff = Math.round((date.getTime() - today.getTime()) / 86400000)
    const fmted = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    if (diff === 0) return `${fmted} (hari ini)`
    if (diff === 1) return `${fmted} (besok)`
    return `${fmted} (${diff} hari lagi)`
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1
    if (dayNum < 1) return { day: prevMonthDays + dayNum, currentMonth: false }
    if (dayNum > daysInMonth) return { day: dayNum - daysInMonth, currentMonth: false }
    return { day: dayNum, currentMonth: true }
  })

  return (
    <AppLayout>
      <AppTopbar
        title="Kalender Perawatan"
        subtitle="Jadwal"
        actions={
          <Link
            to="/jadwal-perawatan/add"
            className="sh-btn sh-btn-primary sh-btn-sm"
            style={{ borderRadius: 999, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusIcon size={14} /> Buat Jadwal
          </Link>
        }
      />
      <div style={{ padding: '32px 36px 48px' }}>

        {/* Preset rotation cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
          {ROTATION_PRESETS.map((preset) => {
            const next = presetNextMap[preset.matchKey]
            return (
              <div key={preset.label} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: preset.color }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <p className="sh-eyebrow text-[10px]">{preset.label}</p>
                </div>
                <p className="display text-base font-bold text-ink" style={{ letterSpacing: '-0.015em' }}>{preset.name}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--ink-3)' }}>
                  Jadwal terdekat: <strong className="text-ink">{formatNextDate(next?.date || null)}</strong>
                </p>
              </div>
            )
          })}
        </div>

        {/* Calendar + upcoming */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="display text-2xl font-bold text-ink" style={{ letterSpacing: '-0.02em' }}>
                  {MONTHS_ID[viewMonth]} {viewYear}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg border border-line hover:bg-paper transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg border border-line hover:bg-paper transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex gap-2.5">
                {LEGEND.map(({ label, color }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3">
                    <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {DAYS_ID.map((d, i) => (
                <div
                  key={d}
                  className="text-center py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: i >= 5 ? 'var(--terracotta-2)' : 'var(--ink-4)' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((cell, idx) => {
                const isToday = cell.currentMonth &&
                  cell.day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear()
                const events = cell.currentMonth ? (eventsByDay[cell.day] || []) : []
                return (
                  <div
                    key={idx}
                    className="rounded-xl border p-2 min-h-[72px]"
                    style={{
                      borderColor: isToday ? 'var(--forest)' : 'var(--line)',
                      background: isToday ? 'var(--forest-soft)' : cell.currentMonth ? 'white' : 'var(--paper)',
                      opacity: cell.currentMonth ? 1 : 0.4,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="num text-[13px] font-bold"
                        style={{ color: isToday ? 'var(--forest-3)' : 'var(--ink)' }}
                      >
                        {cell.day}
                      </span>
                      {isToday && (
                        <span
                          className="text-[9px] font-bold text-white px-1 rounded-full"
                          style={{ background: 'var(--forest)', letterSpacing: '0.06em' }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {events.map((ev, i) => (
                        <div
                          key={i}
                          className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded overflow-hidden"
                          style={{
                            background: ev.color,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ev.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: upcoming + WhatsApp card */}
          <div className="flex flex-col gap-4">
            {/* Upcoming */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-5">
              <p className="sh-eyebrow mb-1">Akan datang</p>
              <h3 className="display text-lg font-bold text-ink mt-1 mb-4">Jadwal terdekat</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-ink-4">Belum ada jadwal.</p>
                  <Link to="/jadwal-perawatan/add" className="mt-2 inline-flex text-sm font-semibold" style={{ color: 'var(--forest-3)' }}>+ Buat jadwal →</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {upcoming.map(({ date, schedule, lahanName }, i) => {
                    const color = getEventColor(schedule.jenis_perawatan)
                    const mo = MONTHS_SHORT[date.getMonth()]
                    return (
                      <div key={i} className="flex gap-3 items-center p-2.5 rounded-xl border border-line bg-white">
                        <div
                          className="w-11 text-center py-1 rounded-lg shrink-0 text-white"
                          style={{ background: color }}
                        >
                          <div className="num text-lg font-black leading-none">{String(date.getDate()).padStart(2, '0')}</div>
                          <div className="text-[9px] font-bold tracking-[0.08em] mt-0.5">{mo}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-ink truncate">{schedule.jenis_perawatan}</p>
                          <p className="text-[11px] text-ink-4 mt-0.5 truncate">{lahanName}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* WhatsApp reminder card */}
            <div className="rounded-lg-1 p-5" style={{ background: 'var(--ink)', border: 'none' }}>
              <div className="flex gap-3 items-start">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--terracotta)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 15 19.79 19.79 0 0 1 1.07 6.36a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 12a16 16 0 0 0 6 6l.73-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Pengingat WhatsApp</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Fitur pengingat otomatis sedang dalam pengembangan. Jadwal yang dibuat di sini akan jadi dasar pengingat.
                  </p>
                  <Link
                    to="/jadwal-perawatan/add"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: 'var(--terracotta)' }}
                  >
                    Buat jadwal baru →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
