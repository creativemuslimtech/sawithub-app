import type { CSSProperties } from 'react'

interface Props { size?: number; color?: string; opacity?: number; style?: CSSProperties }

export default function SeedSprout({ size = 60, color = 'currentColor', opacity = 0.6, style }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none"
      style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none">
        <path d="M30 52 L30 24" />
        <path d="M30 36 C 22 36, 16 30, 16 22 C 24 22, 30 28, 30 36 Z" />
        <path d="M30 30 C 38 30, 44 24, 44 16 C 36 16, 30 22, 30 30 Z" />
        <path d="M22 52 L38 52" />
      </g>
    </svg>
  )
}
