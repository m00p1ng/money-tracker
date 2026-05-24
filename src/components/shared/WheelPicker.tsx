import cx from 'classnames'
import Picker from 'react-mobile-picker'

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
          <Picker value={value} onChange={onChange} height={120} itemHeight={40} wheelMode="natural">
            <Picker.Column name={col.name}>
              {col.options.map((opt) => (
                <Picker.Item key={opt} value={opt}>
                  {({ selected }) => (
                    <span
                      className={cx(
                        'text-[15px]',
                        { capitalize: col.capitalize },
                        selected
                          ? 'font-bold text-white'
                          : 'font-medium text-white/30',
                      )}
                    >
                      {opt}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
        </div>
      ))}
    </div>
  )
}
