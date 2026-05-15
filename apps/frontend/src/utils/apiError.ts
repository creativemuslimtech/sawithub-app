import { isAxiosError } from 'axios'

type ApiErrBody = {
  error?: string
  error_code?: string
}

const SUBSCRIPTION_GATE_BODY = 'Akses penuh memerlukan langganan aktif atau masa trial yang masih berjalan. Buka halaman Langganan untuk melihat status dan pilihan pembayaran.'

/** Pesan badan dialog yang konsisten (Anda) untuk gate trial/langganan. */
export function getSubscriptionGateMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrBody>(error)) {
    const code = error.response?.data?.error_code
    if (code === 'SUBSCRIPTION_REQUIRED') {
      return SUBSCRIPTION_GATE_BODY
    }
    const errText = String(error.response?.data?.error || '').toLowerCase()
    if (error.response?.status === 402 || errText.includes('subscription')) {
      return SUBSCRIPTION_GATE_BODY
    }
  }
  return fallback
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrBody>(error)) {
    return error.response?.data?.error || error.message || fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

export function isSubscriptionRequiredError(error: unknown) {
  if (!isAxiosError<ApiErrBody>(error)) return false
  if (error.response?.status === 402) return true
  return error.response?.data?.error_code === 'SUBSCRIPTION_REQUIRED'
}
