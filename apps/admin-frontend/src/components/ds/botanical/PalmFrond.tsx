import type { CSSProperties } from 'react'

interface Props { size?: number; color?: string; opacity?: number; style?: CSSProperties }

export default function PalmFrond({ size = 120, color = 'currentColor', opacity = 0.12, style }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M60 110 C 58 80, 56 50, 60 12" />
        <path d="M60 95 C 48 92, 38 86, 30 76" />
        <path d="M60 95 C 72 92, 82 86, 90 76" />
        <path d="M60 80 C 46 76, 34 68, 26 56" />
        <path d="M60 80 C 74 76, 86 68, 94 56" />
        <path d="M60 64 C 48 60, 38 50, 32 38" />
        <path d="M60 64 C 72 60, 82 50, 88 38" />
        <path d="M60 48 C 52 42, 46 32, 44 22" />
        <path d="M60 48 C 68 42, 74 32, 76 22" />
        <path d="M60 32 C 56 26, 54 18, 56 10" />
        <path d="M60 32 C 64 26, 66 18, 64 10" />
      </g>
      <circle cx="60" cy="14" r="2.4" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
