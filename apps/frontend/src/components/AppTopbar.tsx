import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SearchIcon, BellIcon, PlusIcon } from './ds/icons'

type AppTopbarProps = {
  title?: string
  subtitle?: string
  contextHint?: ReactNode
  headerActions?: ReactNode
  actions?: ReactNode
}

export default function AppTopbar({ title, subtitle, contextHint, headerActions, actions }: AppTopbarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 36px',
      height: 'var(--shell-topbar-height, 64px)',
      borderBottom: '1px solid var(--line-2)',
      background: 'rgba(245, 240, 232, 0.65)',
      backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      {/* Page title (mobile / optional) */}
      {title && (
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>{subtitle}</p>}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}>
          <SearchIcon size={16} />
        </span>
        <input
          className="sh-input"
          placeholder="Cari kebun, panen, biaya…"
          style={{
            height: 40, paddingLeft: 40, paddingRight: 40,
            background: 'var(--paper)', border: '1px solid var(--line-2)', fontSize: 13,
          }}
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>
          ⌘K
        </span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {contextHint}

        {/* Bell */}
        <Link
          to="/notifikasi"
          aria-label="Notifikasi"
          style={{
            width: 40, height: 40, borderRadius: 99,
            background: 'var(--paper)', border: '1px solid var(--line-2)',
            display: 'grid', placeItems: 'center',
            color: 'var(--ink-2)', position: 'relative',
            textDecoration: 'none',
          }}
        >
          <BellIcon size={18} />
          <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 99, background: 'var(--terracotta)', border: '2px solid var(--paper)' }} />
        </Link>

        {headerActions ?? actions ?? (
          <Link
            to="/panen/add"
            className="sh-btn sh-btn-primary sh-btn-sm"
            style={{ borderRadius: 999, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusIcon size={14} />
            Catat panen
          </Link>
        )}
      </div>
    </div>
  )
}
