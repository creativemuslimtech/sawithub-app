export const IncomeIconSVG = ({ color = '#facc15', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <path d="M1 10h22" />
    <circle cx="6" cy="15" r="1" fill={color} />
    <path d="M12 7v10" />
    <path d="M9 10h6" />
  </svg>
)

export const IncomeIconEmoji = () => '💰'

export default IncomeIconSVG
