import type { ReactNode } from 'react'

/** Non-admin topbar: actions only (no SawitHub / logo — brand lives in sidebar). */
type AppTopbarProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function AppTopbar({ title, subtitle, actions }: AppTopbarProps) {
  void title
  void subtitle

  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-white/7 bg-[rgba(8,4,18,0.85)] backdrop-blur-xl"
    >
      <div className="app-shell-gutter flex h-full w-full items-center">
        <div className="app-shell-container flex h-full w-full min-w-0 items-center justify-end gap-3">
          {actions ? (
            <div className="flex min-w-0 shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
