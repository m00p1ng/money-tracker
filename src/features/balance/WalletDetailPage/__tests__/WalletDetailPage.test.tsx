import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { WalletDetailPage } from '@/features/balance/WalletDetailPage/WalletDetailPage'
import type { Category, Wallet } from '@/types/domain'

const wallet: Wallet = {
  id: 'wallet-cash',
  name: 'Cash',
  type: 'payment',
  currency: 'THB',
  balance: 0,
  color: '#10b981',
  icon: 'fa-wallet',
}

function primaryAmountElement(text: string): HTMLElement {
  const element = screen
    .getAllByText(text)
    .find((node) => node.className.includes('font-semibold'))

  if (!element) {
    throw new Error(`Primary amount "${text}" not found`)
  }

  return element
}

function renderPage(props: Partial<React.ComponentProps<typeof WalletDetailPage>> = {}) {
  const onAdd = vi.fn()
  const onBack = vi.fn()
  const onSearch = vi.fn()
  const onToggleCleared = vi.fn()

  render(
    <MemoryRouter>
      <WalletDetailPage
        categories={[]}
        clearedAmount={0}
        currentAmount={0}
        onAdd={onAdd}
        onBack={onBack}
        onSearch={onSearch}
        onToggleCleared={onToggleCleared}
        transactions={[]}
        wallet={wallet}
        wallets={[wallet]}
        {...props}
      />
    </MemoryRouter>,
  )

  return {
    onAdd,
    onSearch,
  }
}

describe('WalletDetailPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders search and add actions in the page title', async () => {
    const user = userEvent.setup()
    const { onAdd, onSearch } = renderPage()

    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(screen.getByRole('button', { name: 'Add transaction' }))

    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('opens start date picker when Begin is tapped', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Begin' }))

    expect(screen.getByText('Start Date')).toBeInTheDocument()
  })

  it('opens end date picker when End is tapped', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'End' }))

    expect(screen.getByText('End Date')).toBeInTheDocument()
  })

  it('groups multiple transaction items into one row', () => {
    vi.setSystemTime(new Date('2026-05-26T12:00:00.000Z'))
    const categories: Category[] = [
      {
        id: 'coffee',
        name: 'Coffee',
        type: 'expense',
        level: 1,
        icon: 'fa-mug-hot',
        isDefault: true,
      },
      {
        id: 'food',
        name: 'Food',
        type: 'expense',
        level: 1,
        icon: 'fa-burger',
        isDefault: true,
      },
    ]

    renderPage({
      categories,
      transactions: [
        {
          id: 'tx-multiple-items',
          type: 'expense',
          walletId: wallet.id,
          currency: 'THB',
          items: [
            { categoryId: 'coffee', amount: 10 },
            { categoryId: 'food', amount: 20 },
          ],
          date: '2026-05-25T10:00:00.000Z',
          createdAt: '2026-05-25T10:00:00.000Z',
        },
      ],
    })

    expect(screen.getByText('Coffee, Food')).toBeInTheDocument()
    expect(primaryAmountElement('฿30.00')).toBeInTheDocument()
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
  })

  it('colors amount by transaction type instead of signed wallet impact', () => {
    vi.setSystemTime(new Date('2026-05-26T12:00:00.000Z'))
    const creditWallet: Wallet = {
      ...wallet,
      id: 'wallet-credit',
      name: 'Credit Card',
      type: 'credit_card',
      creditLimit: 5000,
    }

    renderPage({
      wallet: creditWallet,
      wallets: [creditWallet],
      categories: [
        {
          id: 'coffee',
          name: 'Coffee',
          type: 'expense',
          level: 1,
          icon: 'fa-mug-hot',
          isDefault: true,
        },
      ],
      transactions: [
        {
          id: 'tx-credit-expense',
          type: 'expense',
          walletId: creditWallet.id,
          currency: 'THB',
          items: [{ categoryId: 'coffee', amount: 30 }],
          date: '2026-05-25T10:00:00.000Z',
          createdAt: '2026-05-25T10:00:00.000Z',
        },
      ],
    })

    expect(primaryAmountElement('฿30.00')).toHaveClass('text-expense')
  })
})
