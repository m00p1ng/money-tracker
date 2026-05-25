import { BottomSheet } from '../../BottomSheet'
import { Button } from '../../Button'
import { WheelPicker } from '../../WheelPicker'

import { useDatePicker } from './useDatePicker'

interface DatePickerProps {
  isOpen: boolean
  title: string
  value: string
  onChange: (date: string) => void
  onClose: () => void
}

export function DatePicker({
  isOpen,
  title,
  value,
  onChange,
  onClose,
}: DatePickerProps) {
  const picker = useDatePicker(value, onChange, onClose)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="mx-4 mt-3">
        <WheelPicker
          columns={picker.columns}
          value={picker.pickerValue}
          onChange={(next) => picker.handleChange({
            day: next.day,
            month: next.month,
            year: next.year,
          })}
        />
      </div>

      <div className="mt-4 px-4">
        <Button
          variant="accent"
          fullWidth
          type="button"
          onClick={picker.handleConfirm}
        >
          Confirm
        </Button>
      </div>
    </BottomSheet>
  )
}
