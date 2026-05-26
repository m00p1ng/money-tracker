import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { DesignSidebar } from '@/features/design/DesignPage/components/DesignSidebar'

function renderSidebar(section = 'tokens') {
  return render(
    <MemoryRouter initialEntries={[`/design/${section}`]}>
      <Routes>
        <Route path="/design/:section" element={<DesignSidebar activeId="colors" />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('DesignSidebar', () => {
  it('shows the search icon', () => {
    renderSidebar()

    expect(document.querySelector('[data-icon="magnifying-glass"]')).toBeInTheDocument()
  })

  it('filters navigation items by search text', async () => {
    renderSidebar()

    const search = screen.getByRole('searchbox', { name: 'Search design sections' })
    await userEvent.type(search, 'wallet')

    expect(screen.getByRole('button', { name: 'WalletPicker' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'WalletSummaryCard' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Button' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'WalletPicker' }))

    expect(search).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument()
  })

  it('shows an empty state when search has no matches', async () => {
    renderSidebar()

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search design sections' }), 'zzzz')

    expect(screen.getByText('No matches')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Colors' })).not.toBeInTheDocument()
  })

  it('shows CalendarGrid in the calendar feature section', () => {
    renderSidebar('feature-calendar')

    expect(screen.getByRole('button', { name: 'CalendarGrid' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'CalendarPage' })).not.toBeInTheDocument()
  })

  it('uses live section items for the active route', () => {
    render(
      <MemoryRouter initialEntries={['/design/feature-calendar']}>
        <Routes>
          <Route
            path="/design/:section"
            element={(
              <DesignSidebar
                activeId="dynamic-section"
                activeItems={[{ id: 'dynamic-section', label: 'DynamicSection' }]}
              />
            )}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'DynamicSection' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'CalendarGrid' })).not.toBeInTheDocument()
  })
})
