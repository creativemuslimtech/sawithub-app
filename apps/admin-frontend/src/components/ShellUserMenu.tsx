import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { shellProfileChipClass } from '../constants/appShellChrome'

type ShellUserMenuProps = {
  accentColor?: string
}

function IconUser({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM4 20.5c0-3.5 4-5.5 8-5.5s8 2 8 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconShield({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLogout({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevron({ open, className, style }: { open: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={`${className ?? ''} shrink-0 transition-transform duration-200 ${open ? '-rotate-180' : ''}`}
      style={style}
      width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ShellUserMenu({ accentColor = 'var(--amber)' }: ShellUserMenuProps) {
  const { user, logout, logoutAll } = useAuth()
  const [open, setOpen] = useState(false)
  const [logoutAllBusy, setLogoutAllBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
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
  const email = user.email?.trim() || ''

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className={shellProfileChipClass}
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line-2)',
          color: 'var(--ink)',
          maxWidth: 'min(100vw - 5rem, 17rem)',
        }}
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
        <span className="hidden min-w-0 flex-1 truncate text-left font-medium sm:block" style={{ color: 'var(--ink-2)', fontSize: 13 }}>
          {displayName}
        </span>
        {isAdmin ? (
          <span className="sh-chip hidden sm:inline-block" style={{ color: 'var(--c-sky)', background: 'rgba(74,122,140,0.12)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
            Admin
          </span>
        ) : (
          <span className="sh-chip hidden sm:inline-block" style={{ color: 'var(--ink-4)', fontSize: 10, fontWeight: 600 }}>
            Pengguna
          </span>
        )}
        <IconChevron open={open} style={{ color: 'var(--ink-4)' } as React.CSSProperties} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-[60] overflow-hidden rounded-xl py-1"
          style={{
            width: 'min(calc(100vw - 1.5rem), 17.5rem)',
            background: 'var(--paper)',
            border: '1px solid var(--line-2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          }}
          role="menu"
        >
          <div style={{ borderBottom: '1px solid var(--line-2)', padding: '10px 14px 12px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            {email ? (
              <p style={{ marginTop: 2, fontSize: 11, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
            ) : null}
            <div style={{ marginTop: 8 }}>
              {isAdmin ? (
                <span className="sh-chip" style={{ color: 'var(--c-sky)', background: 'rgba(74,122,140,0.12)', fontSize: 10, fontWeight: 700 }}>Admin</span>
              ) : (
                <span className="sh-chip" style={{ color: 'var(--ink-4)', fontSize: 10 }}>Pengguna</span>
              )}
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--line-2)', padding: '4px 0' }} role="none">
            <Link
              to="/admin/settings"
              role="menuitem"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none', transition: 'background 0.1s' }}
              className="hover:bg-[var(--cream)]"
              onClick={() => setOpen(false)}
            >
              <IconUser style={{ color: 'var(--ink-4)' } as React.CSSProperties} />
              Pengaturan Profil
            </Link>
            {isAdmin ? (
              <Link
                to="/admin"
                role="menuitem"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: 'var(--forest)', textDecoration: 'none', transition: 'background 0.1s' }}
                className="hover:bg-[var(--cream)]"
                onClick={() => setOpen(false)}
              >
                <IconShield style={{ color: 'var(--forest-3)' } as React.CSSProperties} />
                Dashboard Admin
              </Link>
            ) : null}
          </div>

          <div style={{ padding: '4px 0' }} role="none">
            <button
              type="button"
              role="menuitem"
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: 'var(--amber-2)', background: 'none', border: 'none', cursor: logoutAllBusy ? 'default' : 'pointer', textAlign: 'left', transition: 'background 0.1s', opacity: logoutAllBusy ? 0.5 : 1 }}
              className="hover:bg-[var(--cream)]"
              disabled={logoutAllBusy}
              onClick={async () => {
                if (!window.confirm('Keluar dari semua perangkat? Semua sesi admin lain akan ikut berakhir.')) return
                setLogoutAllBusy(true)
                setOpen(false)
                try {
                  await logoutAll()
                } catch {
                  toast.error('Gagal logout semua perangkat')
                  setLogoutAllBusy(false)
                }
              }}
            >
              <IconLogout style={{ color: 'var(--amber-2)' } as React.CSSProperties} />
              {logoutAllBusy ? 'Memproses…' : 'Keluar semua perangkat'}
            </button>
            <button
              type="button"
              role="menuitem"
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: 'var(--terracotta-2)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
              className="hover:bg-[var(--cream)]"
              onClick={() => { setOpen(false); logout() }}
            >
              <IconLogout style={{ color: 'var(--terracotta-2)' } as React.CSSProperties} />
              Keluar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
