import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/* ── Card ────────────────────────────────────────────────────────── */

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'article' | 'section' | 'div' | 'aside'
  elevated?: boolean
}

export function Card({ children, as: Component = 'div', elevated = false, className = '', ...props }: CardProps) {
  return (
    <Component
      className={`bg-surface border border-line rounded-lg-1 ${elevated ? 'shadow-card-lg' : 'shadow-card-sm'} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}

/* ── KPI Card ────────────────────────────────────────────────────── */

type KPICardProps = {
  label: string
  value: ReactNode
  sub?: ReactNode
  delta?: { value: string; positive: boolean }
  accentColor?: string
  sparkline?: ReactNode
  className?: string
}

export function KPICard({ label, value, sub, delta, accentColor = 'var(--emerald)', sparkline, className = '' }: KPICardProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-lg-1 shadow-card-sm overflow-hidden flex flex-col ${className}`}
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="eyebrow">{label}</p>
          {delta && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-600 shrink-0"
              style={{
                background: delta.positive ? 'var(--emerald-soft)' : 'var(--terra-soft)',
                color: delta.positive ? 'var(--emerald-2)' : 'var(--terra-2)',
              }}
            >
              {delta.positive ? '↑' : '↓'} {delta.value}
            </span>
          )}
        </div>
        <p className="num mt-2 text-3xl font-bold text-ink">{value}</p>
        {sub && <p className="mt-1 text-xs text-ink-4">{sub}</p>}
      </div>
      {sparkline && <div className="h-14 w-full overflow-hidden">{sparkline}</div>}
    </div>
  )
}

/* ── Chip ────────────────────────────────────────────────────────── */

type ChipVariant = 'default' | 'emerald' | 'terra' | 'warn' | 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5' | 'cat6'

const chipStyles: Record<ChipVariant, string> = {
  default:  'bg-surface border-line text-ink-3',
  emerald:  'bg-emerald-soft border-transparent text-emerald-2',
  terra:    'bg-terra-soft border-transparent text-terra-2',
  warn:     'bg-[#fff7e0] border-transparent text-[#92600a]',
  cat1:     'bg-cat-1 border-transparent text-white',
  cat2:     'bg-cat-2 border-transparent text-white',
  cat3:     'bg-cat-3 border-transparent text-white',
  cat4:     'bg-cat-4 border-transparent text-white',
  cat5:     'bg-cat-5 border-transparent text-white',
  cat6:     'bg-cat-6 border-transparent text-white',
}

export function Chip({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: ChipVariant; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${chipStyles[variant]} ${className}`.trim()}>
      {children}
    </span>
  )
}

/* ── StatPill ────────────────────────────────────────────────────── */

export function StatPill({ label, value, accentColor, className = '' }: { label: string; value: ReactNode; accentColor?: string; className?: string }) {
  return (
    <div
      className={`bg-surface border border-line rounded-lg-1 shadow-card-sm p-4 flex flex-col gap-1 ${className}`}
      style={accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined}
    >
      <p className="eyebrow">{label}</p>
      <p className="num text-xl font-bold text-ink">{value}</p>
    </div>
  )
}

/* ── Button ──────────────────────────────────────────────────────── */

type BtnVariant = 'primary' | 'emerald' | 'ghost' | 'terra'
type BtnSize    = 'sm' | 'md' | 'lg'

const btnBase = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-55 disabled:cursor-not-allowed active:scale-[0.98]'

const btnVariantStyles: Record<BtnVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-emerald-2 focus-visible:outline-ink',
  emerald: 'bg-emerald text-white hover:bg-emerald-2 focus-visible:outline-emerald',
  ghost:   'bg-transparent border border-line text-ink hover:bg-paper-2 focus-visible:outline-ink',
  terra:   'bg-terra text-white hover:bg-terra-2 focus-visible:outline-terra',
}

const btnSizeStyles: Record<BtnSize, string> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5.5 py-3.5 text-sm',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant
  size?: BtnSize
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`${btnBase} ${btnVariantStyles[variant]} ${btnSizeStyles[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── SectionHeader ───────────────────────────────────────────────── */

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
}

export function SectionHeader({ eyebrow, title, description, align = 'left', className = '', ...props }: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`.trim()} {...props}>
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      {description ? (
        <p className={`${centered ? 'mx-auto' : ''} mt-3 max-w-2xl text-base leading-7 text-ink-3`}>{description}</p>
      ) : null}
    </div>
  )
}

/* ── EmptyState ──────────────────────────────────────────────────── */

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

function DefaultEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald" fill="none" aria-hidden="true">
      <path d="M4 20c0-9 7-16 16-16 0 9-7 16-16 16Zm0 0L20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EmptyState({ icon = <DefaultEmptyIcon />, title, description, action, className = '', ...props }: EmptyStateProps) {
  return (
    <div
      className={`border-2 border-dashed border-line bg-surface rounded-lg-1 p-8 text-center ${className}`.trim()}
      {...props}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper-2" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-3">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/* ── AddTile (dashed add card) ───────────────────────────────────── */

export function AddTile({ label, sub, onClick, className = '' }: { label: string; sub?: string; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center gap-3 rounded-lg-1 border-2 border-dashed border-line bg-surface p-8 text-center cursor-pointer hover:border-emerald hover:bg-emerald-tint transition-colors duration-150 ${className}`.trim()}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-2">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-3" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-ink-4">{sub}</p>}
      </div>
    </button>
  )
}

/* ── FormInput ───────────────────────────────────────────────────── */

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  rightLabel?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function FormInput({ id, label, error, hint, rightLabel, leftIcon, rightIcon, className = '', ...props }: FormInputProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">{label}</label>
        {rightLabel && <span className="text-xs text-ink-4">{rightLabel}</span>}
      </div>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-4">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `${id}-hint` : error ? `${id}-err` : undefined}
          className={[
            'w-full rounded-md-1 border border-line bg-surface px-3.5 py-3.5 text-sm text-ink placeholder:text-ink-4 transition-colors duration-150',
            'focus:border-emerald focus:outline-none',
            error ? 'border-terra-2' : '',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3.5 flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-4 text-right">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-terra-2">{error}</p>}
    </div>
  )
}

/* ── FormSelect ──────────────────────────────────────────────────── */

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export function FormSelect({ id, label, error, children, className = '', ...props }: FormSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink-2">{label}</label>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={[
          'w-full rounded-md-1 border border-line bg-surface px-3.5 py-3.5 text-sm text-ink appearance-none transition-colors duration-150 focus:border-emerald focus:outline-none',
          error ? 'border-terra-2' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <p role="alert" className="mt-1.5 text-xs text-terra-2">{error}</p>}
    </div>
  )
}

