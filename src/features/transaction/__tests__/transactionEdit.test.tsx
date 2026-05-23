import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCategoryStore } from '../../../stores/categoryStore'
import { useTransactionDraftStore } from '../../../stores/transactionDraftStore'
import { useTransactionStore } from '../../../stores/transactionStore'
import { useWalletStore } from '../../../stores/walletStore'
import { TransactionPage } from '../TransactionPage'

describe('TransactionPage edit mode', () => {
  beforeEach(() => {
    useTransactionDraftStore.getState().clear()
    useWalletStore.setState({ items: [{ id: 'wallet-cash', name: 'Cash', type: 'payment', currency: 'THB', balance: 0, color: '#10b981', icon: 'fa-wallet' }] })
    useCategoryStore.setState({ items: [{ id: 'expense-food-and-drink-coffee', name: 'Coffee', type: 'expense', parentId: 'expense-food-and-drink', level: 2, icon: 'fa-utensils', color: '#65a30d', isDefault: true }] })
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
    const updateSpy = vi.spyOn(useTransactionStore.getState(), 'update')

    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(saveButton)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
      id: 'tx-1',
      type: 'expense',
      walletId: 'wallet-cash',
    }))

    updateSpy.mockRestore()
  })

  it('shows confirm dialog and removes transaction on delete', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const removeSpy = vi.spyOn(useTransactionStore.getState(), 'remove')

    render(
      <MemoryRouter initialEntries={['/transaction/tx-1']}>
        <Routes>
          <Route path="/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete transaction' })
    await userEvent.click(deleteButton)

    expect(confirmSpy).toHaveBeenCalledWith('Delete this transaction?')
    expect(removeSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledWith('tx-1')

    confirmSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('does not remove transaction when confirm is cancelled', async () => {
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
    await userEvent.click(deleteButton)

    expect(confirmSpy).toHaveBeenCalledWith('Delete this transaction?')
    expect(removeSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('shows transfer controls when transfer type is selected', async () => {
    const user = userEvent.setup()
    useWalletStore.setState({
      items: [
        { id: 'wallet-cash', name: 'Cash', type: 'payment', currency: 'THB', balance: 0, color: '#10b981', icon: 'fa-wallet' },
        { id: 'wallet-bank', name: 'Bank', type: 'payment', currency: 'THB', balance: 0, color: '#0ea5e9', icon: 'fa-building-columns' },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/transaction/new']}>
        <Routes>
          <Route path="/transaction/new" element={<TransactionPage />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /expense/i }))
    await user.click(screen.getByRole('button', { name: 'Transfer' }))
    expect(screen.getByText('From Wallet')).toBeInTheDocument()
    expect(screen.getByText('To Wallet')).toBeInTheDocument()
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
  })
})
