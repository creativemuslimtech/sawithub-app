import { useTheme } from '../context/ThemeContext'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { theme, loading } = useTheme()
  const textSize = size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-xs' : 'text-lg'

  if (loading) {
    return (
      <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
        <div className={`${sizes[size]} shrink-0 rounded bg-gray-700 animate-pulse`} />
        {showText && <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />}
      </div>
    )
  }

  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <img
        src={theme?.logoUrl || '/logo.png'}
        alt="SawitHub Logo"
        className={`${sizes[size]} shrink-0 object-contain`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logo.png'
        }}
      />
      {showText && (
        <span className={`truncate whitespace-nowrap font-semibold tracking-tight text-white ${textSize}`}>
          SawitHub
        </span>
      )}
    </div>
  )
}
