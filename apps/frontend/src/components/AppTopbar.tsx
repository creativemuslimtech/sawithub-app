import type { ReactNode } from 'react'

/** Non-admin topbar: actions only (no SawitHub / logo — brand lives in sidebar). */
type AppTopbarProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function AppTopbar({ title, subtitle, actions }: AppTopbarProps) {
  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-white/7 bg-[rgba(8,4,18,0.85)] backdrop-blur-xl"
    >
      <div className="app-shell-gutter flex h-full w-full items-center">
        <div className="app-shell-container flex h-full w-full min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white/90 leading-tight">{title}</p>
            {subtitle ? (
              <p className="truncate text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.42)' }}>{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex min-w-0 shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
