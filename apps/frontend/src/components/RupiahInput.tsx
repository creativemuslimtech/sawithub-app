import type { InputHTMLAttributes } from 'react'
import { formatRupiahInput, normalizeRupiahInput } from '../utils/rupiah'

type RupiahInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

export default function RupiahInput({ value, onValueChange, inputMode = 'numeric', autoComplete = 'off', ...props }: RupiahInputProps) {
  return (
    <input
      {...props}
      autoComplete={autoComplete}
      inputMode={inputMode}
      pattern="[0-9.]*"
      type="text"
      value={formatRupiahInput(value)}
      onChange={(event) => onValueChange(normalizeRupiahInput(event.target.value))}
    />
  )
}
