import type { RepeatConfig, RepeatPreset } from '@/types/domain'

import { SelectorSheet, type SelectorOption } from './SelectorSheet'

const PRESETS: SelectorOption<RepeatPreset>[] = [
  { label: 'Never', value: 'never' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Every 2 Weeks', value: '2weeks' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
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
  function buildConfig(preset: RepeatPreset): RepeatConfig {
    if (preset === 'custom') {
      const customUnit = value.customUnit ?? 'month'

      return {
        preset: 'custom',
        customEvery: value.customEvery ?? 1,
        customUnit,
      }
    }

    return { preset }
  }

  return (
    <SelectorSheet
      isOpen={isOpen}
      title="Repeat"
      options={PRESETS}
      value={value.preset}
      onSelect={(preset) => {
        onConfirm(buildConfig(preset))
        onClose()
      }}
      onClose={onClose}
    />
  )
}
