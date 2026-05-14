type AppNavIconProps = {
  color?: string
  size?: number
}

export function SidebarHomeIcon({ color = 'currentColor', size = 20 }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.9">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function SidebarProfileIcon({ color = 'currentColor', size = 20 }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.9">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function SidebarCalendarIcon({ color = 'currentColor', size = 20 }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.9">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function SidebarReportIcon({ color = 'currentColor', size = 20 }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.9">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      <path d="M9 7h6M9 11h6M9 15h2" />
    </svg>
  )
}

export function SidebarCalculatorIcon({ color = 'currentColor', size = 20 }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.9">
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
      <rect x="8" y="5.5" width="8" height="3" rx="1" />
      <path d="M8 12h2M14 12h2M8 16h2M14 16h2M11 12v6" />
    </svg>
  )
}
