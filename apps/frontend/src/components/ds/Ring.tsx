interface RingProps {
  pct: number
  size?: number
  color?: string
  track?: string
  strokeWidth?: number
  label?: string
}

export default function Ring({
  pct,
  size = 56,
  color = 'var(--forest)',
  track = 'var(--line-soft)',
  strokeWidth = 6,
  label,
}: RingProps) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const dash = c * (pct / 100)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--f-mono)', fontWeight: 500, fontSize: size * 0.22, color: 'var(--ink)',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
