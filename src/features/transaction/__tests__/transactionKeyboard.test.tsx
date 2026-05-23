import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionDraftStore } from '@/stores/transactionDraftStore'
import { useWalletStore } from '@/stores/walletStore'
import { TransactionPage } from '@/features/transaction/TransactionPage'

const WALLET = { id: 'wallet-cash', name: 'Cash', type: 'payment' as const, currency: 'THB', balance: 0, color: '#10b981', icon: 'fa-wallet' }
const CATEGORY = { id: 'cat-coffee', name: 'Coffee', type: 'expense' as const, parentId: 'cat-food', level: 2 as const, icon: 'fa-utensils', color: '#65a30d', isDefault: true }

function renderNewTransaction(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/transaction/new${search}`]}>
      <Routes>
        <Route path="/transaction/new" element={<TransactionPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useTransactionDraftStore.getState().clear()
  useWalletStore.setState({ items: [WALLET] })
  useCategoryStore.setState({ items: [CATEGORY] })
})

describe('TransactionPage keyboard gate', () => {
  it('does not show calculator keyboard on mount with no items', () => {
    renderNewTransaction()
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
  })

  it('shows calculator keyboard after tapping the amount area of a category item', async () => {
    renderNewTransaction(`?type=expense&categoryId=${CATEGORY.id}`)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
  })

  it('hides calculator keyboard after tapping note textarea', async () => {
    renderNewTransaction(`?type=expense&categoryId=${CATEGORY.id}`)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    const note = screen.getByLabelText('Note')
    await userEvent.click(note)
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
  })
})
