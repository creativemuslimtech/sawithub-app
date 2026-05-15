import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import api from '../api/client'
import { formatRupiahDisplay } from '../utils/rupiah'

type PaymentTransactionItem = {
  order_id: string
  gross_amount: number
  currency: string
  payment_status: string
  payment_type?: string
  transaction_time: string
}

type TransactionsPayload = {
  items: PaymentTransactionItem[]
  next_cursor?: string | null
}

function formatStatusLabel(raw: string) {
  return raw.replace(/_/g, ' ')
}

export default function SubscriptionPaymentsPage() {
  const [items, setItems] = useState<PaymentTransactionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextPage, setNextPage] = useState<string | null>(null)

  const loadPage = useCallback(async (page: string | number, append: boolean) => {
    const p = append ? setLoadingMore : setLoading
    p(true)
    try {
      const { data } = await api.get<TransactionsPayload>('/BillingPaymentService/transactions', {
        params: { page, limit: 20 },
      })
      const rows = data.items ?? []
      setItems(prev => (append ? [...prev, ...rows] : rows))
      const next = data.next_cursor
      setNextPage(next && String(next).trim() !== '' ? String(next) : null)
    } catch {
      toast.error('Gagal memuat riwayat pembayaran.')
      if (!append) setItems([])
      setNextPage(null)
    } finally {
      p(false)
    }
  }, [])

  useEffect(() => {
    void loadPage(1, false)
  }, [loadPage])

  return (
    <AppLayout>
      <div className="app-shell-gutter py-6 md:py-8">
        <div className="app-shell-container max-w-2xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink">Riwayat pembayaran</h1>
              <p className="mt-2 text-sm text-ink-3">
                Daftar order dan status pembayaran dari Midtrans atau saluran yang terhubung.
              </p>
            </div>
            <Link
              to="/subscription"
              className="secondary-button inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium no-underline"
            >
              Kembali ke langganan
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-ink-4">Memuat…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl-1 border border-line bg-surface p-6 text-sm text-ink-4">
              Belum ada transaksi pembayaran yang tercatat.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(row => (
                <li
                  key={`${row.order_id}-${row.transaction_time}`}
                  className="rounded-xl border border-line bg-surface p-5 text-sm shadow-card-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-ink-4">{row.order_id}</p>
                      <p className="text-lg font-semibold text-ink">
                        {formatRupiahDisplay(row.gross_amount)}
                        <span className="ml-2 text-xs font-normal text-ink-4">{row.currency}</span>
                      </p>
                      <p className="text-ink-3">
                        {new Date(row.transaction_time).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="text-right sm:pt-1">
                      <span className="inline-block rounded-full border border-line px-3 py-1 text-xs font-medium capitalize text-ink-3">
                        {formatStatusLabel(row.payment_status)}
                      </span>
                      {row.payment_type ? (
                        <p className="mt-2 text-xs text-ink-4">{row.payment_type}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && nextPage ? (
            <button
              type="button"
              className="secondary-button min-h-11 w-full disabled:opacity-50"
              disabled={loadingMore}
              onClick={() => void loadPage(nextPage, true)}
            >
              {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
            </button>
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
