import cx from 'classnames'
import { useState } from 'react'

import { Icon, BottomSheet, PickerColumn  } from '@/components'
import { Button } from '@/components/ui'
import type { RepeatConfig, RepeatPreset } from '@/types/domain'

const PRESETS: { label: string; value: RepeatPreset }[] = [
  { label: 'Never', value: 'never' },
  { label: 'Daily', value: 'daily' },
  { label: 'Every 2 Weeks', value: '2weeks' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
]

const EVERY_OPTIONS = Array.from({ length: 365 }, (_, i) => String(i + 1))
const UNIT_OPTIONS = ['day', 'month', 'year']

type PickerValue = { every: string; unit: string }

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
  const [preset, setPreset] = useState<RepeatPreset>(value.preset)
  const [pickerValue, setPickerValue] = useState<PickerValue>({
    every: String(value.customEvery ?? 1),
    unit: value.customUnit ?? 'month',
  })

  function handleConfirm() {
    if (preset === 'custom') {
      onConfirm({ preset: 'custom', customEvery: Number(pickerValue.every), customUnit: pickerValue.unit as 'day' | 'month' | 'year' })
    } else {
      onConfirm({ preset })
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Repeat">
      <div className="space-y-1.5 px-4">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            className={cx('flex w-full items-center justify-between rounded-xl px-3.5 py-3', { 'border border-[var(--accent)]/30 bg-[var(--accent)]/[0.12]': preset === p.value })}
            onClick={() => setPreset(p.value)}
            type="button"
          >
            <span className={cx('text-sm', preset === p.value ? 'font-bold text-[var(--accent-light)]' : 'font-medium')}>{p.label}</span>
            {preset === p.value && <Icon name="fa-circle-check" className="text-[var(--accent-light)]" />}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 px-4">
          <PickerColumn label="Every" name="every" options={EVERY_OPTIONS} value={pickerValue} onChange={(v) => setPickerValue(v as PickerValue)} />
          <PickerColumn label="Unit" name="unit" options={UNIT_OPTIONS} value={pickerValue} onChange={(v) => setPickerValue(v as PickerValue)} capitalize />
        </div>
      )}
      <div className="px-4 mt-3">
        <Button variant="accent" fullWidth type="button" onClick={handleConfirm}>Confirm</Button>
      </div>
    </BottomSheet>
  )
}
