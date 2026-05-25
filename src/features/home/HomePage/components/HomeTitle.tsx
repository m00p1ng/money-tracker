import { Icon } from '@/components'
import {
  formatHeaderDay,
  formatHeaderMonthYear,
  formatHeaderWeekday,
} from '@/lib'

type HomeTitleProps = {
  onAddTransaction: () => void
  onNavigateToCalendar: () => void
}

export function HomeTitle({ onAddTransaction, onNavigateToCalendar }: HomeTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onNavigateToCalendar}
        className="grid grid-cols-[auto_1px_auto] items-center gap-x-3"
        aria-label="Open calendar"
      >
        <span
          className="row-span-2 bg-linear-to-r from-white to-white/75 bg-clip-text text-5xl font-bold text-transparent"
        >
          {formatHeaderDay(new Date())}
        </span>
        <div className="row-span-2 self-stretch bg-white/30" />
        <span className="text-sm font-medium text-white text-left">{formatHeaderWeekday(new Date())}</span>
        <span className="text-sm font-medium text-white text-left">{formatHeaderMonthYear(new Date())}</span>
      </button>
      <button
        aria-label="Add transaction"
        onClick={onAddTransaction}
        className="grid h-11 w-11 place-items-center rounded-xl text-white"
        style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))' }}
        type="button"
      >
        <Icon name="fa-plus" />
      </button>
    </div>
  )
}
