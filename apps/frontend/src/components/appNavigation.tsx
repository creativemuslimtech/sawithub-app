import type { ComponentType } from 'react'
import { HarvestIconSVG, LocationIconSVG, MaintenanceIconSVG } from './icons'
import { SidebarCalculatorIcon, SidebarCalendarIcon, SidebarHomeIcon, SidebarReportIcon } from './AppNavigationIcons'

export type AppNavigationItem = {
  icon: ComponentType<{ color?: string; size?: number }>
  label: string
  shortLabel: string
  to: string
  accent: string
  color: string
  note: string
}

export const APP_NAV_ITEMS: AppNavigationItem[] = [
  {
    icon: SidebarHomeIcon,
    label: 'Beranda',
    shortLabel: 'Beranda',
    to: '/dashboard',
    accent: '#22c55e',
    color: 'rgba(34,197,94,0.88)',
    note: 'Lihat keadaan kebun',
  },
  {
    icon: LocationIconSVG,
    label: 'Lahan',
    shortLabel: 'Lahan',
    to: '/lahan',
    accent: '#38bdf8',
    color: 'rgba(56,189,248,0.82)',
    note: 'Atur kebun dan letaknya',
  },
  {
    icon: HarvestIconSVG,
    label: 'Panen',
    shortLabel: 'Panen',
    to: '/panen',
    accent: '#4ade80',
    color: 'rgba(74,222,128,0.82)',
    note: 'Catat hasil panen',
  },
  {
    icon: MaintenanceIconSVG,
    label: 'Perawatan',
    shortLabel: 'Rawat',
    to: '/perawatan',
    accent: '#a78bfa',
    color: 'rgba(167,139,250,0.82)',
    note: 'Catat biaya dan kerja',
  },
  {
    icon: SidebarCalculatorIcon,
    label: 'Kalkulator',
    shortLabel: 'Kalk. pupuk',
    to: '/kalkulator-pupuk',
    accent: '#84cc16',
    color: 'rgba(132,204,22,0.82)',
    note: 'Hitung dosis pupuk',
  },
  {
    icon: SidebarCalendarIcon,
    label: 'Jadwal',
    shortLabel: 'Jadwal',
    to: '/jadwal-perawatan',
    accent: '#f59e0b',
    color: 'rgba(245,158,11,0.82)',
    note: 'Jadwal kerja kebun',
  },
  {
    icon: SidebarReportIcon,
    label: 'Laporan keuangan',
    shortLabel: 'Lap. keu.',
    to: '/laporan-keuangan',
    accent: '#34d399',
    color: 'rgba(52,211,153,0.82)',
    note: 'Uang masuk dan keluar',
  },
]

/** 5 primary actions shown in mobile bottom nav. Kalkulator and Jadwal live in MobileMoreNav overflow. */
export const BOTTOM_NAV_ITEMS: AppNavigationItem[] = [
  APP_NAV_ITEMS[0], // Beranda
  APP_NAV_ITEMS[1], // Lahan
  APP_NAV_ITEMS[2], // Panen
  APP_NAV_ITEMS[3], // Perawatan
  APP_NAV_ITEMS[6], // Laporan keuangan
]

/** Finance-adjacent routes (UX-02) — sidebar group + keuangan hub; primary nav already includes Laporan. */
export const KEUANGAN_NAV_LINKS: Array<{
  to: string
  label: string
  note: string
  accent: string
}> = [
  { to: '/keuangan', label: 'Ringkasan Keuangan', note: 'Pintu masuk alur uang & acuan', accent: '#10b981' },
  { to: '/pendapatan', label: 'Pendapatan', note: 'Alur kas hasil kebun', accent: '#facc15' },
  { to: '/harga-tbs', label: 'Harga TBS', note: 'Acuan harga komoditas', accent: '#fbbf24' },
]
