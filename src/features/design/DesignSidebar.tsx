import cx from 'classnames'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'

import { Icon } from '@/components'

export const NAV_GROUPS = [
  {
    slug: 'tokens',
    label: 'Tokens',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
    ],
  },
  {
    slug: 'ui-components',
    label: 'UI Components',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'card', label: 'Card' },
      { id: 'field', label: 'Field' },
      { id: 'segmented-control', label: 'SegmentedControl' },
      { id: 'type-picker', label: 'TypePickerDropdown' },
      { id: 'currency-picker', label: 'CurrencyPicker' },
      { id: 'date-picker', label: 'DatePicker' },
      { id: 'repeat-picker', label: 'RepeatPicker' },
      { id: 'wallet-picker', label: 'WalletPicker' },
      { id: 'date-range-preset-picker', label: 'DateRangePresetPicker' },
      { id: 'switch', label: 'Switch' },
      { id: 'textarea-input', label: 'TextAreaInput' },
      { id: 'form-actions', label: 'FormActions' },
    ],
  },
  {
    slug: 'shared-components',
    label: 'Shared Components',
    items: [
      { id: 'background', label: 'Background' },
      { id: 'section-label', label: 'SectionLabel' },
      { id: 'section-divider', label: 'SectionDivider' },
      { id: 'form-error-message', label: 'FormErrorMessage' },
      { id: 'page-header', label: 'PageHeader' },
      { id: 'animated-bar', label: 'AnimatedBar' },
      { id: 'transaction-row', label: 'TransactionRow' },
      { id: 'list-group', label: 'ListGroup + ListRow' },
      { id: 'add-row', label: 'AddRow' },
      { id: 'wheel-picker', label: 'WheelPicker' },
      { id: 'bottom-sheet', label: 'BottomSheet' },
      { id: 'selector-sheet', label: 'SelectorSheet' },
    ],
  },
  {
    slug: 'feature-home',
    label: 'Feature — Home',
    items: [
      { id: 'home-title', label: 'HomeTitle' },
      { id: 'summary-cards', label: 'SummaryCards' },
      { id: 'today-transactions', label: 'TodayTransactions' },
      { id: 'upcoming-transactions', label: 'UpcomingTransactions' },
    ],
  },
  {
    slug: 'feature-balance',
    label: 'Feature — Balance',
    items: [
      { id: 'wallet-row', label: 'WalletRow' },
      { id: 'swipeable-transaction-row', label: 'SwipeableTransactionRow' },
      { id: 'date-range-header', label: 'DateRangeHeader' },
      { id: 'credit-card-stats', label: 'CreditCardStats' },
      { id: 'wallet-stats', label: 'WalletStats' },
      { id: 'balance-transaction-row', label: 'TransactionRow' },
    ],
  },
  {
    slug: 'feature-transaction',
    label: 'Feature — Transaction',
    items: [
      { id: 'calculator-keyboard', label: 'CalculatorKeyboard' },
      { id: 'category-items-card', label: 'CategoryItemsCard' },
      { id: 'transaction-header', label: 'TransactionHeader' },
      { id: 'date-time-row', label: 'DateTimeRow' },
      { id: 'wallet-selector-row', label: 'WalletSelectorRow' },
      { id: 'note-field', label: 'NoteField' },
      { id: 'exchange-rate-row', label: 'ExchangeRateRow' },
      { id: 'reconciliation-row', label: 'ReconciliationRow' },
      { id: 'repeat-row', label: 'RepeatRow' },
      { id: 'calculator-keyboard-sheet', label: 'CalculatorKeyboardSheet' },
      { id: 'transaction-sheets', label: 'TransactionSheets' },
    ],
  },
  {
    slug: 'feature-calendar',
    label: 'Feature — Calendar',
    items: [
      { id: 'calendar-page', label: 'CalendarPage' },
    ],
  },
  {
    slug: 'feature-settings',
    label: 'Feature — Settings',
    items: [
      { id: 'currency-row', label: 'CurrencyRow' },
    ],
  },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Horizontal pill bar — shown on small screens only */
interface DesignTopNavProps {
  activeId: string
  section: string
}

export function DesignTopNav({ activeId, section }: DesignTopNavProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const group = NAV_GROUPS.find((g) => g.slug === section) ?? NAV_GROUPS[0]

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
        {group.items.map((item) => (
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
  const navigate = useNavigate()
  const { section } = useParams<{ section: string }>()
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const visibleGroups = normalizedSearch
    ? NAV_GROUPS.map((group) => {
      const groupMatches = group.label.toLowerCase().includes(normalizedSearch)

      return {
        ...group,
        items: groupMatches
          ? group.items
          : group.items.filter((item) => item.label.toLowerCase().includes(normalizedSearch)),
      }
    }).filter((group) => group.items.length > 0)
    : NAV_GROUPS

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [activeId])

  function handleItemClick(groupSlug: string, itemId: string) {
    if (groupSlug === section) {
      scrollTo(itemId)
    } else {
      navigate(`/design/${groupSlug}`)
    }
    setSearch('')
  }

  return (
    <nav className={[
      'hidden w-72 shrink-0 flex-col gap-1 overflow-y-auto',
      'border-r border-white/8 bg-white/2 px-3 py-4 md:flex',
    ].join(' ')}>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[2px] text-white/30">Design System</p>
      <div className="relative mb-2">
        <Icon
          name="fa-magnifying-glass"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/25"
        />
        <input
          aria-label="Search design sections"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search sections"
          className={[
            'h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.04]',
            'pl-8 pr-3 text-[13px] text-white/80 outline-none transition-colors',
            'placeholder:text-white/25 focus:border-accent/35 focus:bg-white/[0.06]',
          ].join(' ')}
        />
      </div>
      {visibleGroups.length > 0
        ? visibleGroups.map((group) => (
          <div key={group.label} className="mt-4 first:mt-0">
            <button
              type="button"
              onClick={() => navigate(`/design/${group.slug}`)}
              className={cx(
                'mb-1 w-full px-3 pb-1 text-left text-[10px] font-semibold uppercase tracking-[1px] transition-colors',
                section === group.slug ? 'text-white/50' : 'text-white/25 hover:text-white/40',
              )}
            >
              {group.label}
            </button>
            {group.items.map((item) => (
              <button
                key={item.id}
                ref={item.id === activeId ? activeRef : null}
                type="button"
                onClick={() => handleItemClick(group.slug, item.id)}
                className={cx(
                  'w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors',
                  item.id === activeId && section === group.slug
                    ? 'bg-accent/10 font-semibold text-accent-light'
                    : 'text-white/50 hover:text-white/80',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))
        : (
          <p className="px-3 py-4 text-sm text-white/35">No matches</p>
        )}
    </nav>
  )
}
