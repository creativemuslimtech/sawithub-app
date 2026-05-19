import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children?: ReactNode
  padded?: boolean
  elev?: 1 | 2 | 3
  style?: CSSProperties
  className?: string
  onClick?: () => void
}

export default function Card({ children, padded = true, elev = 1, style, className = '', onClick }: CardProps) {
  const shadow =
    elev === 3 ? 'var(--sh-card-3)'
    : elev === 2 ? 'var(--sh-card-2)'
    : 'var(--sh-card)'
  return (
    <div
      className={`sh-card ${className}`}
      onClick={onClick}
      style={{ padding: padded ? 22 : 0, boxShadow: shadow, ...style }}
    >
      {children}
    </div>
  )
}
