import { useContext } from 'react'
import { FarmContext } from './farmContextBase'

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) {
    throw new Error('useFarm must be used within FarmProvider')
  }
  return ctx
}
