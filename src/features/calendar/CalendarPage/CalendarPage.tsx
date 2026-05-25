import { Icon, PageHeader, SectionLabel, TransactionRow } from '@/components'

import { CalendarGrid } from './components/CalendarGrid'
import type { DayIndicator } from './components/CalendarGrid/CalendarGrid'
import type { CalendarRowData } from './useCalendarPage'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type CalendarPageProps = {
  currentYear: number
  currentMonth: number
  today: string
  selectedDate: string | null
  indicatorMap: Record<string, DayIndicator>
  listRows: CalendarRowData[]
  listHeader: string
  onSelectDate: (date: string | null) => void
  onPrev: () => void
  onNext: () => void
  onAdd: () => void
  onBack: () => void
  onSearch: () => void
}

export function CalendarPage({
  currentYear,
  currentMonth,
  today,
  selectedDate,
  indicatorMap,
  listRows,
  listHeader,
  onSelectDate,
  onPrev,
  onNext,
  onAdd,
  onBack,
  onSearch,
}: CalendarPageProps) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 space-y-1 bg-transparent px-4 pt-4 pb-2 backdrop-blur">
        <PageHeader
          title={`${MONTH_NAMES[currentMonth]} ${currentYear}`}
          onBack={onBack}
          rightSlot={(
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
          )}
        />
        <CalendarGrid
          year={currentYear}
          month={currentMonth}
          today={today}
          selectedDate={selectedDate}
          indicatorMap={indicatorMap}
          onSelectDate={onSelectDate}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
      <div className="space-y-2 px-4 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <SectionLabel>{listHeader}</SectionLabel>
          {listRows.length > 0 && (
            <span className="text-xs text-slate-500">{listRows.length}</span>
          )}
        </div>
        {listRows.length === 0
          ? <p className="py-8 text-center text-sm text-slate-500">No transactions</p>
          : (
            <div className="space-y-2">
              {listRows.map((row) => (
                <TransactionRow
                  key={row.key}
                  to={row.to}
                  icon={row.icon}
                  iconBg={row.iconBg}
                  iconColor={row.iconColor}
                  primaryLabel={row.primaryLabel}
                  secondaryLabel={row.secondaryLabel}
                  amount={row.amount}
                  amountColor={row.amountColor}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
