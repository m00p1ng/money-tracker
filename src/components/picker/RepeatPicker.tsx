import cx from 'classnames'
import { useState } from 'react'

import {
  BottomSheet,
  Button,
  Icon,
  WheelPicker,
} from '@/components'
import type { RepeatConfig, RepeatPreset } from '@/types/domain'

const PRESETS: Array<{ label: string; value: RepeatPreset }> = [
  { label: 'Never', value: 'never' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Every 2 Weeks', value: '2weeks' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
]

const EVERY_OPTIONS = Array.from({ length: 30 }, (_, i) => String(i + 1))

const CUSTOM_COLUMNS = [
  {
    name: 'every',
    label: 'Every',
    options: EVERY_OPTIONS,
  },
  {
    name: 'unit',
    label: 'Unit',
    options: ['day', 'week', 'month', 'year'],
    capitalize: true,
  },
]

interface RepeatPickerProps {
  isOpen: boolean
  value: RepeatConfig
  onConfirm: (config: RepeatConfig) => void
  onClose: () => void
}

export function RepeatPicker({
  isOpen,
  value,
  onConfirm,
  onClose,
}: RepeatPickerProps) {
  const [showCustom, setShowCustom] = useState(value.preset === 'custom')
  const [customValue, setCustomValue] = useState<Record<string, string>>({
    every: String(value.customEvery ?? 1),
    unit: value.customUnit ?? 'month',
  })

  function handleSelect(preset: RepeatPreset) {
    if (preset === 'custom') {
      setShowCustom(true)

      return
    }
    onConfirm({ preset })
    onClose()
  }

  function handleConfirmCustom() {
    onConfirm({
      preset: 'custom',
      customEvery: Number(customValue.every),
      customUnit: customValue.unit as 'day' | 'month' | 'year',
    })
    setShowCustom(false)
    onClose()
  }

  function handleClose() {
    setShowCustom(false)
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={showCustom
        ? 'Custom Repeat'
        : 'Repeat'}
    >
      {showCustom
        ? (
          <>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="flex items-center gap-1.5 px-5 pb-1 text-sm text-white/50 hover:text-white/80"
            >
              <Icon name="fa-chevron-left" className="text-xs" />
              Back
            </button>
            <div className="mx-4 mt-1">
              <WheelPicker
                columns={CUSTOM_COLUMNS}
                value={customValue}
                onChange={setCustomValue}
              />
            </div>
            <div className="mt-4 px-4">
              <Button variant="accent" fullWidth type="button" onClick={handleConfirmCustom}>
                Confirm
              </Button>
            </div>
          </>
        )
        : (
          <div className="space-y-1.5 px-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelect(preset.value)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors',
                  value.preset === preset.value
                    ? 'border border-(--accent)/30 bg-(--accent)/12 font-bold text-(--accent-light)'
                    : 'text-white/70 hover:bg-white/5',
                )}
              >
                <span className="min-w-0 flex-1 text-left">{preset.label}</span>
                {value.preset === preset.value && (
                  <Icon name="fa-circle-check" className="text-(--accent-light)" />
                )}
              </button>
            ))}
          </div>
        )}
    </BottomSheet>
  )
}
