import { Link, useLocation } from 'react-router-dom'
import { shellSidebarBrandClass } from '../constants/appShellChrome'
import Logo from './Logo'
import { APP_NAV_ITEMS } from './appNavigation'

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <div
      className="app-sidebar hidden md:flex fixed inset-y-0 left-0 z-30 flex-col overflow-hidden"
      style={{
        width: 'var(--shell-sidebar-width)',
        background: 'linear-gradient(180deg, rgba(5,8,12,0.98) 0%, rgba(10,6,20,0.98) 52%, rgba(7,16,12,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(18px)',
        boxShadow: '24px 0 60px rgba(0,0,0,0.24)',
      }}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-white/7 px-3 min-[1100px]:px-4">
        <Link
          to="/dashboard"
          className={shellSidebarBrandClass}
        >
          <Logo size="sm" className="justify-center min-[1100px]:justify-start" />
        </Link>
      </div>

      <div className="hidden px-4 pt-4 min-[1100px]:block">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.28)' }}>Navigasi</p>
      </div>

      <nav className="mt-3 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {APP_NAV_ITEMS.map((item) => (
          (() => {
            const active = pathname === item.to || (item.to !== '/dashboard' && pathname.startsWith(item.to))
            const Icon = item.icon
            return (
          <Link
            key={item.to}
            to={item.to}
            className="w-full rounded-2xl transition font-medium block"
            title={item.label}
            style={{
              background: active ? `linear-gradient(145deg, ${item.accent}24, rgba(255,255,255,0.03))` : `${item.accent}10`,
              border: active ? `1px solid ${item.accent}50` : `1px solid ${item.accent}22`,
              color: active ? item.accent : item.color,
              boxShadow: active ? `0 12px 30px ${item.accent}18` : 'none',
            }}
            onMouseOver={(e) => {
              if (!active) e.currentTarget.style.background = `${item.accent}18`
            }}
            onMouseOut={(e) => {
              if (!active) e.currentTarget.style.background = `${item.accent}10`
            }}>
            <div className="flex items-center justify-center gap-3 px-3 py-3 min-[1100px]:justify-start">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: active ? `${item.accent}16` : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? `${item.accent}25` : 'rgba(255,255,255,0.05)'}` }}
              >
                <Icon color="currentColor" size={20} />
              </div>
              <div className="hidden min-w-0 flex-1 min-[1100px]:block">
                <div className="text-sm font-semibold truncate">{item.label}</div>
                <div className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.32)' }}>
                  {item.note}
                </div>
              </div>
              <span className="text-sm font-semibold min-[1100px]:hidden">{item.shortLabel.charAt(0)}</span>
            </div>
          </Link>
            )
          })()
        ))}
      </nav>
    </div>
  )
}
