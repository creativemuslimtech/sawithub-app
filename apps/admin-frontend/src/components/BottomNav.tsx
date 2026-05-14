import { Link, useLocation } from 'react-router-dom'
import { APP_NAV_ITEMS } from './appNavigation'

export default function BottomNav() {
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
          background: 'rgba(6,10,16,0.88)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -16px 50px rgba(0,0,0,0.28)',
        }}
      >
        {APP_NAV_ITEMS.map(({ icon: Icon, shortLabel, to, accent }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className="relative flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-all"
              style={{
                color: active ? accent : 'rgba(255,255,255,0.38)',
                background: active ? `${accent}14` : 'transparent',
              }}
            >
              {active && (
                <span
                  className="absolute inset-x-3 top-1 h-0.5 rounded-full"
                  style={{ background: accent }}
                />
              )}
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: active ? `${accent}16` : 'rgba(255,255,255,0.03)' }}
              >
                <Icon color="currentColor" size={20} />
              </span>
              <span className="text-[9px] font-semibold leading-tight">{shortLabel}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
