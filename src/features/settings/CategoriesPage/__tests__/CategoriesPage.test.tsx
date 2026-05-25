import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CategoriesPage } from '@/features/settings/CategoriesPage/CategoriesPage'
import type { Category, TransactionType } from '@/types/domain'

const makeCategory = (overrides: Partial<Category>): Category => ({
  id: 'cat-1',
  name: 'Food',
  type: 'expense',
  level: 1,
  icon: 'fa-utensils',
  isDefault: false,
  ...overrides,
})

const defaultProps = {
  categories: [
    makeCategory({
      id: 'cat-1', name: 'Food & Drink', type: 'expense',
    }),
    makeCategory({
      id: 'cat-2', name: 'Transport', type: 'expense',
    }),
  ],
  subCountMap: { 'cat-1': 4, 'cat-2': 0 },
  activeType: 'expense' as TransactionType,
  onChangeType: vi.fn(),
  onBack: vi.fn(),
}

function renderPage(props = defaultProps) {
  render(
    <MemoryRouter>
      <CategoriesPage {...props} />
    </MemoryRouter>,
  )
}

describe('CategoriesPage', () => {
  it('renders category names', () => {
    renderPage()
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
  })

  it('shows sub-count for categories that have sub-categories', () => {
    renderPage()
    expect(screen.getByText('4 sub-categories')).toBeInTheDocument()
  })

  it('shows "No sub-categories" for zero count', () => {
    renderPage()
    expect(screen.getByText('No sub-categories')).toBeInTheDocument()
  })

  it('renders add row link with type-aware label', () => {
    renderPage()
    expect(screen.getByText('Add Expense Category')).toBeInTheDocument()
  })

  it('add row link points to /settings/categories/new?type=expense', () => {
    renderPage()
    const link = screen.getByText('Add Expense Category').closest('a')
    expect(link).toHaveAttribute('href', '/settings/categories/new?type=expense')
  })

  it('calls onBack when back is pressed', async () => {
    const onBack = vi.fn()
    renderPage({ ...defaultProps, onBack })
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
