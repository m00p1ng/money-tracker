import {
  describe,
  expect,
  it,
} from 'vitest'

import { formatAmount } from '@/lib'


describe('formatAmount', () => {
  it('formats THB with thousand separator and two decimals', () => {
    expect(formatAmount(1234567.89, 'THB', 'en-US')).toBe('฿1,234,567.89')
  })

  it('formats small THB amount', () => {
    expect(formatAmount(28, 'THB', 'en-US')).toBe('฿28.00')
  })

  it('formats USD with symbol', () => {
    expect(formatAmount(1234.5, 'USD', 'en-US')).toBe('$1,234.50')
  })

  it('formats EUR', () => {
    expect(formatAmount(9999.99, 'EUR', 'en-US')).toBe('€9,999.99')
  })

  it('formats JPY with yen symbol', () => {
    expect(formatAmount(1500, 'JPY', 'en-US')).toBe('¥1,500.00')
  })

  it('falls back to THB when currency is empty', () => {
    expect(formatAmount(100, '', 'en-US')).toBe('฿100.00')
  })

  it('falls back to THB when currency is invalid', () => {
    expect(formatAmount(100, 'INVALID', 'en-US')).toBe('INVALID100.00')
  })
})
