import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getAdminAppUrl } from '../constants/adminApp'

const AUTH_PATHS = new Set(['/login', '/signup', '/forgot-password', '/reset-password'])

const SESSION_KEY = 'admin-rbac-banner-dismissed'

export default function AdminRoleRouteBanner() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const adminUrl = getAdminAppUrl()
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1',
  )

  if (!user || user.role !== 'admin' || !adminUrl) return null
  if (AUTH_PATHS.has(pathname)) return null
  if (dismissed) return null

  return (
    <div
      role="region"
      aria-label="Petunjuk akses admin"
      className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-3 border-b border-sky-500/35 px-4 py-2.5 text-center text-sm"
      style={{
        background: 'linear-gradient(90deg, rgba(8,47,73,0.97), rgba(12,74,110,0.95))',
        color: 'rgba(224,242,254,0.95)',
      }}
    >
      <span>
        Anda masuk dengan peran <strong className="text-white">admin</strong>. Moderasi basis pengguna dan operasi
        global dilakukan di{' '}
        <strong className="text-white">panel admin</strong>, bukan di aplikasi petani ini.
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-3 py-1.5 font-semibold text-[#0c1929]"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
        >
          Buka panel admin
        </a>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-sky-100/90 underline-offset-2 hover:underline"
          onClick={() => {
            sessionStorage.setItem(SESSION_KEY, '1')
            setDismissed(true)
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
