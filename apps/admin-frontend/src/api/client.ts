import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const hasToken = Boolean(useAuthStore.getState().token)
    if (err.response?.status === 401 && hasToken && !window.location.pathname.includes('/login')) {
      useAuthStore.getState().clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

/** PUT `/api/admin/system/api-state` — global public API kill switch (requires Redis). Body matches Go: `api_enabled`. */
export function setGlobalApiState(apiEnabled: boolean) {
  return api.put('/admin/system/api-state', { api_enabled: apiEnabled })
}

export const apiClient = api
export default api
