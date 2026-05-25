import { PageHeader, SectionLabel, TransactionRow } from '@/components'

import { CalendarGrid } from './components/CalendarGrid'
import type { DayIndicator } from './components/CalendarGrid/CalendarGrid'
import { CalendarHeader } from './components/CalendarHeader'
import type { CalendarRowData } from './useCalendarPage'

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
        <PageHeader title="Calendar" onBack={onBack} />
        <CalendarHeader
          year={currentYear}
          month={currentMonth}
          onPrev={onPrev}
          onAdd={onAdd}
          onSearch={onSearch}
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
        {listRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No transactions</p>
        ) : (
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
