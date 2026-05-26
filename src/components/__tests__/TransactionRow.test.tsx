import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { TransactionRow } from '@/components'

function renderRow(date: string) {
  return render(
    <MemoryRouter>
      <TransactionRow
        to="/transaction/1"
        icon="fa-burger"
        title="Lunch"
        date={date}
        amount={-12}
        currency="USD"
        amountColor="text-expense"
      />
    </MemoryRouter>,
  )
}

describe('TransactionRow', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-05-26T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats the secondary label from the date', () => {
    renderRow('2026-05-26T09:30:00')

    expect(screen.getByText('26 May')).toBeInTheDocument()
  })

  it('shows the clock icon when the date is after now', () => {
    const { container } = renderRow('2026-05-27T09:30:00')

    expect(container.querySelector('[data-icon="clock"]')).toBeInTheDocument()
  })

  it('does not show the clock icon when the date is not after now', () => {
    const { container } = renderRow('2026-05-25T09:30:00')

    expect(container.querySelector('[data-icon="clock"]')).not.toBeInTheDocument()
  })
})
