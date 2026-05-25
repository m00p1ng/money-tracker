import { motion } from 'framer-motion'

export type DayIndicator = 'transaction' | 'upcoming' | 'both'

type CalendarGridProps = {
  year: number
  month: number
  today: string
  selectedDate: string | null
  indicatorMap: Record<string, DayIndicator>
  onSelectDate: (date: string | null) => void
  onPrev: () => void
  onNext: () => void
}

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function twoDigit(n: number): string {
  return String(n).padStart(2, '0')
}

function makeDateKey(year: number, month: number, day: number): string {
  return `${year}-${twoDigit(month + 1)}-${twoDigit(day)}`
}

type DayState = 'selected' | 'today' | 'transaction' | 'upcoming' | 'default'

function getDayState(
  dateStr: string,
  selectedDate: string | null,
  today: string,
  indicatorMap: Record<string, DayIndicator>,
): DayState {
  if (dateStr === selectedDate) {
    return 'selected'
  }
  if (dateStr === today) {
    return 'today'
  }
  const indicator = indicatorMap[dateStr]
  if (indicator === 'transaction' || indicator === 'both') {
    return 'transaction'
  }
  if (indicator === 'upcoming') {
    return 'upcoming'
  }

  return 'default'
}

function dayNumClass(state: DayState): string {
  const base = 'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium'
  switch (state) {
    case 'selected':
      return `${base} bg-accent font-bold text-white`
    case 'today':
      return `${base} border-2 border-accent font-bold text-white`
    case 'transaction':
      return `${base} bg-accent/20 text-accent-light`
    case 'upcoming':
      return `${base} bg-amber-500/20 text-amber-400`
    default:
      return `${base} text-slate-400`
  }
}

export function CalendarGrid({
  year,
  month,
  today,
  selectedDate,
  indicatorMap,
  onSelectDate,
  onPrev,
  onNext,
}: CalendarGridProps) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 50) {
          onPrev()
        } else if (info.offset.x < -50) {
          onNext()
        }
      }}
    >
      <div className="mb-1 grid grid-cols-7">
        {DOW_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-xs text-slate-500">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = makeDateKey(year, month, day)
          const state = getDayState(dateStr, selectedDate, today, indicatorMap)

          return (
            <button
              key={dateStr}
              type="button"
              aria-label={`Select ${dateStr}`}
              onClick={() => onSelectDate(dateStr === selectedDate
                ? null
                : dateStr)}
              className="flex flex-col items-center py-0.5"
            >
              <span className={dayNumClass(state)}>{day}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
