import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { formatShortDate } from '@/lib/date'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { HomePage } from '@/features/home/HomePage'

describe('HomePage', () => {
  beforeEach(() => {
    useCategoryStore.setState({
      items: [
        { id: 'expense-food-and-drink', name: 'Food & Drink', type: 'expense', level: 1, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
        { id: 'expense-food-and-drink-coffee', name: 'Coffee', type: 'expense', parentId: 'expense-food-and-drink', level: 2, icon: 'fa-utensils', color: '#65a30d', isDefault: true },
      ],
    })
    useTransactionStore.setState({
      items: [
        {
          id: 'tx-1',
          type: 'expense',
          walletId: 'wallet-cash',
          currency: 'THB',
          items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 28 }],
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
    })
  })

  it('shows monthly totals and today transactions', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expense')).toBeInTheDocument()
    expect(screen.getByText('฿28.00')).toBeInTheDocument()
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
  })

  it('shows empty state when there are no transactions today', () => {
    useTransactionStore.setState({ items: [] })
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('No transactions today')).toBeInTheDocument()
  })

  it('shows add transaction link', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Add transaction')).toBeInTheDocument()
  })

  it('shows the date', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText(formatShortDate(new Date()))).toBeInTheDocument()
  })
})
