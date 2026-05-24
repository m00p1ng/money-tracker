import { DatePicker } from './DatePicker'
import { useDatePicker } from './useDatePicker'

interface DatePickerContainerProps {
  isOpen: boolean
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}

export function DatePickerContainer({
  isOpen,
  value,
  onChange,
  onClose,
}: DatePickerContainerProps) {
  const datePicker = useDatePicker(value, onChange, onClose)

  return (
    <DatePicker
      isOpen={isOpen}
      onClose={onClose}
      datePicker={datePicker}
    />
  )
}
