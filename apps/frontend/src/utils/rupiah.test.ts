import { describe, it, expect } from 'vitest'
import {
  normalizeRupiahInput,
  formatRupiahInput,
  parseRupiahInput,
  toRupiahInputRaw,
} from './rupiah'

describe('normalizeRupiahInput', () => {
  it('strips non-digit characters', () => {
    expect(normalizeRupiahInput('1.234.567')).toBe('1234567')
  })
  it('removes leading zeros', () => {
    expect(normalizeRupiahInput('007')).toBe('7')
  })
  it('returns empty string for empty input', () => {
    expect(normalizeRupiahInput('')).toBe('')
  })
})

describe('formatRupiahInput', () => {
  it('formats number with thousand separators', () => {
    expect(formatRupiahInput('1234567')).toBe('1.234.567')
  })
  it('returns empty string for null/undefined', () => {
    expect(formatRupiahInput(null)).toBe('')
    expect(formatRupiahInput(undefined)).toBe('')
  })
  it('formats number input', () => {
    expect(formatRupiahInput(5000)).toBe('5.000')
  })
})

describe('parseRupiahInput', () => {
  it('parses formatted string to number', () => {
    expect(parseRupiahInput('1.234.567')).toBe(1234567)
  })
  it('returns 0 for empty/null/undefined', () => {
    expect(parseRupiahInput('')).toBe(0)
    expect(parseRupiahInput(null)).toBe(0)
    expect(parseRupiahInput(undefined)).toBe(0)
  })
  it('returns number as-is if already a number', () => {
    expect(parseRupiahInput(99000)).toBe(99000)
  })
})

describe('toRupiahInputRaw', () => {
  it('converts number to digit string', () => {
    expect(toRupiahInputRaw(5000)).toBe('5000')
  })
  it('returns empty string for null/undefined/empty', () => {
    expect(toRupiahInputRaw(null)).toBe('')
    expect(toRupiahInputRaw(undefined)).toBe('')
    expect(toRupiahInputRaw('')).toBe('')
  })
})
