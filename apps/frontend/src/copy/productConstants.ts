/**
 * Product copy numbers — keep aligned with backend env:
 * SUBSCRIPTION_TRIAL_DAYS, SUBSCRIPTION_PLAN_PRICE (backend-sawithub internal/config).
 */
export const SUBSCRIPTION_TRIAL_DAYS = Number(import.meta.env.VITE_SUBSCRIPTION_TRIAL_DAYS ?? 14)

export const SUBSCRIPTION_PLAN_PRICE_IDR = Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_PRICE_IDR ?? 30_000)

export function formatPlanPriceIdr(): string {
  const n = SUBSCRIPTION_PLAN_PRICE_IDR
  if (!Number.isFinite(n)) return 'Rp 30.000'
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`
}
