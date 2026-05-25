import { BottomSheet } from '../../BottomSheet'
import { Button } from '../../Button'
import { WheelPicker } from '../../WheelPicker'

import type { useDateTimePicker } from './useTimeDatePicker'

type DatePickerProps = {
  isOpen: boolean
  onClose: () => void
  datePicker: ReturnType<typeof useDateTimePicker>
}

export function DateTimePicker({
  isOpen,
  onClose,
  datePicker,
}: DatePickerProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Date & Time"
    >
      <div className="mx-4 mt-3">
        <WheelPicker
          columns={datePicker.columns}
          value={datePicker.pickerValue}
          onChange={datePicker.handleChange}
        />
      </div>

      <div className="px-4 mt-4">
        <Button
          variant="accent"
          fullWidth
          type="button"
          onClick={datePicker.handleConfirm}
        >Confirm</Button>
      </div>
    </BottomSheet>
  )
}
