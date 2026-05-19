import type { CSSProperties } from 'react'

interface Props { size?: number; color?: string; opacity?: number; style?: CSSProperties }

export default function PalmLeaf({ size = 100, color = 'currentColor', opacity = 0.18, style }: Props) {
  const veins = [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const t = i / 7
    const x = 10 + (92 - 10) * t
    const y = 90 - (90 - 10) * t
    const dx = Math.cos((1 - t) * 2.2) * 14
    const dy = Math.sin((1 - t) * 2.2) * 14
    return `M${x} ${y} q ${(dx * 0.6).toFixed(1)} ${(-dy * 0.4).toFixed(1)}, ${dx.toFixed(1)} ${(-dy).toFixed(1)}`
  })
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path d="M10 90 C 30 60, 60 30, 92 10" />
        {veins.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  )
}
