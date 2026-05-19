import type { ReactNode } from 'react'

interface StatProps {
  label: string
  value: string | ReactNode
  sub?: string
  delta?: string
  accent?: string
  icon?: ReactNode
}

export default function Stat({ label, value, sub, delta, accent = 'var(--forest)', icon }: StatProps) {
  const positive = delta ? !String(delta).startsWith('-') : false
  return (
    <div className="sh-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: accent, opacity: 0.6 }} />
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
          <div className="sh-num" style={{ fontSize: 30, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>
            {value}
          </div>
          {sub && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${accent}14`, color: accent,
            display: 'grid', placeItems: 'center',
            border: `1px solid ${accent}22`,
          }}>
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="sh-chip" style={{
            background: positive ? 'var(--forest-soft)' : 'var(--terra-soft)',
            color: positive ? 'var(--forest)' : 'var(--terracotta-2)',
            borderColor: 'transparent',
          }}>
            {positive ? '↑' : '↓'} {String(delta).replace('-', '')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>vs. periode lalu</span>
        </div>
      )}
    </div>
  )
}
