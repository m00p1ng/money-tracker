const headerFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const headerDayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
})

const headerWeekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
})

const headerMonthYearFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
})

const shortFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
})

const rangeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})

export function formatHeaderDate(date: Date): string {
  return headerFormatter.format(date)
}

export function formatHeaderDay(date: Date): string {
  return headerDayFormatter.format(date)
}

export function formatHeaderWeekday(date: Date): string {
  return headerWeekdayFormatter.format(date)
}

export function formatHeaderMonthYear(date: Date): string {
  return headerMonthYearFormatter.format(date)
}

export function formatShortDate(date: Date): string {
  return shortFormatter.format(date)
}

export function isTodayInLocalTime(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate)

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function monthRangeLabel(date = new Date()): string {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  return `${rangeFormatter.format(start)} - ${rangeFormatter.format(end)}`
}

export function toDatetimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

const displayDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDatetimeLocalDisplay(value: string): string {
  const [datePart, timePart] = value.split('T')
  const date = new Date(`${datePart}T00:00:00`)

  return `${displayDateFormatter.format(date)} · ${timePart}`
}

export function isCurrentMonth(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate)

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

export function toLocalDateKey(isoDate: string): string {
  if (!isoDate.includes('T')) {
    return isoDate.slice(0, 10)
  }

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate.slice(0, 10)
  }

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}
