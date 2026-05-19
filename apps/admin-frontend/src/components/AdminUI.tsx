import type { ReactNode } from 'react'

/* ── Sparkline ── */
export function MiniSparkline({
  data,
  width = 56,
  height = 20,
  color = 'var(--forest)',
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const pts = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 2) - 1}`)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden>
      <polyline
        points={pts.join(' ')}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/* ── AdminPageHero — editorial light header ── */
export function AdminPageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accent: _accent,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  actions?: ReactNode
  children?: ReactNode
  accent?: string
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— {eyebrow}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="sh-h-2" style={{ color: 'var(--ink)', maxWidth: 780 }}>{title}</h1>
          {description && (
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, maxWidth: 680 }}>{description}</p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
      </div>
      {children}
    </div>
  )
}

/* ── AdminMetricCard — paper card with colored top border ── */
export function AdminMetricCard({
  label,
  value,
  hint,
  color,
  accent,
  trend,
  sparkData,
  live,
  icon: _icon,
}: {
  label: string
  value: ReactNode
  hint?: string
  color?: string
  accent?: string
  trend?: number | string
  sparkData?: number[]
  live?: boolean
  icon?: ReactNode
}) {
  const resolvedColor = color ?? accent ?? 'var(--forest)'
  const trendStr = typeof trend === 'number'
    ? (trend > 0 ? `+${trend.toFixed(1)}%` : trend < 0 ? `${trend.toFixed(1)}%` : '0%')
    : trend
  const trendPositive = trendStr?.startsWith('+') || trendStr?.startsWith('↑')

  return (
    <div
      className="sh-card"
      style={{
        position: 'relative',
        padding: 14,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: resolvedColor }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600, fontFamily: 'var(--f-mono)' }}>
          {label}
        </span>
        {live && (
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--terracotta)', boxShadow: '0 0 6px var(--terracotta)', flexShrink: 0 }} />
        )}
      </div>
      <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{value}</div>
      <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
        {trendStr ? (
          <span style={{
            fontSize: 11,
            color: trendPositive ? 'var(--forest)' : 'var(--terracotta-2)',
            fontFamily: 'var(--f-mono)',
            fontWeight: 500,
          }}>
            {trendStr}
          </span>
        ) : hint ? (
          <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{hint}</span>
        ) : <span />}
        {sparkData && <MiniSparkline data={sparkData} color={color} />}
      </div>
    </div>
  )
}

/* ── AdminPanel — light card panel ── */
export function AdminPanel({
  title,
  eyebrow,
  description,
  action,
  children,
  className = '',
  style,
}: {
  title?: string
  eyebrow?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <section
      className={`sh-card ${className}`}
      style={{ padding: 24, borderRadius: 14, ...style }}
    >
      {(title || eyebrow || description || action) && (
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              {eyebrow && (
                <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— {eyebrow}</div>
              )}
              {title && <h2 className="sh-h-4" style={{ color: 'var(--ink)' }}>{title}</h2>}
              {description && <p style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55 }}>{description}</p>}
            </div>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
          </div>
        </div>
      )}
      {children}
    </section>
  )
}

/* ── AdminSectionLabel — uses sh-eyebrow pattern ── */
export function AdminSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="sh-eyebrow" style={{ marginBottom: 12 }}>—— {children}</p>
  )
}

/* ── AdminBadge — sh-chip based ── */
export function AdminBadge({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'forest' | 'amber' | 'terra'
}) {
  const cls = tone === 'forest' ? 'sh-chip sh-chip-forest'
    : tone === 'amber' ? 'sh-chip sh-chip-amber'
    : tone === 'terra' ? 'sh-chip sh-chip-terra'
    : 'sh-chip'
  return <span className={cls}>{children}</span>
}

/* ── AdminSearchField — light sh-input style ── */
export function AdminSearchField({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--ink-4)"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="sh-input"
        style={{ paddingLeft: 38 }}
      />
    </div>
  )
}

/* ── AdminPagination — light style ── */
export function AdminPagination({
  page,
  totalPages,
  totalLabel,
  onPrev,
  onNext,
  disableNext,
}: {
  page: number
  totalPages?: number
  totalLabel?: string
  onPrev: () => void
  onNext: () => void
  disableNext?: boolean
}) {
  const nextDisabled = disableNext ?? (totalPages !== undefined && page >= totalPages)

  return (
    <div
      className="sh-card"
      style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 12, padding: '10px 16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>
          {totalLabel ?? (totalPages ? `Halaman ${page} dari ${totalPages}` : `Halaman ${page}`)}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            disabled={page === 1}
            onClick={onPrev}
            className="sh-btn sh-btn-ghost sh-btn-sm"
            style={{ borderRadius: 10 }}
          >
            Sebelumnya
          </button>
          <button
            disabled={nextDisabled}
            onClick={onNext}
            className="sh-btn sh-btn-primary sh-btn-sm"
            style={{ borderRadius: 10 }}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── AdminEmptyState — light card ── */
export function AdminEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description?: string
}) {
  return (
    <div
      className="sh-card"
      style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 16 }}
    >
      <div style={{ marginBottom: 12, fontSize: 32, color: 'var(--ink-4)' }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{title}</p>
      {description && (
        <p style={{ margin: '8px auto 0', maxWidth: 380, fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-4)' }}>
          {description}
        </p>
      )}
    </div>
  )
}

/* ── AdminInsightList — light cards ── */
export function AdminInsightList({
  items,
}: {
  items: string[]
  color?: string
}) {
  return (
    <div>
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Insight Singkat</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="sh-card"
            style={{ padding: 14, borderRadius: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span
                style={{
                  marginTop: 1,
                  width: 24, height: 24,
                  borderRadius: 99,
                  background: index % 2 === 0 ? 'var(--forest-soft)' : 'var(--amber-soft)',
                  color: index % 2 === 0 ? 'var(--forest)' : 'var(--amber-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, flexShrink: 0,
                  fontFamily: 'var(--f-mono)',
                }}
              >
                {index + 1}
              </span>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── AdminSkeleton — shimmer on light background ── */
export function AdminSkeleton({ rows = 4, height = 'h-20' }: { rows?: number; height?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`skeleton ${height}`} style={{ borderRadius: 12 }} />
      ))}
    </div>
  )
}

/* ── AdminProgressBar ── */
export function AdminProgressBar({
  pct,
  color = 'var(--forest)',
  height = 5,
}: {
  pct: number
  color?: string
  height?: number
}) {
  return (
    <div style={{ height, borderRadius: 999, background: 'var(--line-soft)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', borderRadius: 999, background: color, width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

/* ── StatusDot ── */
export function StatusDot({ severity }: { severity: 'critical' | 'warn' | 'info' | 'ok' }) {
  const color = severity === 'critical' ? 'var(--terracotta)'
    : severity === 'warn' ? 'var(--amber-2)'
    : severity === 'ok' ? 'var(--forest-3)'
    : 'var(--c-sky)'
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 99, background: color,
      flexShrink: 0, display: 'inline-block', marginTop: 3,
    }} />
  )
}
