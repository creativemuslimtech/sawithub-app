import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useFarm } from '../context/useFarm'
import { useAuth } from '../context/useAuth'
import Logo from './Logo'
import ConfirmDialog from './ConfirmDialog'
import api from '../api/client'

/* ── Nav items ─────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { key: 'ringkasan', label: 'Ringkasan', to: '/dashboard' },
  { key: 'lahan',     label: 'Lahan',     to: '/lahan' },
  { key: 'panen',     label: 'Panen',     to: '/panen' },
  { key: 'perawatan', label: 'Perawatan', to: '/perawatan' },
  { key: 'jadwal',    label: 'Jadwal',    to: '/jadwal-perawatan' },
  { key: 'keuangan',  label: 'Keuangan',  to: '/keuangan' },
  { key: 'laporan',   label: 'Laporan',   to: '/laporan-keuangan' },
  { key: 'kalkulator',label: 'Kalkulator',to: '/kalkulator-pupuk' },
]

function isActive(pathname: string, to: string) {
  if (to === '/dashboard') return pathname === to
  return pathname.startsWith(to)
}

/* ── FarmSwitcher (light) ──────────────────────────────────────── */

function FarmSwitcher() {
  const { lahans, activeFarmLimit, activeFarmId, setActiveFarm, loading } = useFarm()

  if (loading || activeFarmLimit <= 1 || lahans.length <= 1) return null

  return (
    <label className="flex min-w-0 items-center gap-1.5 shrink-0">
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4 sm:inline">Kebun</span>
      <select
        value={activeFarmId}
        onChange={(e) => void setActiveFarm(e.target.value)}
        aria-label="Pilih kebun aktif"
        className="max-w-[9rem] truncate rounded-full border border-line bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink outline-none focus:border-forest transition-colors"
      >
        <option value="">Semua kebun</option>
        {lahans.map((l) => (
          <option key={l.id_lahan} value={String(l.id_lahan)}>
            {l.nama_kebun}
          </option>
        ))}
      </select>
    </label>
  )
}

/* ── User Menu (light) ─────────────────────────────────────────── */

type NotifRow = { is_read?: boolean }

function UserMenu() {
  const { user, logout, logoutAll } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [logoutAllOpen, setLogoutAllOpen] = useState(false)
  const [logoutAllBusy, setLogoutAllBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const load = () => {
      api
        .get<{ items?: NotifRow[] }>('/NotificationCenterService', { params: { limit: 50 } })
        .then((r) => {
          if (cancelled) return
          setUnread((r.data?.items ?? []).filter((x) => !x.is_read).length)
        })
        .catch(() => {})
    }
    load()
    const id = window.setInterval(load, 120_000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [user])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  const displayName = user.full_name?.trim() || user.username || user.email || 'Pengguna'
  const letter = displayName.charAt(0).toUpperCase() || '?'
  const isAdmin = user.role === 'admin'

  const menuItem = 'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-ink-2 hover:bg-paper transition-colors'

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu akun"
        className="flex items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1.5 text-sm font-medium text-ink hover:bg-paper-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--forest), var(--forest-3))' }}
        >
          {letter}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:block">{displayName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className={`text-ink-4 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[60] w-56 overflow-hidden rounded-lg-1 border border-line bg-surface shadow-card-lg"
          role="menu"
        >
          <div className="border-b border-line px-3.5 pb-3 pt-3">
            <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
            {user.email && <p className="mt-0.5 truncate text-xs text-ink-4">{user.email}</p>}
            {isAdmin && (
              <span className="mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-semibold bg-forest-soft text-forest-3">Admin</span>
            )}
          </div>

          <div className="border-b border-line py-1" role="none">
            <Link to="/profile" role="menuitem" className={menuItem} onClick={() => setOpen(false)}>Profil saya</Link>
            <Link to="/subscription" role="menuitem" className={menuItem} onClick={() => setOpen(false)}>Langganan</Link>
            <Link
              to="/notifikasi"
              role="menuitem"
              className={`${menuItem} justify-between`}
              onClick={() => setOpen(false)}
            >
              <span>Notifikasi</span>
              {unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terra px-1 text-[10px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          </div>

          <div className="py-1" role="none">
            <button
              type="button"
              role="menuitem"
              className={`${menuItem} text-terra-2`}
              onClick={() => { setOpen(false); setLogoutAllOpen(true) }}
              disabled={logoutAllBusy}
            >
              Keluar semua perangkat
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${menuItem} text-terra-2`}
              onClick={() => { setOpen(false); logout() }}
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={logoutAllOpen}
        title="Keluar dari semua perangkat?"
        message="Semua sesi login di perangkat lain akan berakhir."
        confirmLabel="Ya, keluar semua"
        busy={logoutAllBusy}
        danger
        onClose={() => { if (!logoutAllBusy) setLogoutAllOpen(false) }}
        onConfirm={async () => {
          setLogoutAllBusy(true)
          setOpen(false)
          try {
            await logoutAll()
            navigate('/login')
          } catch {
            setLogoutAllBusy(false)
            window.alert('Gagal keluar dari semua perangkat. Coba lagi.')
          }
        }}
      />
    </div>
  )
}

/* ── Bell button ────────────────────────────────────────────────── */

function BellButton() {
  return (
    <Link
      to="/notifikasi"
      aria-label="Notifikasi"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-3 hover:bg-paper-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

/* ── Mobile hamburger ────────────────────────────────────────────── */

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu navigasi"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-3 hover:bg-paper-2 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          {open ? (
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-64 overflow-hidden rounded-lg-1 border border-line bg-surface shadow-card-lg">
          <nav className="py-1.5">
            {NAV_ITEMS.map(({ key, label, to }) => {
              const active = isActive(pathname, to)
              return (
                <Link
                  key={key}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={[
                    'block px-4 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-forest-soft text-forest-3' : 'text-ink-3 hover:bg-paper hover:text-ink',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}

/* ── AppTopNav ──────────────────────────────────────────────────── */

export default function AppTopNav() {
  const { pathname } = useLocation()

  return (
    <header
      className="md:hidden fixed inset-x-0 z-40"
      style={{
        top: 'var(--admin-banner-height, 0px)',
        background: 'rgba(245,240,232,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--line-2)',
        height: 'calc(var(--shell-topnav-height) + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="app-shell-gutter h-full">
        <div className="app-shell-container flex h-full items-center gap-4">
          {/* Wordmark */}
          <Link to="/dashboard" className="shrink-0" aria-label="Ke beranda">
            <Logo size="sm" />
          </Link>

          {/* Farm switcher */}
          <FarmSwitcher />

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2 ml-auto">
            <BellButton />
            <UserMenu />
            <MobileMenu pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  )
}
