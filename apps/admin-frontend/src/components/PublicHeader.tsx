import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

type PublicHeaderProps = {
  className?: string
  bordered?: boolean
  rightSlot?: ReactNode
}

export default function PublicHeader({ className = '', bordered = false, rightSlot }: PublicHeaderProps) {
  const borderClass = bordered ? ' border-b border-white/10' : ''

  return (
    <header className={`relative z-10 px-4 py-4 sm:px-8 lg:px-10${borderClass} ${className}`.trim()}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/"
          className="rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08110d]"
          aria-label="Kembali ke halaman utama SawitHub"
        >
          <Logo size="md" />
        </Link>
        {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
      </div>
    </header>
  )
}
