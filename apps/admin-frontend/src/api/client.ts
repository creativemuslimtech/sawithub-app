import axios from 'axios'

// When VITE_API_BASE_URL is unset, relative /api uses the Vite dev proxy or host rewrites — never a hard-coded production URL.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  // SEC-03: admin JWT in localStorage is XSS-exposed; host CSP + separate key (`sawit_admin_token`) limits blast radius vs user app.
  const token = localStorage.getItem('sawit_admin_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const hasToken = Boolean(localStorage.getItem('sawit_admin_token'))

    if (err.response?.status === 401 && hasToken && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('sawit_admin_token')
      localStorage.removeItem('sawit_admin_user')
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
