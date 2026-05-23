import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Picker from 'react-mobile-picker'
import { Icon } from '../../components/Icon'
import type { RepeatConfig, RepeatPreset } from '../../types/domain'

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

export function RepeatPicker({
  value,
  onConfirm,
  onClose,
}: {
  value: RepeatConfig
  onConfirm: (config: RepeatConfig) => void
  onClose: () => void
}) {
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
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        key="sheet"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/[0.08] bg-[#131320] pb-7"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" />
        <h3 className="px-5 pb-2.5 pt-3.5 text-center text-[15px] font-bold">Repeat</h3>
        <div className="mx-5 mb-2.5 h-px bg-white/[0.06]" />
        <div className="space-y-1.5 px-4">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 ${preset === p.value ? 'border border-[var(--accent)]/30 bg-[var(--accent)]/[0.12]' : ''}`}
              onClick={() => setPreset(p.value)}
              type="button"
            >
              <span className={`text-sm ${preset === p.value ? 'font-bold text-[var(--accent-light)]' : 'font-medium'}`}>{p.label}</span>
              {preset === p.value && <Icon name="fa-circle-check" className="text-[var(--accent-light)]" />}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 px-4">
            <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
              <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">Every</p>
              <Picker value={pickerValue} onChange={setPickerValue} height={120} itemHeight={40} wheelMode="natural">
                <Picker.Column name="every">
                  {EVERY_OPTIONS.map((opt) => (
                    <Picker.Item key={opt} value={opt}>
                      {({ selected }) => (
                        <span className={`text-[15px] ${selected ? 'font-bold text-white' : 'font-medium text-white/30'}`}>{opt}</span>
                      )}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              </Picker>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
              <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">Unit</p>
              <Picker value={pickerValue} onChange={setPickerValue} height={120} itemHeight={40} wheelMode="natural">
                <Picker.Column name="unit">
                  {UNIT_OPTIONS.map((opt) => (
                    <Picker.Item key={opt} value={opt}>
                      {({ selected }) => (
                        <span className={`capitalize text-[15px] ${selected ? 'font-bold text-white' : 'font-medium text-white/30'}`}>{opt}</span>
                      )}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              </Picker>
            </div>
          </div>
        )}
        <button
          className="mx-4 mt-3 w-[calc(100%-2rem)] rounded-2xl py-3.5 text-center text-[15px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
          onClick={handleConfirm}
          type="button"
        >
          Confirm
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
