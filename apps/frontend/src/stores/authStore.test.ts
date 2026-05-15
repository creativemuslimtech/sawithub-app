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

  it('sets token correctly', () => {
    useAuthStore.getState().setToken('test-jwt-token')
    expect(useAuthStore.getState().token).toBe('test-jwt-token')
  })

  it('sets user correctly', () => {
    const mockUser = { user_id: '1', email: 'test@example.com', username: 'testuser', full_name: 'Test User', role: 'user' as const }
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('clears both user and token', () => {
    useAuthStore.getState().setToken('jwt')
    useAuthStore.getState().setUser({ user_id: '1', email: 'test@example.com', username: 'testuser', full_name: 'Test User', role: 'user' as const })
    useAuthStore.getState().clear()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
