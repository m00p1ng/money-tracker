import { DateTimePicker } from './DateTimePicker'
import { useDateTimePicker } from './useTimeDatePicker'

interface DateTimePickerContainerProps {
  isOpen: boolean
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}

export function DateTimePickerContainer({
  isOpen,
  value,
  onChange,
  onClose,
}: DateTimePickerContainerProps) {
  const datePicker = useDateTimePicker(value, onChange, onClose)

  return (
    <DateTimePicker
      isOpen={isOpen}
      onClose={onClose}
      datePicker={datePicker}
    />
  )
}
