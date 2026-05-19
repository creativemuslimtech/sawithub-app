import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'amber' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  leading?: ReactNode
  trailing?: ReactNode
  style?: CSSProperties
}

export default function Btn({ variant = 'primary', size, leading, trailing, children, style, className = '', ...rest }: BtnProps) {
  const cls = ['sh-btn']
  if (variant === 'primary') cls.push('sh-btn-primary')
  else if (variant === 'amber') cls.push('sh-btn-amber')
  else cls.push('sh-btn-ghost')
  if (size === 'sm') cls.push('sh-btn-sm')
  if (size === 'lg') cls.push('sh-btn-lg')
  return (
    <button className={`${cls.join(' ')} ${className}`} style={style} {...rest}>
      {leading}{children}{trailing}
    </button>
  )
}
