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
        color: '#10b981',
        icon: 'fa-wallet',
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
        color: '#65a30d',
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
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
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

    expect(confirmSpy).toHaveBeenCalledWith('Delete this transaction?')
    expect(removeSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledWith('tx-1')

    confirmSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('does not remove transaction when confirm is cancelled', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
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

    expect(confirmSpy).toHaveBeenCalledWith('Delete this transaction?')
    expect(removeSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
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
          color: '#10b981',
          icon: 'fa-wallet',
        },
        {
          id: 'wallet-bank',
          name: 'Bank',
          type: 'payment',
          currency: 'THB',
          balance: 0,
          color: '#0ea5e9',
          icon: 'fa-building-columns',
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
    expect(screen.getByText('From Wallet')).toBeInTheDocument()
    expect(screen.getByText('To Wallet')).toBeInTheDocument()
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
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
          color: '#65a30d',
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
          color: '#38bdf8',
          icon: 'fa-wallet',
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
