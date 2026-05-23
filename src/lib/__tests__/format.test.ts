import { describe, expect, it } from 'vitest'

import { formatAmount } from '@/lib'


describe('formatAmount', () => {
  it('formats THB with two decimals', () => {
    expect(formatAmount(28, 'THB')).toBe('฿28.00')
  })

  it('falls back to the currency code when a symbol is unknown', () => {
    expect(formatAmount(12.5, 'XYZ')).toBe('XYZ12.50')
  })
})
