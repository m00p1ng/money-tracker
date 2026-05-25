import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { DateTimePicker } from '@/components'

vi.mock('@ncdai/react-wheel-picker', () => ({
  WheelPickerWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="wheel-picker">{children}</div>
  ),
  WheelPicker: ({
    value,
    onValueChange,
    options,
  }: {
    value: string
    onValueChange: (value: string) => void
    options: Array<{ value: string; label: ReactNode }>
  }) => (
    <div>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}))

describe('DatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 25, 9, 0, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a first date wheel column with Today selected by default', () => {
    render(
      <DateTimePicker
        isOpen
        value={new Date(2026, 4, 25, 14, 30)}
        onChange={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Tue 26 May' })).toBeInTheDocument()
  })

  it('confirms the selected wheel date with the selected time', async () => {
    const onChange = vi.fn()
    const onClose = vi.fn()

    render(
      <DateTimePicker
        isOpen
        value={new Date(2026, 4, 25, 14, 30)}
        onChange={onChange}
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tue 26 May' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 4, 26, 14, 30, 0, 0))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
