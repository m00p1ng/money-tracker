import cx from 'classnames'
import Picker from 'react-mobile-picker'

type PickerColumnProps = {
  label: string
  name: string
  options: string[]
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
  capitalize?: boolean
}

export function PickerColumn({
  label,
  name,
  options,
  value,
  onChange,
  capitalize = false,
}: PickerColumnProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/4">
      <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">{label}</p>
      <Picker value={value} onChange={onChange} height={120} itemHeight={40} wheelMode="natural">
        <Picker.Column name={name}>
          {options.map((opt) => (
            <Picker.Item key={opt} value={opt}>
              {({ selected }) => (
                <span
                  className={cx(
                    'text-[15px]',
                    { capitalize },
                    selected ? 'font-bold text-white' : 'font-medium text-white/30',
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
  )
}