/* ── FormTextarea ────────────────────────────────────────────────── */

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string
  label: string
  error?: string
}

export function FormTextarea({ id, label, error, className = '', ...props }: FormTextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink-2">{label}</label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={[
          'w-full rounded-md-1 border border-line bg-surface px-3.5 py-3.5 text-sm text-ink placeholder:text-ink-4 transition-colors resize-none focus:border-emerald focus:outline-none',
          error ? 'border-terra-2' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p role="alert" className="mt-1.5 text-xs text-terra-2">{error}</p>}
    </div>
  )
}

/* ── PageHeader ──────────────────────────────────────────────────── */

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/* ── AppMetricIcon (kept for backward compat) ────────────────────── */

export type AppMetricIconKind = 'harvest' | 'revenue' | 'cost' | 'profit-up' | 'profit-down' | 'report'

const metricIconPaths: Record<AppMetricIconKind, ReactNode> = {
  harvest: (
    <>
      <path d="M7.5 19.5c.8-5.6 3.1-10.2 7-13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.2 9.4c-2.5-.8-4.3-2.6-5.2-5.3 3.4-.2 5.7 1.2 6.9 4.1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12.5 7.8c.5-3 2.5-4.9 6-5.5.2 3.5-1.4 5.8-4.8 6.8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10.3 14.2c2.5-.4 4.8.4 6.8 2.4-2.8 1.8-5.4 1.6-7.8-.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  revenue: (
    <>
      <path d="M7 7.5h10M7 12h10M7 16.5h6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 3.5h11A2.5 2.5 0 0 1 20 6v12a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18V6a2.5 2.5 0 0 1 2.5-2.5Z" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  cost: (
    <>
      <path d="M6.5 4.5h11v15h-11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8h6M9 11.5h6M9 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m15.2 15.2 2.2 2.2m0-2.2-2.2 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  'profit-up': (
    <>
      <path d="M4.5 17.5 9 13l3 3 7-8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h4v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  'profit-down': (
    <>
      <path d="M4.5 8.5 9 13l3-3 7 8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 18h4v-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  report: (
    <>
      <path d="M6.5 3.5h8l3 3v14h-11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.5 3.8V7h3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 16v-3M12 16V9.5M15 16v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
}

export function AppMetricIcon({ kind, className = '' }: { kind: AppMetricIconKind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`.trim()} fill="none" aria-hidden="true">
      {metricIconPaths[kind]}
    </svg>
  )
}

/* ── Legacy shims (prevent import errors) ────────────────────────── */
export function MarketingCard({ children, className = '', ...props }: CardProps) {
  return <Card className={`marketing-panel ${className}`} {...props}>{children}</Card>
}

export function AppCard({ children, className = '', ...props }: CardProps) {
  return <Card className={className} {...props}>{children}</Card>
}

export function PrimaryButton({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button variant="primary" className={className} {...props}>{children}</Button>
}

export function SecondaryButton({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button variant="ghost" className={className} {...props}>{children}</Button>
}
