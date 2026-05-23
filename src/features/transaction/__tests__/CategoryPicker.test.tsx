import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../types/domain'
import { CategoryPicker } from '../CategoryPicker'

const categories: Category[] = [
  { id: 'expense-food-and-drink', name: 'Food & Drink', type: 'expense', level: 1, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
  { id: 'expense-food-and-drink-coffee', name: 'Coffee', type: 'expense', parentId: 'expense-food-and-drink', level: 2, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
  { id: 'income-salary', name: 'Salary', type: 'income', level: 1, icon: 'fa-money-bill', color: '#3b82f6', isDefault: true },
]

describe('CategoryPicker', () => {
  it('navigates root to leaf and selects the leaf', async () => {
    const onSelect = vi.fn()
    render(<CategoryPicker isOpen={true} categories={categories} type="expense" onClose={vi.fn()} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Coffee'))
    expect(onSelect).toHaveBeenCalledWith(categories[1])
  })

  it('returns to parent when back is clicked', async () => {
    render(<CategoryPicker isOpen={true} categories={categories} type="expense" onClose={vi.fn()} onSelect={vi.fn()} />)
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
  })

  it('calls onClose when back is clicked at root level', async () => {
    const onClose = vi.fn()
    render(<CategoryPicker isOpen={true} categories={categories} type="expense" onClose={onClose} onSelect={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('only shows categories matching the specified type', () => {
    render(<CategoryPicker isOpen={true} categories={categories} type="expense" onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
  })

  it('shows "All" in header at root level and parent name when navigating into a category', async () => {
    render(<CategoryPicker isOpen={true} categories={categories} type="expense" onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'All' })).toBeInTheDocument()
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByRole('heading', { name: 'Food & Drink' })).toBeInTheDocument()
  })
})
