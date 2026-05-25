import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { HomePage } from '@/features/home'
import {
  formatHeaderDay,
  formatHeaderMonthYear,
  formatHeaderWeekday,
} from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

describe('HomePage', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-02-25T12:00:00.000Z'))
    useCategoryStore.setState({
      items: [
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
        {
          id: 'expense-food-and-drink-food',
          name: 'Food',
          type: 'expense',
          parentId: 'expense-food-and-drink',
          level: 2,
          icon: 'fa-burger',
          isDefault: true,
        },
        {
          id: 'income-salary',
          name: 'Salary',
          type: 'income',
          level: 1,
          icon: 'fa-money-bill',
          isDefault: true,
        },
      ],
    })
    useWalletStore.setState({
      items: [
        {
          id: 'wallet-cash',
          name: 'mooping',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          color: '#10b981',
          icon: 'fa-wallet',
        },
        {
          id: 'wallet-test',
          name: 'test',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          color: '#0ea5e9',
          icon: 'fa-building-columns',
        },
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
          date: '2026-02-25T08:00:00.000Z',
          createdAt: new Date().toISOString(),
          note: 'my note',
        },
        {
          id: 'tx-transfer',
          type: 'transfer',
          walletId: 'wallet-cash',
          toWalletId: 'wallet-test',
          currency: 'THB',
          items: [{ categoryId: 'transfer', amount: 100 }],
          date: '2026-02-25T09:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows monthly totals and today transactions', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expense')).toBeInTheDocument()
    expect(screen.getAllByText('฿28.00').length).toBeGreaterThan(0)
    expect(screen.getByText('Coffee (my note)')).toBeInTheDocument()
    expect(screen.getAllByText('25 Feb')).toHaveLength(2)
    expect(screen.getByText('Transfer (mooping->test)')).toBeInTheDocument()
  })

  it('groups multiple transaction items into one today row', () => {
    useTransactionStore.setState({
      items: [
        {
          id: 'tx-multiple-items',
          type: 'expense',
          walletId: 'wallet-cash',
          currency: 'USD',
          items: [
            { categoryId: 'expense-food-and-drink-coffee', amount: 10 },
            { categoryId: 'expense-food-and-drink-food', amount: 20 },
          ],
          date: '2026-02-25T08:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Coffee, Food')).toBeInTheDocument()
    expect(screen.getAllByText('$30.00').length).toBeGreaterThan(0)
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
  })

  it('shows grouped upcoming expenses with shared transaction row formatting', () => {
    useTransactionStore.setState({
      items: [
        {
          id: 'tx-upcoming-multiple-items',
          type: 'expense',
          walletId: 'wallet-cash',
          currency: 'USD',
          status: 'planned',
          items: [
            { categoryId: 'expense-food-and-drink-coffee', amount: 10 },
            { categoryId: 'expense-food-and-drink-food', amount: 20 },
          ],
          date: '2026-02-26T08:00:00.000Z',
          createdAt: new Date().toISOString(),
          note: 'brunch',
        },
      ],
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Coffee, Food (brunch)')).toBeInTheDocument()
    expect(screen.getByText('26 Feb')).toBeInTheDocument()
    expect(screen.getAllByText('$30.00').length).toBeGreaterThan(0)
  })

  it('shows today income and expense totals when they exist', () => {
    useTransactionStore.setState({
      items: [
        {
          id: 'tx-expense',
          type: 'expense',
          walletId: 'wallet-cash',
          currency: 'USD',
          items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 12 }],
          date: '2026-02-25T08:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tx-income',
          type: 'income',
          walletId: 'wallet-cash',
          currency: 'USD',
          items: [{ categoryId: 'income-salary', amount: 20 }],
          date: '2026-02-25T09:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Total Expenses: $12.00')).toBeInTheDocument()
    expect(screen.getByText('Total Income: $20.00')).toBeInTheDocument()
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

    expect(screen.getByText(formatHeaderDay(new Date()))).toBeInTheDocument()
    expect(screen.getByText(formatHeaderWeekday(new Date()))).toBeInTheDocument()
    expect(screen.getByText(formatHeaderMonthYear(new Date()))).toBeInTheDocument()
  })
})
