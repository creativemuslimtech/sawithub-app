import { createContext } from 'react'
import type { Lahan } from '../types'

export type SubscriptionView = {
  subscription_status: string
  active_farm_limit: number
  current_active_farm_id: string
  access_mode?: string
  can_checkout?: boolean
  days_remaining?: number
  trial_remaining?: number
  plan_name?: string
  plan_price?: number
}

export type FarmContextValue = {
  subscription: SubscriptionView | null
  lahans: Lahan[]
  loading: boolean
  activeFarmId: string
  activeFarmLimit: number
  refresh: () => Promise<void>
  setActiveFarm: (idLahan: string) => Promise<void>
}

export const FarmContext = createContext<FarmContextValue | null>(null)
