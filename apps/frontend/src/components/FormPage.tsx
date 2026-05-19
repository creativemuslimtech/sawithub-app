import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from './AppLayout'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  eyebrow?: string
  accent?: string
  stats?: Array<{ label: string; value: string; hint: string }>
  insights?: string[]
  contentClassName?: string
  heroAside?: ReactNode
  backTo?: string
  backLabel?: string
  /** @deprecated — topbar handled by AppTopNav now */
  topbar?: ReactNode
}

export default function FormPage({
  title,
  subtitle,
  children,
  eyebrow = 'Halaman Kerja',
  accent = 'var(--forest)',
  stats = [],
  insights = [],
  contentClassName = 'mx-auto w-full max-w-[900px]',
  heroAside,
  backTo,
  backLabel,
}: Props) {
  return (
    <AppLayout>
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container space-y-6">

          {/* Page header card */}
          <section className="rounded-lg-1 border border-line bg-surface p-6 shadow-card-sm">
            <div className={heroAside ? 'grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start' : ''}>
              <div>
                <span
                  className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)` }}
                >
                  {eyebrow}
                </span>

                {backTo && (
                  <div className="mb-3">
                    <Link to={backTo} className="text-sm font-medium text-ink-3 hover:text-ink transition-colors">
                      ← {backLabel ?? 'Kembali'}
                    </Link>
                  </div>
                )}

                <h1 className="display text-2xl font-bold text-ink md:text-3xl">{title}</h1>
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-3">{subtitle}</p>
                )}

                {(stats.length > 0 || insights.length > 0) && (
                  <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                    {stats.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {stats.map(item => (
                          <article
                            key={`${item.label}-${item.value}`}
                            className="rounded-md-1 border border-line bg-paper p-4"
                          >
                            <p className="eyebrow">{item.label}</p>
                            <p className="num mt-1 text-xl font-bold text-ink">{item.value}</p>
                            <p className="mt-1 text-xs text-ink-4">{item.hint}</p>
                          </article>
                        ))}
                      </div>
                    )}

                    {insights.length > 0 && (
                      <aside className="rounded-md-1 border border-forest-soft bg-forest-tint p-4">
                        <p className="sh-eyebrow text-forest-3">Tips pengisian</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-3">
                          {insights.map(item => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </aside>
                    )}
                  </div>
                )}
              </div>

              {heroAside && <div>{heroAside}</div>}
            </div>
          </section>

          {/* Form content */}
          <div className="rounded-lg-1 border border-line bg-surface p-6 shadow-card-sm">
            <div className={contentClassName}>
              {children}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
