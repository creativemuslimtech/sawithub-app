import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminBottomNav from './AdminBottomNav'
import ShellUserMenu from './ShellUserMenu'
import Logo from './Logo'

const PAGE_LABELS: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/users': 'Pengguna',
  '/admin/revenue': 'Revenue',
  '/admin/apps': 'Apps',
  '/admin/data': 'Data',
  '/admin/analytics': 'Analytics',
  '/admin/monitoring': 'Monitor',
  '/admin/settings': 'Pengaturan',
  '/admin/audit': 'Audit',
}

interface AdminLayoutProps {
  children: ReactNode
  topbarRight?: ReactNode
  maxWidth?: string
}

export default function AdminLayout({ children, topbarRight, maxWidth = 'max-w-[1480px]' }: AdminLayoutProps) {
  const { pathname } = useLocation()
  const pageLabel = PAGE_LABELS[
    Object.keys(PAGE_LABELS)
      .filter(p => pathname === p || pathname.startsWith(p + '/'))
      .sort((a, b) => b.length - a.length)[0]
  ] ?? 'Admin'

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--cream)' }}
    >
      <AdminSidebar />

      <div className="admin-page-content flex flex-col" style={{ minHeight: '100vh' }}>

        {/* Top Bar */}
        <header
          className="sticky top-0 z-20 border-b"
          style={{
            background: 'rgba(245, 240, 232, 0.7)',
            borderColor: 'var(--line-2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex w-full items-center gap-4 px-4 md:px-8 h-14">
            {/* Logo + page title shown only on mobile — sidebar is hidden there */}
            <Link to="/admin" className="md:hidden shrink-0">
              <Logo size="sm" />
            </Link>
            <span className="md:hidden text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
              {pageLabel}
            </span>
            {/* Breadcrumb on desktop */}
            <div className="hidden md:flex items-center gap-2" style={{ fontSize: 12.5 }}>
              <span style={{ color: 'var(--ink-4)' }}>Admin</span>
              <span style={{ color: 'var(--ink-4)' }}>/</span>
              <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{pageLabel}</span>
            </div>
            <div className="min-w-0 flex-1" aria-hidden />
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <ShellUserMenu accentColor="var(--amber)" />
            </div>
            {topbarRight && (
              <div className="flex shrink-0 items-center gap-3 text-sm">
                {topbarRight}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-4 md:px-6 min-[1100px]:px-8 py-5 md:py-7 pb-24 md:pb-8">
          <div className={`mx-auto ${maxWidth}`}>
            {children}
          </div>
        </main>

      </div>

      <AdminBottomNav />
    </div>
  )
}
