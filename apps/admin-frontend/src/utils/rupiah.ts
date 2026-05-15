export function normalizeRupiahInput(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, '')
  return digitsOnly.replace(/^0+(?=\d)/, '')
}

export function formatRupiahDisplay(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 'Rp 0'

  const parsed = typeof value === 'number'
    ? value
    : Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''))

  if (!Number.isFinite(parsed)) return 'Rp 0'

  const rounded = Math.round(parsed)
  const prefix = rounded < 0 ? '-' : ''
  return `${prefix}Rp ${Math.abs(rounded).toLocaleString('id-ID')}`
}

export function formatRupiahInput(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  const normalized = typeof value === 'number'
    ? String(Math.max(0, Math.round(value)))
    : normalizeRupiahInput(String(value))

  if (!normalized) return ''
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseRupiahInput(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const normalized = normalizeRupiahInput(String(value ?? ''))
  return normalized ? Number(normalized) : 0
}

export function toRupiahInputRaw(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number') return String(Math.max(0, Math.round(value)))
  return normalizeRupiahInput(value)
}
