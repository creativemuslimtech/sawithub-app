import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { shellSidebarBrandClass } from '../constants/appShellChrome'
import Logo from './Logo'
import { APP_NAV_ITEMS, KEUANGAN_NAV_LINKS } from './appNavigation'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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

export default function Sidebar() {
  const { pathname } = useLocation()
  const [financeOpen, setFinanceOpen] = useState(true)

  const financeHasActive = KEUANGAN_NAV_LINKS.some(
    (item) => pathname === item.to || (item.to !== '/keuangan' && pathname.startsWith(item.to)),
  )

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
          <Logo size="sm" showText={false} className="justify-center min-[1100px]:hidden" />
          <Logo size="sm" className="hidden min-[1100px]:flex min-[1100px]:justify-start" />
        </Link>
      </div>

      <div className="hidden px-4 pt-4 min-[1100px]:block">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.28)' }}>Navigasi</p>
      </div>

      <nav className="mt-3 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {APP_NAV_ITEMS.map((item) => {
          const active = pathname === item.to || (item.to !== '/dashboard' && pathname.startsWith(item.to))
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className="w-full rounded-xl transition font-medium block"
              title={item.label}
              style={{
                background: active ? `rgba(34,197,94,0.12)` : 'transparent',
                border: active ? '1px solid rgba(34,197,94,0.28)' : '1px solid transparent',
                color: active ? '#4ade80' : 'rgba(255,255,255,0.60)',
              }}
              onMouseOver={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.88)'
                }
              }}
              onMouseOut={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.60)'
                }
              }}
            >
              <div className="flex items-center justify-center gap-3 px-3 py-2.5 min-[1100px]:justify-start">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ color: active ? '#4ade80' : 'rgba(255,255,255,0.55)' }}
                >
                  <Icon color="currentColor" size={18} />
                </div>
                <div className="hidden min-w-0 flex-1 min-[1100px]:block">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                </div>
                <span className="text-[10px] font-medium min-[1100px]:hidden leading-tight text-center max-w-[52px] truncate">{item.shortLabel}</span>
              </div>
            </Link>
          )
        })}

        <div className="pt-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              color: financeHasActive ? 'rgba(52,211,153,0.95)' : 'rgba(255,255,255,0.35)',
              border: financeHasActive ? '1px solid rgba(52,211,153,0.28)' : '1px solid rgba(255,255,255,0.06)',
              background: financeHasActive ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
            }}
            aria-expanded={financeOpen}
            onClick={() => setFinanceOpen((v) => !v)}
          >
            Keuangan
            <Chevron open={financeOpen} />
          </button>

          {financeOpen ? (
            <div className="mt-2 space-y-1.5 pl-1">
              {KEUANGAN_NAV_LINKS.map((item) => {
                const active = pathname === item.to || (item.to !== '/keuangan' && pathname.startsWith(item.to))
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium transition"
                    style={{
                      background: active ? `${item.accent}18` : 'transparent',
                      border: active ? `1px solid ${item.accent}40` : '1px solid transparent',
                      color: active ? item.accent : 'rgba(226,232,240,0.72)',
                    }}
                  >
                    <span className="block truncate">{item.label}</span>
                    <span className="block truncate text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {item.note}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>
      </nav>
    </div>
  )
}
