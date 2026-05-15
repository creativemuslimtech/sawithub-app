export const MaintenanceIconSVG = ({ color = '#a78bfa', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M15.5 9.5L9 16l-2-2" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
)

export const MaintenanceIconEmoji = () => '🔧'

export default MaintenanceIconSVG
