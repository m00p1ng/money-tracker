import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { BottomSheet, PickerColumn } from '../../components/ui'
import { Button } from '../../components/ui/Button'

type TimeValue = { hour: string; minute: string }

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export function DatePickerSheet({
  isOpen,
  value,
  onChange,
  onClose,
}: {
  isOpen: boolean
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}) {
  const [selectedDay, setSelectedDay] = useState<Date>(value)
  const [pickerValue, setPickerValue] = useState<TimeValue>({
    hour: String(value.getHours()).padStart(2, '0'),
    minute: String(value.getMinutes()).padStart(2, '0'),
  })

  function handleConfirm() {
    const result = new Date(selectedDay)
    result.setHours(Number(pickerValue.hour), Number(pickerValue.minute), 0, 0)
    onChange(result)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Date & Time">
      {/* Calendar */}
      <div className="flex justify-center px-4">
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={(day) => { if (day) setSelectedDay(day) }}
          classNames={{
            root: 'rdp-custom',
            months: 'flex flex-col',
            month: 'space-y-2',
            month_caption: 'flex justify-center items-center gap-2 py-1',
            caption_label: 'text-sm font-semibold text-white',
            nav: 'flex items-center gap-1',
            button_next: 'h-7 w-7 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1]',
            button_previous: 'h-7 w-7 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1]',
            month_grid: 'w-full',
            weekdays: 'flex justify-around',
            weekday: 'text-[11px] font-semibold text-white/30 w-8 text-center',
            week: 'flex justify-around mt-1',
            day: 'text-center w-8',
            day_button: 'h-8 w-8 rounded-lg text-sm font-medium text-white/70 hover:bg-white/[0.07] flex items-center justify-center',
            selected: 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]',
            today: 'font-bold text-white',
            outside: 'text-white/20',
          }}
        />
      </div>

      {/* Time picker wheels */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-2.5">
        <PickerColumn label="Hour" name="hour" options={HOUR_OPTIONS} value={pickerValue} onChange={(v) => setPickerValue(v as TimeValue)} />
        <PickerColumn label="Minute" name="minute" options={MINUTE_OPTIONS} value={pickerValue} onChange={(v) => setPickerValue(v as TimeValue)} />
      </div>

      {/* Confirm */}
      <div className="px-4 mt-4">
        <Button variant="accent" fullWidth type="button" onClick={handleConfirm}>Confirm</Button>
      </div>
    </BottomSheet>
  )
}
