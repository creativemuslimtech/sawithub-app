import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/useAuth'
import { getAdminAppUrl } from '../constants/adminApp'
import { shellProfileChipClass } from '../constants/appShellChrome'
import ConfirmDialog from './ConfirmDialog'

type ShellUserMenuProps = {
  /** Avatar circle fill (page accent), default green */
  accentColor?: string
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM4 20.5c0-3.5 4-5.5 8-5.5s8 2 8 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconChevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`${className ?? ''} shrink-0 transition-transform duration-200 ${open ? '-rotate-180' : ''}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const menuItemClass =
  'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium text-white/90 transition hover:bg-white/[0.06]'

type NotifRow = { is_read?: boolean }

export default function ShellUserMenu({ accentColor = '#22c55e' }: ShellUserMenuProps) {
  const { user, logout, logoutAll } = useAuth()
  const [open, setOpen] = useState(false)
  const [logoutAllBusy, setLogoutAllBusy] = useState(false)
  const [logoutAllConfirmOpen, setLogoutAllConfirmOpen] = useState(false)
  const [unreadNotif, setUnreadNotif] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const load = () => {
      api
        .get<{ items?: NotifRow[] }>('/NotificationCenterService', { params: { limit: 50 } })
        .then((r) => {
          if (cancelled) return
          const items = r.data?.items ?? []
          setUnreadNotif(items.filter((x) => !x.is_read).length)
        })
        .catch(() => {})
    }
    load()
    const id = window.setInterval(load, 120_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [user])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
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
  const email = user.email?.trim() || ''
  const adminAppUrl = getAdminAppUrl()

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className={`${shellProfileChipClass} max-w-[min(100vw-5rem,17rem)] text-white/90`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu akun"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: accentColor, color: '#080412' }}
        >
          {letter}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-left font-medium text-white/80 sm:block">
          {displayName}
        </span>
        {isAdmin ? (
          <span
            className="hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-sky-200 sm:inline-block"
            style={{ background: 'rgba(56,189,248,0.22)' }}
          >
            Admin
          </span>
        ) : (
          <span
            className="hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/55 sm:inline-block"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            Pengguna
          </span>
        )}
        <IconChevron open={open} className="text-white/45" />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-[60] w-[min(calc(100vw-1.5rem),17.5rem)] overflow-hidden rounded-xl py-1 shadow-2xl backdrop-blur-xl"
          style={{
            background: 'rgba(10,12,20,0.97)',
            boxShadow: '0 24px 56px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          role="menu"
        >
          <div className="border-b border-white/[0.08] px-3 pb-3 pt-2.5">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {email ? (
              <p className="mt-0.5 truncate text-[11px] leading-snug text-white/45">{email}</p>
            ) : null}
            <div className="mt-2">
              {isAdmin ? (
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold text-sky-200"
                  style={{ background: 'rgba(56,189,248,0.22)' }}
                >
                  Admin
                </span>
              ) : (
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold text-white/55"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  Pengguna
                </span>
              )}
            </div>
          </div>

          <div className="border-b border-white/[0.08] py-1" role="none">
            <Link
              to="/profile"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <IconUser className="text-white/55" />
              Profil
            </Link>
            {isAdmin && adminAppUrl ? (
              <a
                href={adminAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className={`${menuItemClass} text-sky-300 hover:text-sky-200`}
                onClick={() => setOpen(false)}
              >
                <IconShield className="text-sky-400/90" />
                Panel admin
              </a>
            ) : null}
            <Link
              to="/subscription"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <IconCard className="text-forest-3" />
              Langganan
            </Link>
            <Link
              to="/subscription/payments"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <IconCard className="text-forest-3" />
              Riwayat pembayaran
            </Link>
            <Link
              to="/notifikasi"
              role="menuitem"
              className={`${menuItemClass} justify-between`}
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <IconBell className="text-white/55" />
                Notifikasi
              </span>
              {unreadNotif > 0 ? (
                <span
                  className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                  style={{ background: 'rgba(248,113,113,0.95)', color: '#0c0418' }}
                >
                  {unreadNotif > 99 ? '99+' : unreadNotif}
                </span>
              ) : null}
            </Link>
            <Link
              to="/bantuan/akses"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white/70">i</span>
              Batas akses trial
            </Link>
          </div>

          <div className="py-1" role="none">
            <button
              type="button"
              role="menuitem"
              className={`${menuItemClass} text-amber-200/90 hover:text-amber-100`}
              disabled={logoutAllBusy}
              onClick={() => {
                setLogoutAllConfirmOpen(true)
              }}
            >
              <IconLogout className="text-amber-400/80" />
              {logoutAllBusy ? 'Memproses…' : 'Keluar semua perangkat'}
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${menuItemClass} text-red-300/95 hover:text-red-200`}
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              <IconLogout className="text-red-400/80" />
              Keluar
            </button>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={logoutAllConfirmOpen}
        title="Keluar dari semua perangkat?"
        message="Semua sesi login di perangkat lain akan berakhir. Anda mungkin perlu masuk kembali di perangkat ini."
        confirmLabel="Ya, keluar semua"
        busy={logoutAllBusy}
        danger
        onClose={() => {
          if (!logoutAllBusy) setLogoutAllConfirmOpen(false)
        }}
        onConfirm={async () => {
          setLogoutAllBusy(true)
          setOpen(false)
          try {
            await logoutAll()
          } catch {
            setLogoutAllBusy(false)
            window.alert('Gagal keluar dari semua perangkat. Coba lagi.')
          }
        }}
      />
    </div>
  )
}
