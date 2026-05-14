import axios from 'axios'

// Match admin-frontend: no hard-coded prod/staging hosts. Unset VITE_API_BASE_URL uses same-origin `/api`:
// - Vite dev: server proxy forwards /api → localhost:8000 (see vite.config.ts)
// - Vercel: vercel.json / vercel.production.json rewrite /api to the right backend per environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  // SEC-03: JWT in localStorage is XSS-exposed; rely on strict CSP (vercel.json) + dependency audits + short-lived tokens long-term.
  const token = localStorage.getItem('sawit_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const requestUrl = String(err.config?.url ?? '')
    const isResetFlowRequest =
      requestUrl.includes('/IdentityAuthService/forgot-password') ||
      requestUrl.includes('/IdentityAuthService/verify-reset') ||
      requestUrl.includes('/IdentityAuthService/reset-password')
    const hasToken = Boolean(localStorage.getItem('sawit_token'))

    if (err.response?.status === 401 && hasToken && !isResetFlowRequest && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('sawit_token')
      localStorage.removeItem('sawit_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const apiClient = api
export default api
