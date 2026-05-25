import { useMemo, useState } from 'react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 24 * 60 * 60 * 1000

export function useDateOnlyPicker(
  value: string,
  onChange: (date: string) => void,
  onClose: () => void,
) {
  const dateOptions = useMemo(() => createDateOptions(new Date()), [])
  const todayKey = toDateKey(new Date())

  const [pickerValue, setPickerValue] = useState<string>(() => {
    const inRange = dateOptions.some((opt) => opt.value === value)

    return inRange
      ? value
      : todayKey
  })

  const columns = useMemo(() => [
    {
      name: 'date',
      label: 'Date',
      options: dateOptions,
    },
  ], [dateOptions])

  function handleChange(next: string) {
    setPickerValue(next)
  }

  function handleConfirm() {
    onChange(pickerValue)
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
    const key = toDateKey(date)
    options.push({
      value: key,
      label: key === toDateKey(today)
        ? 'Today'
        : `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`,
    })
  }

  return options
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
