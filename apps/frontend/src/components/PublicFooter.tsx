import { Link } from 'react-router-dom'
import { PUBLIC_FOOTER_LINKS } from '../constants/publicFooterLinks'
import Logo from './Logo'

type PublicFooterProps = {
  className?: string
}

export default function PublicFooter({ className = '' }: PublicFooterProps) {
  return (
    <footer
      className={className}
      style={{ borderTop: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink-3)' }}
    >
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-8 lg:px-10">
        {/* Top row: brand + description */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo size="sm" />
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--ink-3)' }}>
              Aplikasi catatan kebun &amp; keuangan untuk petani sawit Indonesia. Ringkas, jelas, dipakai dari HP.
            </p>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="flex flex-col items-center gap-3 border-t pt-6 sm:flex-row sm:justify-between"
          style={{ borderColor: 'var(--line)' }}
        >
          <span className="text-sm" style={{ color: 'var(--ink-4)' }}>
            © 2026 SawitHub / Untuk petani sawit mandiri Indonesia
          </span>
          <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Tautan halaman publik">
            {PUBLIC_FOOTER_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2"
                style={{
                  color: 'var(--ink-3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-3)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
