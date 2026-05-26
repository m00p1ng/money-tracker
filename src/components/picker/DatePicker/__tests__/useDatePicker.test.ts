import { act, renderHook } from '@testing-library/react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useDatePicker } from '../useDatePicker'

describe('useDateOnlyPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initialises pickerValue fields from value prop', () => {
    const onChange = vi.fn()
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDatePicker('2026-05-15', onChange, onClose),
    )

    expect(result.current.pickerValue).toEqual({
      day: '15',
      month: '05',
      year: '2026',
    })
  })

  it('exposes day, full month, and year columns', () => {
    const { result } = renderHook(() =>
      useDatePicker('2026-05-15', vi.fn(), vi.fn()),
    )

    expect(result.current.columns.map((column) => column.name)).toEqual(['day', 'month', 'year'])
    expect(result.current.columns[1].options).toContainEqual({
      value: '05',
      label: 'May',
    })
    const yearOptions = result.current.columns[2].options.map((option) =>
      typeof option === 'string'
        ? option
        : option.value,
    )

    expect(yearOptions).toHaveLength(41)
    expect(yearOptions[0]).toBe('2006')
    expect(yearOptions[20]).toBe('2026')
    expect(yearOptions[40]).toBe('2046')
  })

  it('handleConfirm calls onChange with selected date key and onClose', () => {
    const onChange = vi.fn()
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDatePicker('2026-05-15', onChange, onClose),
    )

    act(() => {
      result.current.handleChange({
        day: '01',
        month: '06',
        year: '2026',
      })
    })
    act(() => {
      result.current.handleConfirm()
    })

    expect(onChange).toHaveBeenCalledWith('2026-06-01')
    expect(onClose).toHaveBeenCalled()
  })

  it('falls back to today when value is out of range', () => {
    const { result } = renderHook(() =>
      useDatePicker('1990-01-01', vi.fn(), vi.fn()),
    )

    expect(result.current.pickerValue).toEqual({
      day: '25',
      month: '05',
      year: '2026',
    })
  })

  it('clamps the day when changing to a shorter month', () => {
    const { result } = renderHook(() =>
      useDatePicker('2026-03-31', vi.fn(), vi.fn()),
    )

    act(() => {
      result.current.handleChange({
        day: '31',
        month: '02',
        year: '2026',
      })
    })

    expect(result.current.pickerValue).toEqual({
      day: '28',
      month: '02',
      year: '2026',
    })
  })
})
