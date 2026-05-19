import type { CSSProperties } from 'react'

interface Props { width?: number; height?: number; color?: string; opacity?: number; style?: CSSProperties }

export default function SoilWaves({ width = 240, height = 60, color = 'currentColor', opacity = 0.18, style }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 240 60" fill="none"
      style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none">
        <path d="M0 14 C 40 6, 80 22, 120 14 S 200 6, 240 14" />
        <path d="M0 28 C 40 20, 80 36, 120 28 S 200 20, 240 28" />
        <path d="M0 42 C 40 34, 80 50, 120 42 S 200 34, 240 42" />
        <path d="M0 56 C 40 48, 80 64, 120 56 S 200 48, 240 56" />
      </g>
    </svg>
  )
}
