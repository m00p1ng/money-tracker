import { useMemo, useState } from 'react'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

type PickerValue = {
  day: string
  month: string
  year: string
}

export function useDateOnlyPicker(
  value: string,
  onChange: (date: string) => void,
  onClose: () => void,
) {
  const todayKey = toDateKey(new Date())
  const todayValue = dateKeyToPickerValue(todayKey)
  const yearOptions = useMemo(() => createYearOptions(new Date()), [])

  const [pickerValue, setPickerValue] = useState<PickerValue>(() => {
    const initialValue = dateKeyToPickerValue(value)
    const inRange = yearOptions.includes(initialValue.year)

    return inRange
      ? initialValue
      : todayValue
  })

  const columns = useMemo(() => {
    const maxDay = daysInMonth(Number(pickerValue.year), Number(pickerValue.month))

    return [
      {
        name: 'day',
        label: 'Day',
        options: Array.from({ length: maxDay }, (_, index) => padNumber(index + 1)),
      },
      {
        name: 'month',
        label: 'Month',
        options: MONTHS.map((label, index) => ({
          value: padNumber(index + 1),
          label,
        })),
      },
      {
        name: 'year',
        label: 'Year',
        options: yearOptions,
      },
    ]
  }, [pickerValue.month, pickerValue.year, yearOptions])

  function handleChange(next: PickerValue) {
    setPickerValue(clampPickerValue(next))
  }

  function handleConfirm() {
    onChange(pickerValueToDateKey(pickerValue))
    onClose()
  }

  return {
    columns,
    pickerValue,
    handleChange,
    handleConfirm,
  }
}

function createYearOptions(referenceDate: Date) {
  const year = referenceDate.getFullYear()

  return Array.from({ length: 41 }, (_, index) => String(year - 20 + index))
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function dateKeyToPickerValue(dateKey: string): PickerValue {
  const [year, month, day] = dateKey.split('-')

  return clampPickerValue({
    day,
    month,
    year,
  })
}

function pickerValueToDateKey(value: PickerValue) {
  return `${value.year}-${value.month}-${value.day}`
}

function clampPickerValue(value: PickerValue): PickerValue {
  const year = Number(value.year)
  const month = Number(value.month)
  const day = Number(value.day)
  const safeYear = Number.isFinite(year)
    ? year
    : new Date().getFullYear()
  const safeMonth = Number.isFinite(month)
    ? Math.min(Math.max(month, 1), 12)
    : 1
  const safeDay = Number.isFinite(day)
    ? Math.min(Math.max(day, 1), daysInMonth(safeYear, safeMonth))
    : 1

  return {
    day: padNumber(safeDay),
    month: padNumber(safeMonth),
    year: String(safeYear),
  }
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function padNumber(value: number) {
  return String(value).padStart(2, '0')
}
