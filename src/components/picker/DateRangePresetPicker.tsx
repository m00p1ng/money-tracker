import { useState } from 'react'

import type { DateRangePreset } from '@/lib'

import { BottomSheet } from '../BottomSheet'
import { Button } from '../Button'
import { WheelPicker } from '../WheelPicker'

const PRESETS: Array<{ label: string; value: DateRangePreset }> = [
  { label: 'Last 7 Day', value: 'last-7d' },
  { label: 'Last 30 Day', value: 'last-30d' },
  { label: 'Last 90 Day', value: 'last-90d' },
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
  const [draftPreset, setDraftPreset] = useState<DateRangePreset>(value)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Date Range"
    >
      <div className="mx-4 mt-3">
        <WheelPicker
          columns={[
            {
              name: 'preset',
              options: PRESETS,
            },
          ]}
          value={{ preset: draftPreset }}
          onChange={(next) => setDraftPreset(next.preset as DateRangePreset)}
        />
      </div>

      <div className="mt-4 px-4">
        <Button
          variant="accent"
          fullWidth
          type="button"
          onClick={() => {
            onSelect(draftPreset)
            onClose()
          }}
        >
          Confirm
        </Button>
      </div>
    </BottomSheet>
  )
}
