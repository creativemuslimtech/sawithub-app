import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import { SectionHeader } from './design-system'

type PublicPageLayoutProps = {
  eyebrow?: string
  title: string
  description: string
  children: ReactNode
  maxWidth?: string
}

export default function PublicPageLayout({
  eyebrow,
  title,
  description,
  children,
  maxWidth = 'max-w-5xl'
}: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <PublicHeader
        bordered
        rightSlot={(
          <div className="flex items-center gap-2">
            <Link
              to="/bantuan"
              className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-3 transition hover:bg-paper-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest sm:inline-flex"
            >
              Bantuan
            </Link>
            <Link
              to="/signup"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-forest-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Coba Gratis 14 Hari
            </Link>
          </div>
        )}
      />
      <main className="px-4 py-12 sm:px-8 lg:px-10">
        <div className={`mx-auto ${maxWidth}`}>
          <header className="marketing-panel mb-8 border border-line bg-surface shadow-card-sm">
            <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          </header>
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
