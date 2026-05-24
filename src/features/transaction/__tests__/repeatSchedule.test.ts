import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  materializeRepeatOccurrence,
  nextRepeatDate,
  projectRepeatOccurrences,
} from '@/features/transaction/repeatSchedule'
import type { Transaction } from '@/types/domain'

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-rent',
    type: 'expense',
    walletId: 'wallet-cash',
    currency: 'THB',
    items: [{ categoryId: 'expense-rent', amount: 15000 }],
    date: '2026-01-31T08:45:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'planned',
    ...overrides,
  }
}

function localDateString(value: string): string {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isoWithLocalTime(sourceDate: string, occurrenceDate: string): string {
  const source = new Date(sourceDate)
  const [year, month, day] = occurrenceDate.split('-').map(Number)

  return new Date(
    year,
    month - 1,
    day,
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
    source.getMilliseconds(),
  ).toISOString()
}

describe('repeatSchedule', () => {
  it('clamps monthly date advancement to shorter months', () => {
    expect(nextRepeatDate('2026-01-31', { preset: 'monthly' })).toBe('2026-02-28')
    expect(nextRepeatDate('2026-02-28', { preset: 'monthly' })).toBe('2026-03-28')
  })

  it('clamps custom yearly leap day advancement', () => {
    expect(nextRepeatDate('2024-02-29', {
      preset: 'custom',
      customEvery: 1,
      customUnit: 'year',
    })).toBe('2025-02-28')
  })

  it('projects 12 months of repeat occurrences and excludes materialized rows', () => {
    const source = transaction({ repeat: { preset: 'monthly' } })
    const materialized = transaction({
      id: 'tx-rent-feb',
      date: '2026-02-28T08:45:00.000Z',
      status: 'paid',
      repeatSourceId: 'tx-rent',
      repeatOccurrenceDate: '2026-02-28',
    })

    const occurrences = projectRepeatOccurrences([source, materialized], new Date('2026-02-01T12:00:00.000Z'))

    expect(occurrences[0]).toMatchObject({
      id: 'repeat:tx-rent:2026-03-28',
      sourceId: 'tx-rent',
      occurrenceDate: '2026-03-28',
    })
    expect(occurrences.map((occurrence) => occurrence.occurrenceDate)).not.toContain('2026-02-28')
    expect(occurrences.every((occurrence) => occurrence.occurrenceDate <= '2027-02-01')).toBe(true)
  })

  it('projects from the local calendar day for ISO timestamps near midnight', () => {
    const sourceDate = '2026-01-31T17:30:00.000Z'
    const expectedOccurrenceDate = nextRepeatDate(localDateString(sourceDate), { preset: 'monthly' })
    const source = transaction({
      date: sourceDate,
      repeat: { preset: 'monthly' },
    })

    const occurrences = projectRepeatOccurrences([source], new Date('2026-02-01T01:00:00.000Z'))

    expect(occurrences[0]).toMatchObject({
      id: `repeat:tx-rent:${expectedOccurrenceDate}`,
      sourceId: 'tx-rent',
      occurrenceDate: expectedOccurrenceDate,
    })
    expect(occurrences[0].transaction.date).toBe(isoWithLocalTime(sourceDate, expectedOccurrenceDate))
  })

  it('materializes a repeat occurrence as a paid transaction with repeat metadata', () => {
    const source = transaction({
      date: '2026-01-31T08:45:30.000Z',
      repeat: { preset: 'monthly' },
    })

    const materialized = materializeRepeatOccurrence(
      source,
      '2026-03-31',
      () => 'tx-rent-mar',
      '2026-03-31T09:00:00.000Z',
    )

    expect(materialized).toMatchObject({
      id: 'tx-rent-mar',
      status: 'paid',
      repeatSourceId: 'tx-rent',
      repeatOccurrenceDate: '2026-03-31',
      createdAt: '2026-03-31T09:00:00.000Z',
      date: '2026-03-31T08:45:30.000Z',
    })
    expect(materialized.repeat).toBeUndefined()
  })

  it('materializes repeat occurrences while preserving local wall-clock time', () => {
    const sourceDate = '2026-01-31T17:30:00.000Z'
    const occurrenceDate = nextRepeatDate(localDateString(sourceDate), { preset: 'monthly' })
    const source = transaction({
      date: sourceDate,
      repeat: { preset: 'monthly' },
    })

    const materialized = materializeRepeatOccurrence(
      source,
      occurrenceDate,
      () => 'tx-rent-mar',
      '2026-03-01T09:00:00.000Z',
    )
    const sourceTime = new Date(sourceDate)
    const materializedTime = new Date(materialized.date)

    expect(materialized).toMatchObject({
      id: 'tx-rent-mar',
      date: isoWithLocalTime(sourceDate, occurrenceDate),
      status: 'paid',
      repeatSourceId: 'tx-rent',
      repeatOccurrenceDate: occurrenceDate,
      createdAt: '2026-03-01T09:00:00.000Z',
    })
    expect(materializedTime.getHours()).toBe(sourceTime.getHours())
    expect(materializedTime.getMinutes()).toBe(sourceTime.getMinutes())
    expect(materialized.repeat).toBeUndefined()
  })

  it('does not project never or invalid custom repeat configs', () => {
    const neverRepeats = transaction({ id: 'tx-never', repeat: { preset: 'never' } })
    const invalidCustom = transaction({
      id: 'tx-invalid',
      repeat: {
        preset: 'custom',
        customEvery: 0,
        customUnit: 'month',
      },
    })

    expect(projectRepeatOccurrences([neverRepeats, invalidCustom], new Date('2026-02-01T12:00:00.000Z'))).toEqual([])
  })

  it('does not project paid transactions with stale repeat configs', () => {
    const paidSource = transaction({
      status: 'paid',
      repeat: { preset: 'monthly' },
    })

    expect(projectRepeatOccurrences([paidSource], new Date('2026-02-01T12:00:00.000Z'))).toEqual([])
  })
})
