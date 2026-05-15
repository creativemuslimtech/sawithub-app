import { create } from 'zustand'
import type { Lahan } from '../types'
import type { SubscriptionView } from '../context/farmContextBase'

interface FarmState {
  subscription: SubscriptionView | null
  lahans: Lahan[]
  loading: boolean
  setSubscription: (sub: SubscriptionView | null) => void
  setLahans: (lahans: Lahan[]) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useFarmStore = create<FarmState>()((set) => ({
  subscription: null,
  lahans: [],
  loading: false,
  setSubscription: (subscription) => set({ subscription }),
  setLahans: (lahans) => set({ lahans }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ subscription: null, lahans: [], loading: false }),
}))
