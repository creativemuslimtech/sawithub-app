import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, BasketIcon, ChartIcon, UserIcon, PlusIcon } from './ds/icons'

const TABS = [
  { label: 'Ringkasan', icon: HomeIcon, to: '/dashboard' },
  { label: 'Panen',     icon: BasketIcon, to: '/panen' },
  null, // center FAB
  { label: 'Laporan',  icon: ChartIcon, to: '/laporan-keuangan' },
  { label: 'Profil',   icon: UserIcon,  to: '/profile' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--line-2)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '8px 12px 12px' }}>
        {TABS.map((tab, _i) => {
          if (!tab) {
            return (
              <Link
                key="fab"
                to="/panen/add"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  border: 0, background: 'transparent', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: 'var(--forest)', color: 'var(--paper)',
                  display: 'grid', placeItems: 'center',
                  marginTop: -6,
                  boxShadow: '0 4px 12px -2px rgba(26,61,43,0.45)',
                }}>
                  <PlusIcon size={22} />
                </div>
              </Link>
            )
          }
          const active = tab.to === '/dashboard'
            ? pathname === tab.to
            : pathname.startsWith(tab.to)
          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: active ? 'var(--forest)' : 'var(--ink-4)',
                padding: '8px 0',
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
