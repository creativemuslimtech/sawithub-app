import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import MobileMoreNav from './MobileMoreNav'
import AppTopNav from './AppTopNav'

type AppLayoutProps = {
  /** @deprecated topbar prop ignored */
  topbar?: ReactNode
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)', position: 'relative' }}>
      <div className="sh-grain" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile topnav (hidden on md+) */}
      <AppTopNav />
      <MobileMoreNav />

      {/* Content */}
      <div className="app-content">
        <main className="flex min-h-screen flex-col">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
