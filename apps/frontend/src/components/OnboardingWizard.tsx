import { useState } from 'react'
import { Link } from 'react-router-dom'

export type OnboardingWizardProps = {
  open: boolean
  onComplete: () => void
}

const STEPS: { title: string; body: string; to: string; cta: string }[] = [
  {
    title: 'Buat lahan',
    body: 'Tambahkan satu kebun dulu: nama, luas, dan detail dasar supaya panen bisa dipetakan ke lahan.',
    to: '/lahan/add',
    cta: 'Buka form tambah lahan',
  },
  {
    title: 'Catat panen',
    body: 'Satu entri panen sudah cukup untuk mulai melihat grafik dan ringkasan hasil di dashboard.',
    to: '/panen/add',
    cta: 'Buka form catat panen',
  },
  {
    title: 'Lihat laporan',
    body: 'Cek laporan keuangan untuk melihat alur uang dari panen dan biaya yang sudah Anda catat.',
    to: '/laporan-keuangan',
    cta: 'Buka laporan keuangan',
  },
]

export default function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)

  if (!open) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const handleSkip = () => {
    setStep(0)
    onComplete()
  }

  const handleFinish = () => {
    setStep(0)
    onComplete()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center sm:p-6"
      style={{ background: 'rgba(4, 10, 8, 0.72)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[28px] shadow-2xl"
        style={{
          background: 'linear-gradient(165deg, rgba(16, 40, 28, 0.98) 0%, rgba(8, 18, 14, 0.98) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.22)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div className="border-b border-white/10 px-6 pb-4 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Langkah {step + 1} dari {STEPS.length}</p>
          <h2 id="onboarding-wizard-title" className="mt-2 text-xl font-semibold text-white">
            {current.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{current.body}</p>
        </div>

        <div className="flex gap-2 px-6 py-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition"
              style={{
                background: i <= step ? 'rgba(52, 211, 153, 0.75)' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          <Link to={current.to} className="primary-button justify-center text-center">
            {current.cta}
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-stretch sm:gap-3">
            {!isLast && (
              <button type="button" onClick={() => setStep(s => s + 1)} className="secondary-button flex-1 justify-center min-w-[140px]">
                Lanjut ke langkah berikutnya
              </button>
            )}
            {isLast && (
              <button type="button" onClick={handleFinish} className="primary-button flex-1 justify-center min-w-[140px]" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                Selesai
              </button>
            )}
            <button type="button" onClick={handleSkip} className="secondary-button flex-1 justify-center min-w-[140px] text-white/55">
              Lewati panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
