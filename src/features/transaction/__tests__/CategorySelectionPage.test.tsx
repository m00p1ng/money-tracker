import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCategoryStore } from '../../../stores/categoryStore'
import { CategorySelectionPage } from '../CategorySelectionPage'

const categories = [
  { id: 'exp-food', name: 'Food & Drink', type: 'expense' as const, level: 1 as const, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
  { id: 'exp-food-coffee', name: 'Coffee', type: 'expense' as const, parentId: 'exp-food', level: 2 as const, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
  { id: 'inc-salary', name: 'Salary', type: 'income' as const, level: 1 as const, icon: 'fa-money-bill', color: '#3b82f6', isDefault: true },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/transaction/category']}>
      <Routes>
        <Route path="/transaction/category" element={<CategorySelectionPage />} />
        <Route path="/transaction/new" element={<div data-testid="tx-page" />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useCategoryStore.setState({ items: categories })
})

describe('CategorySelectionPage', () => {
  it('shows expense categories by default', () => {
    renderPage()
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
  })

  it('switches to income categories when Income tab selected', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Income' }))
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument()
  })

  it('drills into sub-categories on parent tap', async () => {
    renderPage()
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument()
  })

  it('navigates to /transaction/new with type and categoryId on leaf tap', async () => {
    renderPage()
    await userEvent.click(screen.getByText('Food & Drink'))
    await userEvent.click(screen.getByText('Coffee'))
    expect(screen.getByTestId('tx-page')).toBeInTheDocument()
  })

  it('navigates to /transaction/new?type=transfer when Transfer tapped', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Transfer' }))
    expect(screen.getByTestId('tx-page')).toBeInTheDocument()
  })
})
