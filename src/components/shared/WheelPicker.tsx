import { WheelPicker as WheelPickerBase, WheelPickerWrapper } from '@ncdai/react-wheel-picker'

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
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/4">
      <div
        className="grid pt-2"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((col) => (
          <p key={col.name} className="text-center text-[10px] uppercase tracking-[1px] text-white/30">{col.label}</p>
        ))}
      </div>
      <WheelPickerWrapper>
        {columns.map((col) => (
          <WheelPickerBase
            key={col.name}
            value={value[col.name]}
            onValueChange={(v) => onChange({ ...value, [col.name]: String(v) })}
            options={col.options.map((opt) => ({
              value: opt,
              label: col.capitalize
                ? <span className="capitalize">{opt}</span>
                : opt,
            }))}
            optionItemHeight={43}
            visibleCount={12}
            classNames={{
              highlightWrapper: 'bg-(--accent)/15 border-y border-(--accent)/30',
              highlightItem: 'font-bold text-white',
              optionItem: 'text-white/30 font-medium text-[15px]',
            }}
          />
        ))}
      </WheelPickerWrapper>
    </div>
  )
}
