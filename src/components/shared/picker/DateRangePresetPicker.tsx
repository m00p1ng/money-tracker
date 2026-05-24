import cx from 'classnames'

import { BottomSheet, Icon } from '@/components'
import type { DateRangePreset } from '@/lib'

const PRESETS: { label: string; value: DateRangePreset }[] = [
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Date Range">
      <div className="px-4 space-y-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              onSelect(p.value)
              onClose()
            }}
            className={cx(
              'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors',
              value === p.value
                ? 'bg-accent/15 text-accent-light'
                : 'text-white/70 hover:bg-white/5',
            )}
          >
            {p.label}
            {value === p.value && <Icon name="fa-circle-check" className="text-accent" />}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
