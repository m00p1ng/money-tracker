import type { DateRangePreset } from '@/lib'

import { SelectorSheet, type SelectorOption } from './SelectorSheet'

const PRESETS: SelectorOption<DateRangePreset>[] = [
  { label: 'Last 7d', value: 'last-7d' },
  { label: 'Last 30d', value: 'last-30d' },
  { label: 'Last 90d', value: 'last-90d' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
]

interface DateRangePresetPickerProps {
  isOpen: boolean
  value: DateRangePreset
  onSelect: (preset: DateRangePreset) => void
  onClose: () => void
}

export function DateRangePresetPicker({
  isOpen,
  value,
  onSelect,
  onClose,
}: DateRangePresetPickerProps) {
  return (
    <SelectorSheet
      isOpen={isOpen}
      title="Date Range"
      options={PRESETS}
      value={value}
      onSelect={(preset) => {
        onSelect(preset)
        onClose()
      }}
      onClose={onClose}
    />
  )
}
