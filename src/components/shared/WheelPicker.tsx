import { WheelPicker as WheelPickerBase } from '@ncdai/react-wheel-picker'

import '@ncdai/react-wheel-picker/style.css'

export type WheelPickerColumn = {
  name: string
  label: string
  options: string[]
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
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
    >
      {columns.map((col) => (
        <div key={col.name} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/4">
          <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">{col.label}</p>
          <WheelPickerBase
            value={value[col.name]}
            onValueChange={(v) => onChange({ ...value, [col.name]: String(v) })}
            options={col.options.map((opt) => ({
              value: opt,
              label: col.capitalize
                ? <span className="capitalize">{opt}</span>
                : opt,
            }))}
            optionItemHeight={40}
            visibleCount={4}
            classNames={{
              highlightWrapper: 'bg-(--accent)/15 border-y border-(--accent)/30',
              highlightItem: 'font-bold text-white',
              optionItem: 'text-white/30 font-medium text-[15px]',
            }}
          />
        </div>
      ))}
    </div>
  )
}
