import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useFarm } from '../context/useFarm'
import { useAuth } from '../context/useAuth'
import Card from './ds/Card'
import SeedSprout from './ds/botanical/SeedSprout'
import Chip from './ds/Chip'
import {
  HomeIcon, LeafIcon, BasketIcon, SprayIcon, CalIcon,
  MoneyIcon, ChartIcon, CalcIcon, StarIcon, UserIcon, MoreIcon,
} from './ds/icons'

const NAV_ITEMS = [
  { k: 'dashboard',   icon: HomeIcon,    label: 'Ringkasan',        to: '/dashboard' },
  { k: 'lahan',       icon: LeafIcon,    label: 'Lahan & Kebun',    to: '/lahan' },
  { k: 'panen',       icon: BasketIcon,  label: 'Panen',            to: '/panen' },
  { k: 'perawatan',   icon: SprayIcon,   label: 'Perawatan',        to: '/perawatan' },
  { k: 'jadwal',      icon: CalIcon,     label: 'Jadwal',           to: '/jadwal-perawatan' },
  { k: 'pendapatan',  icon: MoneyIcon,   label: 'Pendapatan',       to: '/pendapatan' },
  { k: 'laporan',     icon: ChartIcon,   label: 'Laporan Keuangan', to: '/laporan-keuangan' },
  { k: 'kalkulator',  icon: CalcIcon,    label: 'Kalkulator Pupuk', to: '/kalkulator-pupuk' },
  { k: 'harga',       icon: StarIcon,    label: 'Harga TBS',        to: '/harga-tbs' },
]

function isActive(pathname: string, to: string) {
  if (to === '/dashboard') return pathname === to
  return pathname.startsWith(to)
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { lahans, activeFarmId } = useFarm()
  const navigate = useNavigate()

  const activeFarm = lahans.find(l => String(l.id_lahan) === activeFarmId) ?? lahans[0]
  const farmName = activeFarm?.nama_kebun ?? 'Kebun Saya'
  const totalHa = lahans.reduce((s, l) => s + (l.luas_ha ?? 0), 0)

  const displayName = user?.full_name?.trim() || user?.username || user?.email || 'Pengguna'
  const letter = displayName.charAt(0).toUpperCase()

  return (
    <aside
      className="app-sidebar hidden md:flex fixed inset-y-0 left-0 z-30 flex-col overflow-hidden"
      style={{
        width: 'var(--shell-sidebar-width)',
        background: 'var(--paper)',
        borderRight: '1px solid var(--line-2)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 24px 0' }}>
        <Link to="/dashboard" aria-label="Ke beranda">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Farm switcher */}
      <div style={{ padding: '16px 16px 0' }}>
        <button style={{
          padding: '12px 14px', borderRadius: 12,
          background: 'var(--cream)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          textAlign: 'left', width: '100%',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--forest)', color: 'var(--paper)', display: 'grid', placeItems: 'center', fontFamily: 'var(--f-display)', fontWeight: 500, fontStyle: 'italic', fontSize: 16 }}>
            {letter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{farmName}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>
              {lahans.length} kebun · {totalHa > 0 ? `${totalHa.toFixed(1)} ha` : '—'}
            </div>
          </div>
          <span style={{ color: 'var(--ink-4)', fontSize: 14 }}>↕</span>
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ k, icon: Icon, label, to }) => {
          const active = isActive(pathname, to)
          return (
            <Link
              key={k}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                fontSize: 13.5, fontWeight: 500,
                color: active ? 'var(--forest)' : 'var(--ink-2)',
                background: active ? 'var(--forest-soft)' : 'transparent',
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', left: -16, top: 8, bottom: 8, width: 3, background: 'var(--forest)', borderRadius: '0 2px 2px 0' }} />
              )}
              <span style={{ color: active ? 'var(--forest)' : 'var(--ink-4)' }}>
                <Icon size={17} />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: trial card + user */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card style={{ padding: 16, background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
          <SeedSprout size={56} style={{ position: 'absolute', right: -6, bottom: -6, color: 'var(--forest)', opacity: 0.18 }} />
          <Chip tone="amber" style={{ marginBottom: 8 }}>Trial</Chip>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>Coba gratis 14 hari</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 10, lineHeight: 1.5 }}>Lanjutkan ke Petani Pro untuk akses penuh.</div>
          <Link
            to="/subscription"
            style={{ display: 'block', width: '100%', padding: '8px 0', borderRadius: 8, background: 'var(--forest)', color: 'var(--paper)', fontSize: 12, fontWeight: 600, border: 0, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}
          >
            Tingkatkan
          </Link>
        </Card>

        <div style={{ marginTop: 12, padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--amber-soft)', color: 'var(--amber-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <UserIcon size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email ?? ''}
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer', color: 'var(--ink-4)', borderRadius: 6 }}
            title="Keluar"
          >
            <MoreIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
