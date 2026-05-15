import { Link, useLocation } from 'react-router-dom'

const BRAND = '#22c55e'

const NAV = [
  {
    label: 'Overview', to: '/admin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Pengguna', to: '/admin/users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Data', to: '/admin/data',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
  {
    label: 'Analytics', to: '/admin/analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    label: 'Audit', to: '/admin/audit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
      </svg>
    ),
  },
]

export default function AdminBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2"
      style={{
        background: 'linear-gradient(180deg, rgba(8,4,18,0) 0%, rgba(8,4,18,0.82) 18%, rgba(8,4,18,0.98) 100%)',
        backdropFilter: 'blur(18px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="flex rounded-[24px] overflow-hidden"
        style={{
          background: 'rgba(6,10,16,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -16px 50px rgba(0,0,0,0.32)',
        }}
      >
        {NAV.map(({ label, to, icon }) => {
          const active = to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className="relative flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-all"
              style={{
                color: active ? BRAND : 'rgba(255,255,255,0.35)',
                background: active ? `${BRAND}12` : 'transparent',
              }}
            >
              {active && (
                <span
                  className="absolute inset-x-3 top-1 h-0.5 rounded-full"
                  style={{ background: BRAND }}
                />
              )}
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: active ? `${BRAND}16` : 'rgba(255,255,255,0.03)' }}
              >
                {icon}
              </span>
              <span className="text-[10px] font-semibold leading-tight">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
