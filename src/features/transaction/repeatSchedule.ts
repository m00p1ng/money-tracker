import type { RepeatConfig, Transaction } from '@/types/domain'

export type VirtualRepeatOccurrence = {
  id: string
  sourceId: string
  occurrenceDate: string
  transaction: Transaction
}

type DateParts = {
  year: number
  month: number
  day: number
}

type ValidCustomRepeat = RepeatConfig & {
  preset: 'custom'
  customEvery: number
  customUnit: 'day' | 'month' | 'year'
}

function localDateString(value: string): string {
  if (!value.includes('T')) {
    return value.slice(0, 10)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }

  return formatDateParts({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  })
}

function todayString(now: Date): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateParts(value: string): DateParts | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) {
    return undefined
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined
  }
  if (month < 1 || month > 12 || day < 1) {
    return undefined
  }

  return {
    year,
    month,
    day,
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function formatDateParts({
  year,
  month,
  day,
}: DateParts): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addDays(value: string, days: number): string {
  const parts = parseDateParts(value)
  if (!parts) {
    return value
  }

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return formatDateParts({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  })
}

function addMonths(value: string, months: number): string {
  const parts = parseDateParts(value)
  if (!parts) {
    return value
  }

  const target = new Date(Date.UTC(parts.year, parts.month - 1 + months, 1))
  const year = target.getUTCFullYear()
  const month = target.getUTCMonth() + 1
  const day = Math.min(parts.day, daysInMonth(year, month))

  return formatDateParts({
    year,
    month,
    day,
  })
}

function isValidCustomRepeat(repeat: RepeatConfig): repeat is ValidCustomRepeat {
  return (
    repeat.preset === 'custom' &&
    Number.isInteger(repeat.customEvery) &&
    repeat.customEvery !== undefined &&
    repeat.customEvery > 0 &&
    (repeat.customUnit === 'day' || repeat.customUnit === 'month' || repeat.customUnit === 'year')
  )
}

export function nextRepeatDate(day: string, repeat: RepeatConfig): string {
  if (repeat.preset === 'daily') {
    return addDays(day, 1)
  }
  if (repeat.preset === '2weeks') {
    return addDays(day, 14)
  }
  if (repeat.preset === 'monthly') {
    return addMonths(day, 1)
  }
  if (repeat.preset === 'yearly') {
    return addMonths(day, 12)
  }
  if (!isValidCustomRepeat(repeat)) {
    return day
  }

  if (repeat.customUnit === 'day') {
    return addDays(day, repeat.customEvery)
  }
  if (repeat.customUnit === 'month') {
    return addMonths(day, repeat.customEvery)
  }
  if (repeat.customUnit === 'year') {
    return addMonths(day, repeat.customEvery * 12)
  }
  return day
}

export function hasMaterializedOccurrence(
  transactions: Transaction[],
  sourceId: string,
  occurrenceDate: string,
): boolean {
  return transactions.some(
    (transaction) =>
      transaction.repeatSourceId === sourceId && transaction.repeatOccurrenceDate === occurrenceDate,
  )
}

function shouldProjectRepeat(repeat: RepeatConfig | undefined): repeat is RepeatConfig {
  if (!repeat || repeat.preset === 'never') {
    return false
  }
  if (repeat.preset === 'custom') {
    return isValidCustomRepeat(repeat)
  }
  return true
}

function addOneYear(value: string): string {
  return addMonths(value, 12)
}

export function projectRepeatOccurrences(transactions: Transaction[], now = new Date()): VirtualRepeatOccurrence[] {
  const windowStart = todayString(now)
  const windowEnd = addOneYear(windowStart)
  const occurrences: VirtualRepeatOccurrence[] = []

  for (const source of transactions) {
    if (source.status !== 'planned' && source.status !== 'overdue') {
      continue
    }
    if (!shouldProjectRepeat(source.repeat)) {
      continue
    }

    let occurrenceDate = localDateString(source.date)

    while (occurrenceDate <= windowEnd) {
      const nextDate = nextRepeatDate(occurrenceDate, source.repeat)
      if (nextDate <= occurrenceDate) {
        break
      }
      occurrenceDate = nextDate

      if (occurrenceDate < windowStart || occurrenceDate > windowEnd) {
        continue
      }
      if (hasMaterializedOccurrence(transactions, source.id, occurrenceDate)) {
        continue
      }

      occurrences.push({
        id: `repeat:${source.id}:${occurrenceDate}`,
        sourceId: source.id,
        occurrenceDate,
        transaction: {
          ...source,
          id: `repeat:${source.id}:${occurrenceDate}`,
          date: replaceDate(source.date, occurrenceDate),
        },
      })
    }
  }

  return occurrences.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate))
}

function replaceDate(sourceDate: string, occurrenceDate: string): string {
  const occurrenceParts = parseDateParts(occurrenceDate)
  if (!occurrenceParts || !sourceDate.includes('T')) {
    return occurrenceDate
  }

  const source = new Date(sourceDate)
  if (Number.isNaN(source.getTime())) {
    return occurrenceDate
  }

  return new Date(
    occurrenceParts.year,
    occurrenceParts.month - 1,
    occurrenceParts.day,
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
    source.getMilliseconds(),
  ).toISOString()
}

export function materializeRepeatOccurrence(
  source: Transaction,
  occurrenceDate: string,
  createId: () => string,
  now: string,
): Transaction {
  const transaction = { ...source }
  delete transaction.repeat

  return {
    ...transaction,
    id: createId(),
    date: replaceDate(source.date, occurrenceDate),
    status: 'paid',
    repeatSourceId: source.id,
    repeatOccurrenceDate: occurrenceDate,
    createdAt: now,
  }
}
