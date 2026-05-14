export const HarvestIconSVG = ({ color = '#4ade80', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2c-1 0-2 1-2 2v8c0 1 1 2 2 2s2-1 2-2V4c0-1-1-2-2-2z" />
    <path d="M8 10c-1-1-3-1-4 0s-1 3 0 4l4 4" />
    <path d="M16 10c1-1 3-1 4 0s1 3 0 4l-4 4" />
    <path d="M12 14c-3 2-5 4-5 6 0 2 2 4 5 4s5-2 5-4c0-2-2-4-5-6z" />
  </svg>
)

export const HarvestIconEmoji = () => '🌾'

export default HarvestIconSVG
