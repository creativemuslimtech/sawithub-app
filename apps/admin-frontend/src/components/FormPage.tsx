import type { ReactNode } from 'react'
import AppLayout from './AppLayout'
import AppTopbar from './AppTopbar'
import ShellUserMenu from './ShellUserMenu'

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
}

export default function FormPage({
  title,
  subtitle,
  children,
  eyebrow = 'Halaman Kerja',
  accent = '#22c55e',
  contentClassName = 'mx-auto w-full max-w-[1120px]',
  heroAside,
}: Props) {
  return (
    <AppLayout
      topbar={(
        <AppTopbar
          title={title}
          subtitle={subtitle}
          actions={<ShellUserMenu accentColor={accent} />}
        />
      )}
    >
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container space-y-6">
          <section
            className="relative overflow-hidden rounded-[32px] p-6 md:p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(10,18,16,0.96) 0%, rgba(12,30,24,0.94) 48%, rgba(32,18,10,0.94) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 28px 90px rgba(0,0,0,0.26)',
            }}
          >
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: `
                  radial-gradient(circle at 16% 18%, ${accent}26, transparent 26%),
                  radial-gradient(circle at 88% 22%, rgba(250,204,21,0.14), transparent 24%),
                  radial-gradient(circle at 72% 84%, rgba(56,189,248,0.12), transparent 24%)
                `,
              }}
            />

            <div className={`relative ${heroAside ? 'grid gap-4 lg:grid-cols-[1fr_19rem] lg:items-start' : ''}`}>
              <div>
                <span
                  className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: `${accent}`, background: `${accent}15`, border: `1px solid ${accent}24` }}
                >
                  {eyebrow}
                </span>
                <h1 className="mb-3 text-2xl font-semibold leading-tight text-white md:text-4xl">{title}</h1>
                {subtitle && (
                  <p className="max-w-3xl text-sm leading-7 text-white/68 md:text-base">{subtitle}</p>
                )}

              </div>
              {heroAside ? <div>{heroAside}</div> : null}
            </div>
          </section>

          <div
            className="rounded-[30px] p-4 md:p-6"
            style={{
              background: 'linear-gradient(150deg, rgba(255,255,255,0.04), rgba(5,10,14,0.92) 72%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className={contentClassName}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
