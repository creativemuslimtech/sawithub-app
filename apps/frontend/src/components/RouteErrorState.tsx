import { EmptyState, PrimaryButton, SecondaryButton } from './design-system'

type RouteErrorStateProps = {
  onRecover: () => void | Promise<void>
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-100" fill="none" aria-hidden="true">
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 16.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M10.4 4.8 3.3 17.1A2 2 0 0 0 5 20h14a2 2 0 0 0 1.7-2.9L13.6 4.8a1.85 1.85 0 0 0-3.2 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RouteLoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f23] px-6 text-center text-gray-100">
      <EmptyState
        title="Memuat SawitHub..."
        description="Sebentar ya, halaman sedang disiapkan. Jika sinyal lambat, tetap tunggu beberapa detik lagi."
      />
    </main>
  )
}

export function RouteErrorState({ onRecover }: RouteErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f23] px-6 text-center text-gray-100">
      <EmptyState
        icon={<ErrorIcon />}
        title="SawitHub perlu dimuat ulang"
        description="Browser mungkin masih memakai file lama atau gagal mengambil file aplikasi terbaru. Bersihkan cache aplikasi lalu muat ulang halaman ini."
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <PrimaryButton type="button" onClick={onRecover} className="w-full sm:w-auto">
              Bersihkan cache & muat ulang
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { window.location.href = '/' }} className="w-full sm:w-auto">
              Kembali ke halaman awal
            </SecondaryButton>
          </div>
        }
      />
    </main>
  )
}
