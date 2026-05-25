import { BottomSheet } from '../../BottomSheet'
import { Button } from '../../Button'
import { WheelPicker } from '../../WheelPicker'

import { useDateOnlyPicker } from './useDateOnlyPicker'

interface DateOnlyPickerProps {
  isOpen: boolean
  title: string
  value: string
  onChange: (date: string) => void
  onClose: () => void
}

export function DateOnlyPicker({
  isOpen,
  title,
  value,
  onChange,
  onClose,
}: DateOnlyPickerProps) {
  const picker = useDateOnlyPicker(value, onChange, onClose)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="mx-4 mt-3">
        <WheelPicker
          columns={picker.columns}
          value={{ date: picker.pickerValue }}
          onChange={(next) => picker.handleChange(next.date)}
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
