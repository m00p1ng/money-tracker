import { useMemo, useState } from 'react'

type DateTimeValue = {
  date: string
  hour: string
  minute: string
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 24 * 60 * 60 * 1000

export function useDatePicker(
  value: Date,
  onChange: (date: Date) => void,
  onClose: () => void,
) {
  const todayKey = toDateKey(new Date())
  const dateOptions = useMemo(() => createDateOptions(new Date()), [])
  const [pickerValue, setPickerValue] = useState<DateTimeValue>(() => createPickerValue(value, dateOptions, todayKey))

  const columns = useMemo(() => [
    {
      name: 'date',
      label: 'Date',
      options: dateOptions,
    },
    {
      name: 'hour',
      label: 'Hour',
      options: HOUR_OPTIONS,
    },
    {
      name: 'minute',
      label: 'Minute',
      options: MINUTE_OPTIONS,
    },
  ], [dateOptions])

  function handleChange(nextValue: Record<string, string>) {
    setPickerValue(nextValue as DateTimeValue)
  }

  function handleConfirm() {
    const result = dateFromKey(pickerValue.date)
    result.setHours(Number(pickerValue.hour), Number(pickerValue.minute), 0, 0)
    onChange(result)
    onClose()
  }

  return {
    columns,
    pickerValue,
    handleChange,
    handleConfirm,
  }
}

function createDateOptions(referenceDate: Date) {
  const today = startOfDay(referenceDate)
  const start = new Date(today)
  start.setFullYear(today.getFullYear() - 1)

  const end = new Date(today)
  end.setFullYear(today.getFullYear() + 1)

  const options = []
  for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
    const date = new Date(time)
    const value = toDateKey(date)
    options.push({
      value,
      label: value === toDateKey(today)
        ? 'Today'
        : `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`,
    })
  }

  return options
}

function createPickerValue(value: Date, dateOptions: Array<{ value: string }>, todayKey: string): DateTimeValue {
  const valueDateKey = toDateKey(value)
  const date = dateOptions.some((option) => option.value === valueDateKey)
    ? valueDateKey
    : todayKey

  return {
    date,
    hour: String(value.getHours()).padStart(2, '0'),
    minute: String(value.getMinutes()).padStart(2, '0'),
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)

  return new Date(year, month - 1, day)
}
