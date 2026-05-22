import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../types/domain'
import { CategoryPicker } from '../CategoryPicker'

const categories: Category[] = [
  { id: 'expense-food-and-drink', name: 'Food & Drink', type: 'expense', level: 1, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
  { id: 'expense-food-and-drink-coffee', name: 'Coffee', type: 'expense', parentId: 'expense-food-and-drink', level: 2, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
]

describe('CategoryPicker', () => {
  it('navigates root to leaf and selects the leaf', async () => {
    const onSelect = vi.fn()
    render(<CategoryPicker categories={categories} type="expense" onClose={vi.fn()} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Coffee'))
    expect(onSelect).toHaveBeenCalledWith(categories[1])
  })
})
