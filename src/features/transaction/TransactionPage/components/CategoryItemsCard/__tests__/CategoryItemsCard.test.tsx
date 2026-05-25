import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CategoryItemsCard } from '@/features/transaction/TransactionPage/components/CategoryItemsCard'
import { useCategoryStore } from '@/stores'
import type { Category, TransactionItem } from '@/types/domain'

const items: TransactionItem[] = [
  { categoryId: 'expense-food-and-drink-coffee', amount: 50 },
  { categoryId: 'expense-food-and-drink-coffee', amount: 30 },
]

const categories: Category[] = [
  {
    id: 'expense-food-and-drink',
    name: 'Food & Drink',
    type: 'expense',
    level: 1,
    icon: 'fa-utensils',
    isDefault: true,
  },
  {
    id: 'expense-food-and-drink-coffee',
    name: 'Coffee',
    type: 'expense',
    parentId: 'expense-food-and-drink',
    level: 2,
    icon: 'fa-utensils',
    isDefault: true,
  },
]

function stubFindCategory(id: string) {
  return categories.find((c) => c.id === id)
}

beforeEach(() => {
  useCategoryStore.setState({ items: categories })
})

describe('CategoryItemsCard', () => {
  it('does not show remove button when only one item', () => {
    const oneItem: TransactionItem[] = [{ categoryId: 'expense-food-and-drink-coffee', amount: 50 }]
    render(
      <CategoryItemsCard
        items={oneItem}
        focusedIndex={0}
        onFocus={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onChangeCategory={vi.fn()}
        findCategory={stubFindCategory}
      />,
    )
    const removeButtons = screen.queryAllByRole('button', { name: 'Remove category' })
    expect(removeButtons).toHaveLength(0)
  })

  it('shows remove button for all items when more than one item', () => {
    const threeItems: TransactionItem[] = [
      { categoryId: 'expense-food-and-drink-coffee', amount: 10 },
      { categoryId: 'expense-food-and-drink-coffee', amount: 20 },
      { categoryId: 'expense-food-and-drink-coffee', amount: 30 },
    ]
    render(
      <CategoryItemsCard
        items={threeItems}
        focusedIndex={0}
        onFocus={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onChangeCategory={vi.fn()}
        findCategory={stubFindCategory}
      />,
    )
    expect(screen.getAllByRole('button', { name: 'Remove category' })).toHaveLength(3)
  })

  it('calls onChangeCategory with correct index when category name is tapped', async () => {
    const onChangeCategory = vi.fn()
    render(
      <CategoryItemsCard
        items={items}
        focusedIndex={0}
        onFocus={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onChangeCategory={onChangeCategory}
        findCategory={stubFindCategory}
      />,
    )
    const changeBtns = screen.getAllByRole('button', { name: 'Change category' })
    await userEvent.click(changeBtns[1])
    expect(onChangeCategory).toHaveBeenCalledWith(1)
  })

  it('renders Add Item button', () => {
    render(
      <CategoryItemsCard
        items={items}
        focusedIndex={0}
        onFocus={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onChangeCategory={vi.fn()}
        findCategory={stubFindCategory}
      />,
    )
    expect(screen.getByRole('button', { name: /Add Category/i })).toBeInTheDocument()
  })

  it('calls onAdd when Add Item button is clicked', async () => {
    const onAdd = vi.fn()
    render(
      <CategoryItemsCard
        items={items}
        focusedIndex={0}
        onFocus={vi.fn()}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onChangeCategory={vi.fn()}
        findCategory={stubFindCategory}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Add Category/i }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })
})
