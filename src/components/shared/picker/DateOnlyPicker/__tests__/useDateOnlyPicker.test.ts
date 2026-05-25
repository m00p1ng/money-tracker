import { act, renderHook } from '@testing-library/react'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useDateOnlyPicker } from '../useDateOnlyPicker'

describe('useDateOnlyPicker', () => {
  it('initialises pickerValue from value prop', () => {
    const onChange = vi.fn()
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDateOnlyPicker('2026-05-15', onChange, onClose),
    )

    expect(result.current.pickerValue).toBe('2026-05-15')
  })

  it('exposes a single column named date', () => {
    const { result } = renderHook(() =>
      useDateOnlyPicker('2026-05-15', vi.fn(), vi.fn()),
    )

    expect(result.current.columns).toHaveLength(1)
    expect(result.current.columns[0].name).toBe('date')
  })

  it('handleConfirm calls onChange with selected date key and onClose', () => {
    const onChange = vi.fn()
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDateOnlyPicker('2026-05-15', onChange, onClose),
    )

    act(() => {
      result.current.handleChange('2026-06-01')
    })
    act(() => {
      result.current.handleConfirm()
    })

    expect(onChange).toHaveBeenCalledWith('2026-06-01')
    expect(onClose).toHaveBeenCalled()
  })

  it('falls back to today when value is out of range', () => {
    const { result } = renderHook(() =>
      useDateOnlyPicker('1990-01-01', vi.fn(), vi.fn()),
    )
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    expect(result.current.pickerValue).toBe(key)
  })
})
