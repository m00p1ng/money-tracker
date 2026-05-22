export type DateRange = {
  start: string
  end: string
}

export type DateRangePreset = 'last-7d' | 'last-30d' | 'this-month' | 'last-month' | 'this-year' | 'last-year'

function toDateOnly(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function dateOnly(value: string | Date): string {
  return toDateOnly(value instanceof Date ? value : new Date(value))
}

export function getPresetRange(preset: DateRangePreset, now = new Date()): DateRange {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()

  if (preset === 'last-7d') return { start: toDateOnly(addDays(now, -6)), end: toDateOnly(now) }
  if (preset === 'last-30d') return { start: toDateOnly(addDays(now, -29)), end: toDateOnly(now) }
  if (preset === 'this-month') return { start: toDateOnly(new Date(Date.UTC(year, month, 1))), end: toDateOnly(new Date(Date.UTC(year, month + 1, 0))) }
  if (preset === 'last-month') return { start: toDateOnly(new Date(Date.UTC(year, month - 1, 1))), end: toDateOnly(new Date(Date.UTC(year, month, 0))) }
  if (preset === 'this-year') return { start: `${year}-01-01`, end: `${year}-12-31` }
  return { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` }
}

export function isWithinDateRange(value: string, range: DateRange): boolean {
  const day = dateOnly(value)
  return day >= range.start && day <= range.end
}
