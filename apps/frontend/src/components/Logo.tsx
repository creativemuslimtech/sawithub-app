interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  mono?: boolean
  color?: string
  wordColor?: string
}

const iconSize = { sm: 24, md: 32, lg: 44 }
const textSize = { sm: 16, md: 20, lg: 28 }

function SHIcon({ px, mono, color, fruit }: { px: number; mono?: boolean; color?: string; fruit?: string }) {
  const stroke = mono ? 'currentColor' : (color || '#1A3D2B')
  const fruitColor = mono ? 'currentColor' : (fruit || '#D4A827')
  return (
    <svg width={px} height={px} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={`shclip-${px}`}>
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath={`url(#shclip-${px})`}>
        <g stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M20 36 L20 12" />
          <path d="M20 30 C 14 30, 10 27, 8 23" />
          <path d="M20 25 C 13 24, 9 20, 7 15" />
          <path d="M20 20 C 14 18, 11 13, 11 8" />
          <path d="M20 15 C 16 12, 15 8, 16 4" />
          <path d="M20 30 C 26 30, 30 27, 32 23" />
          <path d="M20 25 C 27 24, 31 20, 33 15" />
          <path d="M20 20 C 26 18, 29 13, 29 8" />
          <path d="M20 15 C 24 12, 25 8, 24 4" />
        </g>
        <circle cx="20" cy="11" r="2.8" fill={fruitColor} />
      </g>
    </svg>
  )
}

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  mono = false,
  color,
  wordColor,
}: LogoProps) {
  const px = iconSize[size]
  const fs = textSize[size]
  const wc = mono ? 'currentColor' : (wordColor || '#1A1F1A')
  const accent = mono ? 'currentColor' : '#2D5A3D'

  if (!showText) {
    return (
      <div role="img" aria-label="Logo SawitHub" className={`flex items-center ${className}`}>
        <SHIcon px={px} mono={mono} color={color} />
      </div>
    )
  }

  return (
    <div role="img" aria-label="Logo SawitHub" className={`flex items-center ${className}`} style={{ gap: 10 }}>
      <SHIcon px={px} mono={mono} color={color} />
      <span
        style={{
          fontFamily: '"Fraunces", "Iowan Old Style", Georgia, serif',
          fontSize: fs,
          fontWeight: 500,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          color: wc,
          fontStyle: 'normal',
        }}
      >
        sawit<span style={{ color: mono ? 'currentColor' : accent, fontStyle: 'italic', fontWeight: 400 }}>hub</span>
      </span>
    </div>
  )
}
