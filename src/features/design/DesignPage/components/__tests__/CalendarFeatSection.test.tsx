import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { CalendarFeatSection } from '@/features/design/DesignPage/components/features/CalendarFeatSection'

describe('CalendarFeatSection', () => {
  it('shows the calendar grid without the calendar page chrome', () => {
    render(
      <MemoryRouter>
        <CalendarFeatSection />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'CalendarGrid' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Select 2026-05-/ })).toHaveLength(31)
    expect(screen.queryByRole('button', { name: 'Add transaction' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument()
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument()
  })
})
