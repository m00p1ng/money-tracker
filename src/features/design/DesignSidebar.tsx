import cx from 'classnames'
import { useEffect, useRef } from 'react'

const NAV_GROUPS = [
  {
    label: 'Tokens',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
    ],
  },
  {
    label: 'UI Components',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'card', label: 'Card' },
      { id: 'field', label: 'Field' },
      { id: 'segmented-control', label: 'SegmentedControl' },
      { id: 'type-picker', label: 'TypePickerDropdown' },
      { id: 'currency-picker', label: 'CurrencyPicker' },
      { id: 'date-picker', label: 'DatePickerSheet' },
      { id: 'repeat-picker', label: 'RepeatPicker' },
      { id: 'wallet-picker', label: 'WalletPicker' },
      { id: 'date-range-preset-picker', label: 'DateRangePresetPicker' },
    ],
  },
  {
    label: 'Shared Components',
    items: [
      { id: 'section-label', label: 'SectionLabel' },
      { id: 'section-divider', label: 'SectionDivider' },
      { id: 'form-error-message', label: 'FormErrorMessage' },
      { id: 'page-header', label: 'PageHeader' },
      { id: 'animated-bar', label: 'AnimatedBar' },
      { id: 'transaction-row', label: 'TransactionRow' },
      { id: 'list-group', label: 'ListGroup + ListRow' },
      { id: 'add-row', label: 'AddRow' },
      { id: 'picker-column', label: 'PickerColumn' },
      { id: 'bottom-sheet', label: 'BottomSheet' },
    ],
  },
  {
    label: 'Feature — Home',
    items: [
      { id: 'summary-cards', label: 'SummaryCards' },
      { id: 'today-transactions', label: 'TodayTransactions' },
      { id: 'upcoming-transactions', label: 'UpcomingTransactions' },
    ],
  },
  {
    label: 'Feature — Balance',
    items: [
      { id: 'wallet-row', label: 'WalletRow' },
      { id: 'swipeable-transaction-row', label: 'SwipeableTransactionRow' },
    ],
  },
  {
    label: 'Feature — Transaction',
    items: [
      { id: 'calculator-keyboard', label: 'CalculatorKeyboard' },
      { id: 'category-items-card', label: 'CategoryItemsCard' },
    ],
  },
  {
    label: 'Feature — Settings',
    items: [
      { id: 'currency-row', label: 'CurrencyRow' },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Horizontal pill bar — shown on small screens only */
interface DesignTopNavProps {
  activeId: string
}

export function DesignTopNav({ activeId }: DesignTopNavProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeId])

  return (
    <div className="flex overflow-x-auto border-b border-white/8 bg-white/2 px-3 py-2 md:hidden">
      <div className="flex gap-1.5">
        {ALL_ITEMS.map((item) => (
          <button
            key={item.id}
            ref={item.id === activeId ? activeRef : null}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={cx(
              'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors',
              activeId === item.id
                ? 'bg-accent/20 text-accent-light'
                : 'text-white/40 hover:text-white/70',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Vertical sidebar — shown on md+ screens only */
interface DesignSidebarProps {
  activeId: string
}

export function DesignSidebar({ activeId }: DesignSidebarProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [activeId])

  return (
    <nav className={[
      'hidden w-72 shrink-0 flex-col gap-1 overflow-y-auto',
      'border-r border-white/8 bg-white/2 px-3 py-4 md:flex',
    ].join(' ')}>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[2px] text-white/30">Design System</p>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mt-4 first:mt-0">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[1px] text-white/25">
            {group.label}
          </p>
          {group.items.map((item) => (
            <button
              key={item.id}
              ref={item.id === activeId ? activeRef : null}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={cx(
                'w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors',
                activeId === item.id
                  ? 'bg-accent/10 font-semibold text-accent-light'
                  : 'text-white/50 hover:text-white/80',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
