import { describe, expect, it } from 'vitest'
import { dateOnly, getPresetRange, isWithinDateRange } from '@/lib/dateRange'

describe('dateRange helpers', () => {
  const now = new Date('2026-05-23T10:30:00.000Z')

  it('builds this month range', () => {
    expect(getPresetRange('this-month', now)).toEqual({
      start: '2026-05-01',
      end: '2026-05-31',
    })
  })

  it('builds last 7 days range including today', () => {
    expect(getPresetRange('last-7d', now)).toEqual({
      start: '2026-05-17',
      end: '2026-05-23',
    })
  })

  it('normalizes dates to yyyy-mm-dd', () => {
    expect(dateOnly('2026-05-03T23:45:00.000Z')).toBe('2026-05-03')
  })

  it('builds last 90 days range including today', () => {
    expect(getPresetRange('last-90d', now)).toEqual({
      start: '2026-02-23',
      end: '2026-05-23',
    })
  })

  it('checks inclusive date range membership', () => {
    const range = { start: '2026-05-01', end: '2026-05-31' }
    expect(isWithinDateRange('2026-05-01T00:00:00.000Z', range)).toBe(true)
    expect(isWithinDateRange('2026-05-31T23:59:59.000Z', range)).toBe(true)
    expect(isWithinDateRange('2026-06-01T00:00:00.000Z', range)).toBe(false)
  })
})
