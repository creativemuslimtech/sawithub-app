import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const icons = {
  overview: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  users: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  data: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  analytics: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  monitor: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  settings: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  audit: ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  ),
}

const BRAND = '#22c55e'

const NAV_ITEMS = [
  { to: '/admin',            label: 'Overview',   short: 'Ov',  note: 'Ringkasan sistem',     Icon: icons.overview  },
  { to: '/admin/users',      label: 'Pengguna',   short: 'Usr', note: 'Kelola akun pengguna', Icon: icons.users     },
  { to: '/admin/data',       label: 'Data',       short: 'Dat', note: 'Semua data platform',  Icon: icons.data      },
  { to: '/admin/analytics',  label: 'Analytics',  short: 'Ana', note: 'Analitik & tren',      Icon: icons.analytics },
  { to: '/admin/monitoring', label: 'Monitor',    short: 'Mon', note: 'Status sistem & API',  Icon: icons.monitor   },
  { to: '/admin/settings',   label: 'Pengaturan', short: 'Set', note: 'Konfigurasi aplikasi', Icon: icons.settings  },
  { to: '/admin/audit',      label: 'Audit',      short: 'Aud', note: 'Log aktivitas audit',  Icon: icons.audit     },
]

export default function AdminSidebar() {
  const { pathname } = useLocation()

  const isActive = (to: string) =>
    to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen z-30 flex-col overflow-hidden"
      style={{
        width: 'var(--admin-sidebar-w)',
        background: 'linear-gradient(180deg, rgba(5,8,12,0.98) 0%, rgba(10,6,20,0.98) 52%, rgba(7,16,12,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(18px)',
        boxShadow: '24px 0 60px rgba(0,0,0,0.28)',
      }}
    >
      <style>{`
        :root { --admin-sidebar-w: 104px; }
        @media (min-width: 1100px) { :root { --admin-sidebar-w: 248px; } }
        .admin-page-content { margin-left: 0; }
        @media (min-width: 768px) { .admin-page-content { margin-left: var(--admin-sidebar-w); } }
        .adm-label { display: none; }
        @media (min-width: 1100px) { .adm-label { display: block; } }
        .adm-short { display: block; }
        @media (min-width: 1100px) { .adm-short { display: none; } }
      `}</style>

      {/* Brand mark — h-14 matches the topbar's inner height so they sit flush */}
      <div className="border-b h-14 flex items-center px-3 min-[1100px]:px-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <Link
          to="/admin"
          className="flex justify-center min-[1100px]:justify-start rounded-xl p-2 transition"
          style={{ border: '1px solid transparent' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {/* Icon-only at 768–1099px where sidebar is 104px wide */}
          <Logo size="sm" showText={false} className="min-[1100px]:hidden justify-center" />
          <Logo size="sm" className="hidden min-[1100px]:flex justify-start" />
        </Link>
      </div>

      {/* Section label */}
      <div className="adm-label px-4 pt-4">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.28)' }}>Navigasi</p>
      </div>

      {/* Nav links */}
      <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {NAV_ITEMS.map(({ to, label, short, note, Icon: NavIcon }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className="w-full rounded-xl transition font-medium block"
              style={{
                background: active ? `${BRAND}18` : 'transparent',
                border: active ? `1px solid ${BRAND}35` : '1px solid transparent',
                color: active ? BRAND : 'rgba(255,255,255,0.55)',
                boxShadow: active ? `0 4px 16px ${BRAND}12` : 'none',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' } }}
            >
              <div className="flex items-center justify-center gap-3 px-3 py-2.5 min-[1100px]:justify-start">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: active ? `${BRAND}16` : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <NavIcon size={18} />
                </div>
                <div className="adm-label min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{label}</div>
                  <div className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.32)' }}>{note}</div>
                </div>
                <span className="adm-short text-[11px] font-semibold tracking-wide">{short}</span>
              </div>
            </Link>
          )
        })}
      </nav>

    </aside>
  )
}
