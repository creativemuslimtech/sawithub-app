import type { CSSProperties, ReactNode } from 'react'

interface ChipProps {
  tone?: 'neutral' | 'forest' | 'amber' | 'terra'
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function Chip({ tone = 'neutral', children, style, className = '' }: ChipProps) {
  const cls =
    tone === 'forest' ? 'sh-chip sh-chip-forest'
    : tone === 'amber' ? 'sh-chip sh-chip-amber'
    : tone === 'terra' ? 'sh-chip sh-chip-terra'
    : 'sh-chip'
  return <span className={`${cls} ${className}`} style={style}>{children}</span>
}
