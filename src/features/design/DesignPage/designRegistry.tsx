import type React from 'react'

import { BalanceFeatSection } from './components/features/BalanceFeatSection'
import { CalendarFeatSection } from './components/features/CalendarFeatSection'
import { HomeFeatSection } from './components/features/HomeFeatSection'
import { SettingsFeatSection } from './components/features/SettingsFeatSection'
import { TransactionFeatSection } from './components/features/TransactionFeatSection'
import { ComponentsSection } from './components/ComponentsSection'
import { TokensSection } from './components/TokensSection'

export type DesignNavItem = {
  id: string
  label: string
}

export type DesignGroup = {
  slug: string
  label: string
  component: React.ComponentType
  items: readonly DesignNavItem[]
}

export const DESIGN_GROUPS = [
  {
    slug: 'tokens',
    label: 'Tokens',
    component: TokensSection,
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
    ],
  },
  {
    slug: 'components',
    label: 'Components',
    component: ComponentsSection,
    items: [
      { id: 'button', label: 'Button' },
      { id: 'card', label: 'Card' },
      { id: 'field', label: 'Field' },
      { id: 'segmented-control', label: 'SegmentedControl' },
      { id: 'type-picker', label: 'TypePickerDropdown' },
      { id: 'currency-picker', label: 'CurrencyPicker' },
      { id: 'date-time-picker', label: 'DateTimePicker' },
      { id: 'repeat-picker', label: 'RepeatPicker' },
      { id: 'wallet-picker', label: 'WalletPicker' },
      { id: 'date-range-preset-picker', label: 'DateRangePresetPicker' },
      { id: 'switch', label: 'Switch' },
      { id: 'textarea-input', label: 'TextAreaInput' },
      { id: 'form-actions', label: 'FormActions' },
      { id: 'background', label: 'Background' },
      { id: 'section-label', label: 'SectionLabel' },
      { id: 'form-error-message', label: 'FormErrorMessage' },
      { id: 'page-header', label: 'PageHeader' },
      { id: 'animated-bar', label: 'AnimatedBar' },
      { id: 'transaction-row', label: 'TransactionRow' },
      { id: 'list-group', label: 'ListGroup + ListRow' },
      { id: 'add-row', label: 'AddRow' },
      { id: 'wheel-picker', label: 'WheelPicker' },
      { id: 'bottom-sheet', label: 'BottomSheet' },
      { id: 'icon-picker', label: 'IconPicker' },
      { id: 'selector-sheet', label: 'SelectorSheet' },
    ],
  },
  {
    slug: 'feature-home',
    label: 'Feature — Home',
    component: HomeFeatSection,
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
    component: BalanceFeatSection,
    items: [
      { id: 'wallet-summary-card', label: 'WalletSummaryCard' },
      { id: 'swipeable-transaction-row', label: 'SwipeableTransactionRow' },
      { id: 'date-range-header', label: 'DateRangeHeader' },
    ],
  },
  {
    slug: 'feature-transaction',
    label: 'Feature — Transaction',
    component: TransactionFeatSection,
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
    ],
  },
  {
    slug: 'feature-calendar',
    label: 'Feature — Calendar',
    component: CalendarFeatSection,
    items: [
      { id: 'calendar-grid', label: 'CalendarGrid' },
    ],
  },
  {
    slug: 'feature-settings',
    label: 'Feature — Settings',
    component: SettingsFeatSection,
    items: [
      { id: 'currency-row', label: 'CurrencyRow' },
    ],
  },
] as const satisfies readonly DesignGroup[]

export function getDesignGroup(slug: string): DesignGroup | undefined {
  return DESIGN_GROUPS.find((group) => group.slug === slug)
}
