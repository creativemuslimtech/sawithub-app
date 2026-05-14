interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  mono?: boolean
}

const iconSize = { sm: 24, md: 32, lg: 40 }
const textSize = { sm: 16, md: 20, lg: 26 }

/** Inline SVG pelepah sawit — tulang daun + 4 pasang anak daun + titik tandan terakota */
function SHIcon({ px, mono }: { px: number; mono?: boolean }) {
  const stroke = mono ? 'currentColor' : '#0a7847'
  const fruit   = mono ? 'currentColor' : '#d96a2c'
  return (
    <svg width={px} height={px} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <clipPath id="shclip">
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#shclip)">
        <g stroke={stroke} strokeWidth="2.2" strokeLinecap="round" fill="none">
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
        <circle cx="20" cy="11" r="2.6" fill={fruit} />
      </g>
    </svg>
  )
}

export default function Logo({ size = 'md', showText = true, className = '', mono = false }: LogoProps) {
  const px = iconSize[size]
  const fs = textSize[size]

  if (!showText) {
    return (
      <div className={`flex items-center ${className}`}>
        <SHIcon px={px} mono={mono} />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SHIcon px={px} mono={mono} />
      <span
        style={{
          fontFamily: '"Bricolage Grotesque", "Plus Jakarta Sans", sans-serif',
          fontSize: fs,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          color: mono ? 'currentColor' : '#0d1f17',
        }}
      >
        sawit<span style={{ color: mono ? 'currentColor' : '#0a7847' }}>hub</span>
      </span>
    </div>
  )
}
