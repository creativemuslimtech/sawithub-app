import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import PalmFrond from '../components/ds/botanical/PalmFrond'
import api from '../api/client'
import type { SubscriptionView } from '../context/farmContextBase'
import { trackEvent, GAEvents } from '../utils/analytics'
import { formatRupiahDisplay } from '../utils/rupiah'

const rp = formatRupiahDisplay

type StatusPayload = {
  subscription?: Partial<SubscriptionView> & Record<string, unknown>
}

type CheckoutPayload = {
  checkout?: {
    payment_url?: string
    order_id?: string
    status?: string
  }
  subscription?: Record<string, unknown>
}

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

function fmtDate(s: string | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

function paymentStatusChip(status: string) {
  const s = status.toLowerCase()
  if (s === 'settlement' || s === 'capture' || s === 'paid' || s === 'lunas') return 'sh-chip-forest'
  if (s === 'pending') return 'sh-chip-amber'
  return 'chip'
}

function paymentStatusLabel(status: string) {
  const s = status.toLowerCase()
  if (s === 'settlement' || s === 'capture' || s === 'paid') return 'Lunas'
  if (s === 'pending') return 'Menunggu'
  if (s === 'expire' || s === 'expired') return 'Kedaluwarsa'
  if (s === 'cancel' || s === 'deny') return 'Dibatalkan'
  return status.replace(/_/g, ' ')
}

const UPGRADE_FEATURES = [
  'Akun anggota tak terbatas',
  'Rekap koperasi + SHU otomatis',
  'API integrasi pabrik kelapa sawit',
  'Pelatihan onsite untuk anggota',
  'Dedicated success manager',
]

const USAGE_ITEMS = [
  { label: 'Catatan panen', value: '— / tak terbatas', pct: 0, color: 'var(--terra)' },
  { label: 'Kebun aktif', value: '— / tak terbatas', pct: 0, color: 'var(--c3)' },
  { label: 'Laporan diunduh', value: '— dari kuota wajar', pct: 0, color: 'var(--c1)' },
]

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')?.trim() ?? ''
  const provider = searchParams.get('provider')?.trim() ?? ''
  const allowMockBillingUi =
    import.meta.env.DEV || import.meta.env.VITE_ALLOW_MOCK_BILLING === 'true'
  const isMockPaymentSession =
    allowMockBillingUi && provider === 'mock' && orderId.length > 0

  const [sub, setSub] = useState<Partial<SubscriptionView> | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [mockBusy, setMockBusy] = useState(false)

  const [payments, setPayments] = useState<PaymentTransactionItem[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentsNextPage, setPaymentsNextPage] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<StatusPayload>('/BillingSubscriptionService/status')
      setSub(data.subscription ?? null)
    } catch {
      toast.error('Gagal memuat status langganan.')
      setSub(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPayments = useCallback(async (page: string | number, append: boolean) => {
    const setPending = append ? setLoadingMore : setPaymentsLoading
    setPending(true)
    try {
      const { data } = await api.get<TransactionsPayload>('/BillingPaymentService/transactions', {
        params: { page, limit: 10 },
      })
      const rows = data.items ?? []
      setPayments(prev => append ? [...prev, ...rows] : rows)
      const next = data.next_cursor
      setPaymentsNextPage(next && String(next).trim() !== '' ? String(next) : null)
    } catch {
      if (!append) setPayments([])
    } finally {
      setPending(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => { void loadPayments(1, false) }, [loadPayments])

  const checkout = async () => {
    setCheckoutBusy(true)
    try {
      const base = `${window.location.origin}/subscription`
      const { data } = await api.post<CheckoutPayload>('/BillingSubscriptionService/checkout', {
        return_url: `${base}/PaymentFinish`,
        return_url_unfinish: `${base}/PaymentUnFinish`,
        return_url_error: `${base}/PaymentError`,
      })
      const url = data.checkout?.payment_url?.trim()
      if (url) {
        trackEvent(GAEvents.CHECKOUT_START, {
          surface: 'subscription',
          has_order_id: Boolean(data.checkout?.order_id),
        })
        const target = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
        window.location.href = target
        return
      }
      toast.error('Tautan pembayaran tidak tersedia. Coba lagi sebentar lagi.')
    } catch {
      toast.error('Gagal memulai pembayaran.')
    } finally {
      setCheckoutBusy(false)
    }
  }

  const completeMockPayment = async () => {
    if (!isMockPaymentSession || !orderId) return
    setMockBusy(true)
    try {
      const gross = String(Math.round(Number(sub?.plan_price ?? 30_000)))
      await api.post('/BillingPaymentService/mock/callback', {
        provider: 'mock',
        order_id: orderId,
        transaction_status: 'settlement',
        gross_amount: gross,
      })
      toast.success('Simulasi pembayaran selesai. Memuat ulang status…')
      navigate('/subscription', { replace: true })
      await load()
    } catch {
      toast.error('Gagal menyelesaikan simulasi pembayaran.')
    } finally {
      setMockBusy(false)
    }
  }

  const planName = sub?.plan_name || 'Petani Pro'
  const isActive = sub && ['active', 'trialing'].includes(String(sub.subscription_status ?? '').toLowerCase())

  return (
    <AppLayout>
      <AppTopbar title="Langganan" />
      <div style={{ padding: '32px 36px 48px' }}>
        {/* Editorial header */}
        <div style={{ position: 'relative', marginBottom: 36 }}>
          <PalmFrond size={280} style={{ position: 'absolute', right: -40, top: -60, color: 'var(--forest)', opacity: 0.08, pointerEvents: 'none' }} />
          <div style={{ maxWidth: 720 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Langganan SawitHub</div>
            <h1 className="sh-h-1">
              Pilih paket yang <em className="sh-italic" style={{ color: 'var(--forest)' }}>tumbuh&nbsp;bersama</em> kebun kamu.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 14 }}>
              Bayar bulanan atau tahunan — hemat 2 bulan kalau bayar setahun. Bisa berhenti kapan saja.
            </p>
          </div>
        </div>

        {/* Mock payment banner */}
        {isMockPaymentSession && (
          <div className="mb-4 rounded-lg-1 border border-line bg-paper-2 p-5 text-sm">
            <p className="font-semibold" style={{ color: 'var(--terracotta-2)' }}>Mode simulasi (bukan pembayaran nyata)</p>
            <p className="mt-2 leading-relaxed text-ink-3">
              Lingkungan ini memakai pembayaran tiruan untuk pengujian. Tidak ada penagihan sungguhan.
            </p>
            <p className="mt-2 text-xs text-ink-4 font-mono">Order: {orderId}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'var(--forest)' }}
              disabled={mockBusy}
              onClick={() => void completeMockPayment()}
            >
              {mockBusy ? 'Memproses…' : 'Simulasi pembayaran (sandbox)'}
            </button>
          </div>
        )}

        {/* Active plan banner */}
        <div
          className="rounded-lg-1 mb-4 relative overflow-hidden"
          style={{
            padding: 32,
            background: 'linear-gradient(120deg, var(--forest-3) 0%, var(--forest) 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]" style={{ gap: 32, position: 'relative' }}>
            <div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-5 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  <div className="h-10 w-48 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '5px 12px', background: 'var(--terra)', borderRadius: 99,
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    ★ Paket aktif
                  </div>
                  <h2 className="display" style={{ fontSize: 38, fontWeight: 700, margin: '12px 0 8px', letterSpacing: '-0.025em' }}>
                    {planName}
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
                    {(sub as Record<string, unknown>)?.created_at ? `Berlangganan sejak ${fmtDate(String((sub as Record<string, unknown>).created_at))} · ` : ''}
                    {sub?.days_remaining != null && sub.days_remaining > 0
                      ? `Sisa ${sub.days_remaining} hari.`
                      : sub?.can_checkout
                        ? 'Perlu pembayaran untuk melanjutkan akses.'
                        : 'Akses aktif.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button
                      onClick={() => void checkout()}
                      disabled={checkoutBusy || sub?.can_checkout === false}
                      style={{ background: 'white', color: 'var(--ink)', padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, border: 'none', cursor: sub?.can_checkout === false ? 'not-allowed' : 'pointer', opacity: sub?.can_checkout === false ? 0.6 : 1 }}
                    >
                      {checkoutBusy ? 'Menghubungkan…' : isActive ? 'Perbarui pembayaran' : 'Lanjutkan pembayaran'}
                    </button>
                    <button
                      onClick={() => void load()}
                      style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Muat ulang status
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Usage meters */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 22,
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Pemakaian bulan ini
              </div>
              {USAGE_ITEMS.map((u, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{u.label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{u.value}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${u.pct * 100}%`, height: '100%', background: u.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2-col grid: upgrade card + payment history */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          {/* Upgrade card */}
          <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
            <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Tingkatkan</p>
            <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Naik ke Koperasi</h3>
            <p className="text-sm text-ink-3 mb-5 leading-relaxed">
              Cocok jika kamu ingin mengelola anggota koperasi atau kelompok tani 50+ petani.
              Dapat akun multi-anggota, rekap koperasi, dan API integrasi PKS.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {UPGRADE_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <span style={{ color: 'var(--forest-3)', fontWeight: 700 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-5" style={{ borderTop: '1px solid var(--line)' }}>
              <div>
                <div className="num text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>Hubungi kami</div>
                <div className="text-xs text-ink-4 mt-0.5">harga sesuai jumlah anggota</div>
              </div>
              <Link
                to="/bantuan/akses"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--forest)' }}
              >
                Diskusi dengan tim →
              </Link>
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm overflow-hidden">
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--line)' }}>
              <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Riwayat pembayaran</p>
              <h3 className="sh-h-4" style={{ marginTop: 4 }}>
                {paymentsLoading ? '—' : `${payments.length} tagihan`}
              </h3>
            </div>

            {paymentsLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'var(--paper-2)' }} />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-4">
                Belum ada riwayat pembayaran.
              </div>
            ) : (
              <>
                {payments.map((p, i) => (
                  <div
                    key={`${p.order_id}-${p.transaction_time}`}
                    className="flex items-center px-6 py-3.5"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)', fontSize: 13 }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--paper)', display: 'grid', placeItems: 'center', marginRight: 14, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>💳</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink truncate">
                        {new Date(p.transaction_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                      </div>
                      <div className="text-xs text-ink-4 truncate">{p.payment_type || 'Pembayaran'}</div>
                    </div>
                    <div className="num text-sm font-bold mr-3 shrink-0">{rp(p.gross_amount)}</div>
                    <span className={`chip ${paymentStatusChip(p.payment_status)}`} style={{ fontSize: 11 }}>
                      {paymentStatusLabel(p.payment_status)}
                    </span>
                  </div>
                ))}
                {paymentsNextPage && (
                  <div className="px-6 py-3 border-t border-line">
                    <button
                      onClick={() => void loadPayments(paymentsNextPage, true)}
                      disabled={loadingMore}
                      className="text-sm font-semibold disabled:opacity-50"
                      style={{ color: 'var(--forest-3)' }}
                    >
                      {loadingMore ? 'Memuat…' : 'Muat lebih banyak →'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
