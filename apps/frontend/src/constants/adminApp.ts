/** Optional absolute origin of the admin SPA (`VITE_ADMIN_APP_URL`). Used for RBAC hints only. */
export function getAdminAppUrl(): string | undefined {
  const v = import.meta.env.VITE_ADMIN_APP_URL
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  if (!t) return undefined
  return t.replace(/\/+$/, '')
}
