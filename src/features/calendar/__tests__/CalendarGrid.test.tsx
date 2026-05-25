import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CalendarGrid } from '../CalendarPage/components/CalendarGrid/CalendarGrid'

const base = {
  year: 2026,
  month: 4,
  today: '2026-05-25',
  selectedDate: null as string | null,
  indicatorMap: {} as Record<string, 'transaction' | 'upcoming' | 'both'>,
  onSelectDate: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
}

describe('CalendarGrid', () => {
  it('renders 31 day buttons for May 2026', () => {
    render(<CalendarGrid {...base} />)
    expect(screen.getAllByRole('button', { name: /^Select/ })).toHaveLength(31)
  })

  it('renders DOW header labels', () => {
    render(<CalendarGrid {...base} />)
    for (const label of ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('calls onSelectDate with date string when day tapped', async () => {
    const onSelectDate = vi.fn()
    const user = userEvent.setup()
    render(<CalendarGrid {...base} onSelectDate={onSelectDate} />)
    await user.click(screen.getByLabelText('Select 2026-05-10'))
    expect(onSelectDate).toHaveBeenCalledWith('2026-05-10')
  })

  it('calls onSelectDate with null when already-selected date tapped', async () => {
    const onSelectDate = vi.fn()
    const user = userEvent.setup()
    render(<CalendarGrid {...base} selectedDate="2026-05-10" onSelectDate={onSelectDate} />)
    await user.click(screen.getByLabelText('Select 2026-05-10'))
    expect(onSelectDate).toHaveBeenCalledWith(null)
  })
})
