import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useFarm } from '../context/useFarm'

export type SubscriptionPaymentReturnVariant = 'finish' | 'unfinish' | 'error'

const copy: Record<
  SubscriptionPaymentReturnVariant,
  { title: string; body: string; tone: 'emerald' | 'amber' | 'rose' }
> = {
  finish: {
    title: 'Pembayaran selesai',
    body: 'Jika status belum berubah, tunggu beberapa detik — pemberituan dari Midtrans akan memperbarui langganan Anda. Anda bisa memuat ulang halaman langganan.',
    tone: 'emerald',
  },
  unfinish: {
    title: 'Pembayaran belum selesai',
    body: 'Anda menutup atau menghentikan pembayaran sebelum selesai. Tidak ada penagihan jika transaksi tidak diselesaikan.',
    tone: 'amber',
  },
  error: {
    title: 'Pembayaran gagal atau dibatalkan',
    body: 'Terjadi masalah pada alur pembayaran. Coba lagi dari halaman langganan atau gunakan metode bayar lain.',
    tone: 'rose',
  },
}

const borderByTone = {
  emerald: 'border-emerald-soft bg-emerald-tint',
  amber: 'border-line bg-paper-2',
  rose: 'border-terra-soft bg-terra-soft',
}

export default function SubscriptionPaymentReturn({ variant }: { variant: SubscriptionPaymentReturnVariant }) {
  const { refresh } = useFarm()
  const { title, body, tone } = copy[variant]

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <AppLayout>
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container max-w-2xl space-y-6">
          <div
            className={`rounded-xl-1 border p-6 text-sm shadow-card ${borderByTone[tone]}`}
            role="status"
          >
            <h1 className="text-lg font-semibold text-ink">{title}</h1>
            <p className="mt-3 leading-relaxed text-ink-3">{body}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/subscription" className="primary-button min-h-11 flex-1 text-center">
                Ke halaman langganan
              </Link>
              <Link to="/dashboard" className="secondary-button min-h-11 flex-1 text-center">
                Ke dasbor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
