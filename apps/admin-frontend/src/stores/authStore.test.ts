import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
  })

  it('starts with null user and token', () => {
    const { user, token } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(token).toBeNull()
  })

  it('sets and clears token', () => {
    useAuthStore.getState().setToken('admin-jwt')
    expect(useAuthStore.getState().token).toBe('admin-jwt')
    useAuthStore.getState().clear()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
