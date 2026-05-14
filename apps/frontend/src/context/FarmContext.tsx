import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import api from '../api/client'
import type { Lahan } from '../types'
import { useAuth } from './useAuth'
import { FarmContext, type SubscriptionView } from './farmContextBase'

type StatusResponse = {
  subscription?: Partial<SubscriptionView> & Record<string, unknown>
}

function normalizeSub(raw: Partial<SubscriptionView> | undefined): SubscriptionView | null {
  if (!raw) return null
  return {
    subscription_status: String(raw.subscription_status ?? ''),
    active_farm_limit: Number(raw.active_farm_limit ?? 1) || 1,
    current_active_farm_id: String(raw.current_active_farm_id ?? '').trim(),
    access_mode: raw.access_mode ? String(raw.access_mode) : undefined,
    can_checkout: raw.can_checkout,
    days_remaining: raw.days_remaining,
    trial_remaining: raw.trial_remaining,
    plan_name: raw.plan_name ? String(raw.plan_name) : undefined,
    plan_price: raw.plan_price != null ? Number(raw.plan_price) : undefined,
  }
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null)
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setLahans([])
      return
    }
    setLoading(true)
    try {
      const [subRes, plotRes] = await Promise.all([
        api.get<StatusResponse>('/BillingSubscriptionService/status'),
        api.get<Lahan[]>('/CorePlotService'),
      ])
      setSubscription(normalizeSub(subRes.data.subscription))
      setLahans(Array.isArray(plotRes.data) ? plotRes.data : [])
    } catch {
      setSubscription(null)
      setLahans([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const activeFarmLimit = subscription?.active_farm_limit ?? 1

  /** Empty string means “semua kebun” for filtering; backend persists explicit plot id when set. */
  const activeFarmId = useMemo(
    () => subscription?.current_active_farm_id?.trim() ?? '',
    [subscription?.current_active_farm_id],
  )

  const setActiveFarm = useCallback(
    async (idLahan: string) => {
      await api.put('/BillingSubscriptionService/active-farm', { id_lahan: idLahan })
      await load()
    },
    [load],
  )

  const value = useMemo(
    () => ({
      subscription,
      lahans,
      loading,
      activeFarmId,
      activeFarmLimit,
      refresh: load,
      setActiveFarm,
    }),
    [subscription, lahans, loading, activeFarmId, activeFarmLimit, load, setActiveFarm],
  )

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>
}
