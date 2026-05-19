import type { CSSProperties } from 'react'

interface Props { size?: number; color?: string; opacity?: number; style?: CSSProperties }

export default function SunRays({ size = 80, color = 'currentColor', opacity = 0.2, style }: Props) {
  const rays = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2
    const r1 = 16, r2 = 26 + (i % 2 ? 4 : 0)
    return {
      x1: 40 + Math.cos(a) * r1, y1: 40 + Math.sin(a) * r1,
      x2: 40 + Math.cos(a) * r2, y2: 40 + Math.sin(a) * r2,
    }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none"
      style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <circle cx="40" cy="40" r="10" />
        {rays.map((r, i) => <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />)}
      </g>
    </svg>
  )
}
