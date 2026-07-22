import { useEffect, useRef, useState } from 'react'
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
  const bannerRef = useRef<HTMLDivElement>(null)

  const visible = Boolean(user) && user?.role === 'admin' && Boolean(adminUrl) && !AUTH_PATHS.has(pathname) && !dismissed

  // AppTopNav (fixed) and Sidebar (fixed) don't participate in normal
  // document flow, so this banner's own in-flow height doesn't push them
  // down the way it does for sticky/flow siblings. Publish the rendered
  // height as a CSS var so those fixed elements can offset themselves.
  useEffect(() => {
    const root = document.documentElement
    if (!visible || !bannerRef.current) {
      root.style.setProperty('--admin-banner-height', '0px')
      return
    }
    const el = bannerRef.current
    const observer = new ResizeObserver(() => {
      // Read off the element itself rather than entry.contentRect, which
      // excludes padding/border and would undershoot this banner's real
      // on-screen height (it has both).
      root.style.setProperty('--admin-banner-height', `${el.getBoundingClientRect().height}px`)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.setProperty('--admin-banner-height', '0px')
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Petunjuk akses admin"
      className="sticky top-[env(safe-area-inset-top,0px)] z-[100] flex flex-wrap items-center justify-center gap-3 border-b border-sky-500/35 px-4 py-2.5 text-center text-sm"
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
