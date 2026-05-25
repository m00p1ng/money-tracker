import { Icon } from '@/components'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type CalendarHeaderProps = {
  year: number
  month: number
  onPrev: () => void
  onAdd: () => void
  onSearch: () => void
}

export function CalendarHeader({
  year,
  month,
  onPrev,
  onAdd,
  onSearch,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <button
        type="button"
        aria-label="Previous month"
        onClick={onPrev}
        className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300"
      >
        <Icon name="fa-chevron-left" />
      </button>
      <span className="text-base font-bold text-white">
        {MONTH_NAMES[month]} {year}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          onClick={onSearch}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300"
        >
          <Icon name="fa-magnifying-glass" />
        </button>
        <button
          type="button"
          aria-label="Add transaction"
          onClick={onAdd}
          className="grid h-9 w-9 place-items-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))' }}
        >
          <Icon name="fa-plus" />
        </button>
      </div>
    </div>
  )
}
