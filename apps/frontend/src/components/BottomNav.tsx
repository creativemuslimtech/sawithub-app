import { Link, useLocation } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from './appNavigation'

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(250,246,236,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex">
        {BOTTOM_NAV_ITEMS.map(({ icon: Icon, shortLabel, to }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors"
              style={{
                color: active ? 'var(--emerald)' : 'var(--ink-4)',
              }}
            >
              {active && (
                <span
                  className="absolute inset-x-4 top-0 h-0.5 rounded-full"
                  style={{ background: 'var(--emerald)' }}
                />
              )}
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                style={{ background: active ? 'var(--emerald-soft)' : 'transparent' }}
              >
                <Icon color="currentColor" size={20} />
              </span>
              <span className="text-[10px] font-semibold leading-tight">{shortLabel}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
