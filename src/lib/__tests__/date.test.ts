import { describe, expect, it } from 'vitest'

import { formatHeaderDate, formatShortDate, isTodayInLocalTime, monthRangeLabel, toDatetimeLocalValue } from '@/lib/date'

describe('date utilities', () => {
  it('formats the header date', () => {
    expect(formatHeaderDate(new Date('2026-05-22T09:00:00'))).toBe('Fri, 22 May 2026')
  })

  it('formats the short section date', () => {
    expect(formatShortDate(new Date('2026-05-22T09:00:00'))).toBe('22 May')
  })

  it('detects local same-day ISO strings', () => {
    const now = new Date('2026-05-22T12:00:00')
    expect(isTodayInLocalTime('2026-05-22T01:30:00.000Z', now)).toBe(true)
    expect(isTodayInLocalTime('2026-05-21T01:30:00.000Z', now)).toBe(false)
  })

  it('formats current month range', () => {
    expect(monthRangeLabel(new Date('2026-05-22T09:00:00'))).toBe('1 May - 31 May')
  })

  it('converts to datetime-local value', () => {
    const date = new Date('2026-05-22T10:30:00')
    expect(toDatetimeLocalValue(date)).toBe('2026-05-22T10:30')
  })
})
