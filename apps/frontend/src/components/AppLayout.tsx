import type { ReactNode } from 'react'
import AppTopNav from './AppTopNav'
import BottomNav from './BottomNav'
import MobileMoreNav from './MobileMoreNav'

type AppLayoutProps = {
  /** @deprecated topbar prop ignored — AppTopNav is always rendered */
  topbar?: ReactNode
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-paper font-sans">
      <AppTopNav />
      <MobileMoreNav />
      <BottomNav />

      <div className="app-content">
        <main className="flex min-h-[calc(100vh-var(--shell-topnav-height))] flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
