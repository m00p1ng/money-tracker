import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'

import { DesignSidebar } from '@/features/design/DesignSidebar'

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
    expect(screen.getByRole('button', { name: 'WalletRow' })).toBeInTheDocument()
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
})
