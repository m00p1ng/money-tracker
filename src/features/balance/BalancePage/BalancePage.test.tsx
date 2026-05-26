import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { Wallet } from '@/types/domain'

import { BalancePage } from './BalancePage'

vi.mock('@/components', async () => {
  const actual = await vi.importActual<typeof import('@/components')>('@/components')

  return {
    ...actual,
    AnimatedBar: ({
      value,
      maxValue,
      colorFrom,
      colorTo,
      textColor,
    }: {
      value: number
      maxValue: number
      colorFrom: string
      colorTo: string
      textColor: string
    }) => {
      const width = maxValue > 0
        ? `${Math.min((value / maxValue) * 100, 100)}%`
        : '0%'

      const id = colorFrom === 'var(--income)'
        ? 'bar-income'
        : 'bar-expense'

      return (
        <div
          data-testid={id}
          data-max-value={maxValue}
          style={{
            background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
            color: textColor,
            width,
          }}
        />
      )
    },
  }
})

const defaultProps = {
  assets: 0,
  debt: 0,
  isEditMode: false,
  onToggleEditMode: vi.fn(),
  onAddWallet: vi.fn(),
  onEditWallet: vi.fn(),
  onReorder: vi.fn().mockResolvedValue(undefined),
}

describe('BalancePage', () => {
  const paymentWallet: Wallet = {
    id: 'wallet-cash',
    name: 'Cash',
    type: 'payment',
    currency: 'THB',
    balance: 1000,
    color: '#22c55e',
    icon: 'fa-wallet',
  }

  const creditCard: Wallet = {
    id: 'wallet-card',
    name: 'Visa',
    type: 'credit_card',
    currency: 'USD',
    balance: 0,
    creditLimit: 5000,
    color: '#f97316',
    icon: 'fa-credit-card',
  }

  it('renders wallets with the shared grouped list row styling', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[{ wallet: paymentWallet, amount: 1234 }]}
          creditCards={[{ wallet: creditCard, amount: 250 }]}
          assets={1234}
          debt={250}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Payment Accounts')).toBeInTheDocument()
    expect(screen.getByText('Credit Cards')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Cash/i })).toHaveAttribute('href', '/balance/wallet/wallet-cash')
    expect(screen.getByRole('link', { name: /Cash/i })).toHaveClass('border-b', 'px-4', 'py-3.5')
    expect(screen.getByRole('link', { name: /Visa/i })).toHaveAttribute('href', '/balance/wallet/wallet-card')
    expect(screen.getByText('฿1,234.00')).toBeInTheDocument()
    expect(screen.getByText('$250.00')).toBeInTheDocument()
  })

  it('shows Edit button in view mode', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
  })

  it('shows Done and Add buttons in edit mode', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          isEditMode={true}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add wallet' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('calls onToggleEditMode when Edit clicked', async () => {
    const onToggleEditMode = vi.fn()
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          onToggleEditMode={onToggleEditMode}
        />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onToggleEditMode).toHaveBeenCalledOnce()
  })

  it('shows drag handles in edit mode instead of links', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[{ wallet: paymentWallet, amount: 1234 }]}
          creditCards={[]}
          isEditMode={true}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /Cash/i })).not.toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
  })

  it('calls onEditWallet when wallet row tapped in edit mode', async () => {
    const onEditWallet = vi.fn()
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[{ wallet: paymentWallet, amount: 1234 }]}
          creditCards={[]}
          isEditMode={true}
          onEditWallet={onEditWallet}
        />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByText('Cash'))
    expect(onEditWallet).toHaveBeenCalledWith('wallet-cash')
  })

  it('calls onAddWallet when Add button tapped in edit mode', async () => {
    const onAddWallet = vi.fn()
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          isEditMode={true}
          onAddWallet={onAddWallet}
        />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add wallet' }))
    expect(onAddWallet).toHaveBeenCalledOnce()
  })

  it('uses income and expense colors for asset and debt bars', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          assets={1000}
          debt={250}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({
      background: 'linear-gradient(to right, var(--income), var(--income))',
      color: 'var(--income-text)',
    })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({
      background: 'linear-gradient(to right, var(--expense), var(--expense))',
      color: 'var(--expense-text)',
    })
  })

  it('scales bars against the largest balance amount', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          assets={1000}
          debt={250}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({ width: '100%' })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({ width: '25%' })
  })

  it('scales assets against debt when debt is the largest amount', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          assets={250}
          debt={1000}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({ width: '25%' })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({ width: '100%' })
  })

  it('shows a zero-width bar when the amount is 0', () => {
    render(
      <MemoryRouter>
        <BalancePage
          {...defaultProps}
          paymentWallets={[]}
          creditCards={[]}
          assets={0}
          debt={0}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({ width: '0%' })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({ width: '0%' })
  })
})
