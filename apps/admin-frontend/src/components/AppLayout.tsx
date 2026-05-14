import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

type AppLayoutProps = {
  topbar?: ReactNode
  children: ReactNode
}

export default function AppLayout({ topbar, children }: AppLayoutProps) {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'linear-gradient(145deg, #080412 0%, #0c1a0c 60%, #080c08 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <Sidebar />
      <BottomNav />

      <div className="app-content flex min-h-screen min-w-0 flex-col">
        {topbar}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
