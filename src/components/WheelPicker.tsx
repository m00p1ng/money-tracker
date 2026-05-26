import { WheelPicker as WheelPickerBase, WheelPickerWrapper } from '@ncdai/react-wheel-picker'
import type { ReactNode } from 'react'

import '@ncdai/react-wheel-picker/style.css'

type WheelPickerOption = string | {
  value: string
  label: ReactNode
}

export type WheelPickerColumn = {
  name: string
  label: string
  options: WheelPickerOption[]
  capitalize?: boolean
}

type WheelPickerProps = {
  columns: WheelPickerColumn[]
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
}

export function WheelPicker({
  columns, value, onChange,
}: WheelPickerProps) {
  return (
    <div className="overflow-hidden">
      <div
        className="grid pt-2"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((col) => (
          <p key={col.name} className="text-center text-xs uppercase tracking-[1px] text-white/30">{col.label}</p>
        ))}
      </div>
      <WheelPickerWrapper>
        {columns.map((col) => (
          <WheelPickerBase
            key={col.name}
            value={value[col.name]}
            onValueChange={(v) => onChange({ ...value, [col.name]: String(v) })}
            options={col.options.map((opt) => {
              const option = typeof opt === 'string'
                ? { value: opt, label: opt }
                : opt

              return {
                value: option.value,
                label: col.capitalize
                  ? <span className="capitalize">{option.label}</span>
                  : option.label,
              }
            })}
            optionItemHeight={43}
            visibleCount={12}
            classNames={{
              highlightWrapper: 'bg-(--accent)/15 border-y border-(--accent)/30',
              highlightItem: 'font-bold text-white',
              optionItem: 'text-white/30 font-medium text-sm',
            }}
          />
        ))}
      </WheelPickerWrapper>
    </div>
  )
}
