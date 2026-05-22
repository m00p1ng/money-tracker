const headerFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
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
