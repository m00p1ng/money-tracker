import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCategoryStore } from '../../../stores/categoryStore'
import { useTransactionStore } from '../../../stores/transactionStore'
import { useWalletStore } from '../../../stores/walletStore'
import { TransactionPage } from '../TransactionPage'

describe('TransactionPage edit mode', () => {
  beforeEach(() => {
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
})
