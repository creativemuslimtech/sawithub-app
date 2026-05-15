export const LocationIconSVG = ({ color = '#38bdf8', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
    <circle cx="12" cy="10" r="3" fill={color} />
  </svg>
)

export const LocationIconEmoji = () => '📍'

export default LocationIconSVG
