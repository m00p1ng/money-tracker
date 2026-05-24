import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { DesignSidebar } from '@/features/design/DesignSidebar'

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('DesignSidebar', () => {
  it('shows the search icon', () => {
    render(<DesignSidebar activeId="colors" />)

    expect(document.querySelector('[data-icon="magnifying-glass"]')).toBeInTheDocument()
  })

  it('filters navigation items by search text', async () => {
    render(<DesignSidebar activeId="colors" />)

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
    render(<DesignSidebar activeId="colors" />)

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search design sections' }), 'zzzz')

    expect(screen.getByText('No matches')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Colors' })).not.toBeInTheDocument()
  })
})
