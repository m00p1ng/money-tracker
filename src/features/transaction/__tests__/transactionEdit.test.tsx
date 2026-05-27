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

import CategorySelectionPage from '@/features/transaction/CategorySelectionPage'
import TransactionPage from '@/features/transaction/TransactionPage'
import {
  useCategoryStore,
  useTransactionDraftStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

describe('TransactionPage edit mode', () => {
  beforeEach(() => {
    useTransactionDraftStore.getState().clear()
    useWalletStore.setState({
      items: [{
        id: 'wallet-cash',
        name: 'Cash',
        type: 'payment',
        currency: 'THB',
        balance: 0,
        icon: 'fa-wallet',
        color: '#10b981',
      }],
    })
    useCategoryStore.setState({
      items: [{
        id: 'expense-food-and-drink-coffee',
        name: 'Coffee',
        type: 'expense',
        parentId: 'expense-food-and-drink',
        level: 2,
        icon: 'fa-utensils',
        isDefault: true,
      }],
    })
    useTransactionStore.setState({
      items: [{
        id: 'tx-1',
        type: 'expense',
        walletId: 'wallet-cash',
        currency: 'THB',
        items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 28 }],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }],
    })
  })

  it('shows delete button for existing transactions', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Delete transaction' })).toBeInTheDocument()
    expect(screen.getAllByText('฿28.00').length).toBeGreaterThanOrEqual(1)
  })

  it('hydrates form fields with existing transaction data', () => {
    const transactionDate = new Date('2024-01-15T10:30:00.000Z')

    useTransactionStore.setState({
      items: [{
        id: 'tx-1',
        type: 'income',
        walletId: 'wallet-cash',
        currency: 'THB',
        items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 150 }],
        date: transactionDate.toISOString(),
        createdAt: transactionDate.toISOString(),
        note: 'Test note',
      }],
    })

    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /income/i })).toBeInTheDocument()
    expect(screen.getAllByText('฿150.00').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /Date & Time/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Note')).toHaveValue('Test note')
  })

  it('calls update when saving an edited transaction', async () => {
    const user = userEvent.setup()
    const updateSpy = vi.spyOn(useTransactionStore.getState(), 'update').mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
      id: 'tx-1',
      type: 'expense',
      walletId: 'wallet-cash',
    }))

    updateSpy.mockRestore()
  })

  it('shows confirm dialog and removes transaction on delete', async () => {
    const user = userEvent.setup()
    const removeSpy = vi.spyOn(useTransactionStore.getState(), 'remove').mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete transaction' })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    expect(removeSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledWith('tx-1')

    removeSpy.mockRestore()
  })

  it('does not remove transaction when confirm is cancelled', async () => {
    const user = userEvent.setup()
    const removeSpy = vi.spyOn(useTransactionStore.getState(), 'remove')

    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const deleteButton = await screen.findByRole('button', { name: 'Delete transaction' })
    await user.click(deleteButton)

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(removeSpy).not.toHaveBeenCalled()

    removeSpy.mockRestore()
  })

  it('shows transfer controls when transfer type is selected', async () => {
    const user = userEvent.setup()
    useWalletStore.setState({
      items: [
        {
          id: 'wallet-cash',
          name: 'Cash',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          icon: 'fa-wallet',
          color: '#10b981',
        },
        {
          id: 'wallet-bank',
          name: 'Bank',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          icon: 'fa-building-columns',
          color: '#10b981',
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/transaction/new']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /expense/i }))
    await user.click(screen.getByRole('button', { name: 'Transfer' }))
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
  })

  it('uses walletId search param as the initial wallet', () => {
    useWalletStore.setState({
      items: [
        {
          id: 'wallet-cash',
          name: 'Cash',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          icon: 'fa-wallet',
          color: '#10b981',
        },
        {
          id: 'wallet-bank',
          name: 'Bank',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          icon: 'fa-building-columns',
          color: '#10b981',
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/transaction/new?walletId=wallet-bank']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/Bank · ฿0.00/)).toBeInTheDocument()
  })

  it('goes back to the previous non-category page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/calendar', '/transaction/new']} initialIndex={1}>
        <Routes>
          <Route path="/calendar" element={<div data-testid="calendar-page" />} />
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByTestId('calendar-page')).toBeInTheDocument()
  })

  it('does not go back to category selection after category-created transaction', async () => {
    const user = userEvent.setup()
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
      ],
    })

    render(
      <MemoryRouter initialEntries={['/', '/transaction/category']} initialIndex={1}>
        <Routes>
          <Route path="/" element={<div data-testid="home-page" />} />
          <Route path="/transaction/category" element={<CategorySelectionPage />} />
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByText('Food & Drink'))
    await user.click(screen.getByText('Coffee'))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
  })
})

describe('TransactionPage type switching', () => {
  beforeEach(() => {
    useTransactionDraftStore.getState().clear()
    useCategoryStore.setState({
      items: [
        {
          id: 'exp-food',
          name: 'Food',
          type: 'expense' as const,
          level: 1 as const,
          icon: 'fa-utensils',
          isDefault: true,
        },
      ],
    })
    useWalletStore.setState({
      items: [
        {
          id: 'w1',
          name: 'Cash',
          type: 'payment' as const,
          currency: 'THB',
          icon: 'fa-wallet',
          color: '#10b981',
          balance: 0,
        },
      ],
    })
  })

  it('clears items when type changes from expense to income', async () => {
    const user = userEvent.setup()
    // Navigate in with a categoryId to seed an item
    render(
      <MemoryRouter initialEntries={['/transaction/new?type=expense&categoryId=exp-food']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )
    // Verify item seeded
    expect(useTransactionDraftStore.getState().draft?.items).toHaveLength(1)

    // Open type picker and switch to income
    const typeTrigger = screen.getByRole('button', { name: /expense/i })
    await user.click(typeTrigger)
    await user.click(screen.getByRole('button', { name: 'Income' }))

    expect(useTransactionDraftStore.getState().draft?.items).toHaveLength(0)
  })
})

describe('TransactionPage adjustment mode', () => {
  beforeEach(() => {
    useTransactionDraftStore.getState().clear()
    useWalletStore.setState({
      items: [{
        id: 'wallet-cash',
        name: 'Cash',
        type: 'payment' as const,
        currency: 'THB',
        balance: 1000,
        icon: 'fa-wallet',
        color: '#10b981',
      }],
    })
    useCategoryStore.setState({ items: [] })
    useTransactionStore.setState({ items: [] })
  })

  it('shows "Balance Adjustment" title when type=adjustment', async () => {
    render(
      <MemoryRouter initialEntries={['/transaction/new?type=adjustment']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Balance Adjustment')).toBeInTheDocument()
  })

  it('does not show type dropdown for adjustment', async () => {
    render(
      <MemoryRouter initialEntries={['/transaction/new?type=adjustment']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows Target Balance row with current wallet balance as default', async () => {
    render(
      <MemoryRouter initialEntries={['/transaction/new?type=adjustment']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Target Balance')).toBeInTheDocument()
  })

  it('editing existing adjustment shows Balance Adjustment title', async () => {
    useTransactionStore.setState({
      items: [{
        id: 'tx-adj-1',
        type: 'adjustment',
        walletId: 'wallet-cash',
        currency: 'THB',
        items: [{ categoryId: 'adjustment-balance-adjustment', amount: 500 }],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'paid',
      }],
    })

    render(
      <MemoryRouter initialEntries={['/transaction/tx-adj-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Balance Adjustment')).toBeInTheDocument()
    expect(screen.getByText('Target Balance')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete transaction')).toBeInTheDocument()
  })
})
