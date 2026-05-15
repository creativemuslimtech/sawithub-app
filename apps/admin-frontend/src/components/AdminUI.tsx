import type { ReactNode } from 'react'

type Tone = {
  color: string
  bg: string
  border: string
}

function deltaTone(value?: number): Tone {
  if (value === undefined) return { color: 'rgba(226,232,240,0.68)', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.2)' }
  if (value > 0) return { color: '#86efac', bg: 'rgba(34,197,94,0.13)', border: 'rgba(34,197,94,0.24)' }
  if (value < 0) return { color: '#fda4af', bg: 'rgba(244,63,94,0.13)', border: 'rgba(244,63,94,0.24)' }
  return { color: '#cbd5e1', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.2)' }
}

function formatTrend(value?: number) {
  if (value === undefined) return null
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

export function AdminPageHero({
  eyebrow,
  title,
  description,
  accent = '#22c55e',
  children,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  accent?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[32px] p-5 md:p-7"
      style={{
        background: `linear-gradient(135deg, ${accent}18 0%, rgba(8,14,16,0.94) 46%, rgba(18,14,10,0.9) 100%)`,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 28px 90px rgba(0,0,0,0.26)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 100%), linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 100%)',
          backgroundSize: '28px 28px',
          opacity: 0.16,
        }}
      />
      <div className="relative grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5 md:gap-7 items-start">
        <div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase mb-4"
            style={{
              color: '#d1fae5',
              background: `${accent}22`,
              border: `1px solid ${accent}36`,
              letterSpacing: '0.18em',
            }}
          >
            {eyebrow}
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight max-w-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base leading-7" style={{ color: 'rgba(226,232,240,0.72)' }}>
            {description}
          </p>
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children && (
          <div
            className="rounded-[28px] p-4 md:p-5"
            style={{
              background: 'rgba(5, 10, 12, 0.62)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  )
}

export function AdminMetricCard({
  label,
  value,
  hint,
  accent,
  icon,
  trend,
}: {
  label: string
  value: ReactNode
  hint?: string
  accent: string
  icon?: ReactNode
  trend?: number
}) {
  const tone = deltaTone(trend)
  const trendLabel = formatTrend(trend)

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-4 md:p-5"
      style={{
        background: `linear-gradient(150deg, ${accent}17 0%, rgba(8,12,18,0.9) 72%)`,
        border: `1px solid ${accent}30`,
        boxShadow: `0 18px 42px ${accent}10`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase mb-2" style={{ color: `${accent}dd`, letterSpacing: '0.16em' }}>
            {label}
          </p>
          <p className="text-lg font-semibold leading-tight text-white break-words md:text-xl xl:text-[1.45rem]">{value}</p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{ color: accent, background: `${accent}16`, border: `1px solid ${accent}25` }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        {hint && <p className="text-xs leading-relaxed" style={{ color: 'rgba(226,232,240,0.54)' }}>{hint}</p>}
        {trendLabel && (
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{ color: tone.color, background: tone.bg, borderColor: tone.border }}
          >
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export function AdminPanel({
  title,
  eyebrow,
  description,
  action,
  children,
  className = '',
}: {
  title?: string
  eyebrow?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-[28px] p-4 md:p-5 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {(title || eyebrow || description || action) && (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            {eyebrow && (
              <p className="text-[11px] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em' }}>
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-relaxed text-white/45">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function AdminSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-white/30 uppercase mb-3" style={{ letterSpacing: '0.18em' }}>
      {children}
    </p>
  )
}

export function AdminBadge({
  children,
  accent = '#94a3b8',
}: {
  children: ReactNode
  accent?: string
}) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}28` }}
    >
      {children}
    </span>
  )
}

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
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
    </div>
  )
}

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
      className="mt-5 flex flex-col gap-3 rounded-[22px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-sm text-white/40">
        {totalLabel ?? (totalPages ? `Halaman ${page} dari ${totalPages}` : `Halaman ${page}`)}
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button
          disabled={page === 1}
          onClick={onPrev}
          className="rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Sebelumnya
        </button>
        <button
          disabled={nextDisabled}
          onClick={onNext}
          className="rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-30"
          style={{ background: 'rgba(34,197,94,0.14)', color: '#86efac', border: '1px solid rgba(34,197,94,0.26)' }}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}

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
    <div className="rounded-[28px] py-12 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mb-3 text-3xl">{icon}</div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">{description}</p>}
    </div>
  )
}

export function AdminInsightList({
  items,
  accent = '#22c55e',
}: {
  items: string[]
  accent?: string
}) {
  return (
    <div>
      <p className="text-[11px] uppercase mb-3 text-white/35" style={{ letterSpacing: '0.16em' }}>Insight Singkat</p>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="rounded-[20px] p-3.5"
            style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ color: '#f8fafc', background: `${accent}${index % 2 === 0 ? '35' : '24'}` }}
              >
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-white/70">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminSkeleton({ rows = 4, height = 'h-20' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`${height} rounded-[22px] animate-pulse`} style={{ background: 'rgba(255,255,255,0.04)' }} />
      ))}
    </div>
  )
}
