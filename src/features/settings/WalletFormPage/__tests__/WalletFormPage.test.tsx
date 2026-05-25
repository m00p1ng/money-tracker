import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { WalletFormPage } from '@/features/settings/WalletFormPage/WalletFormPage'
import type { Currency, Wallet } from '@/types/domain'

const currencies: Currency[] = [
  {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    isBase: true,
    rate: 1,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    isBase: false,
    rate: 0.028,
  },
]

const existingWallet: Wallet = {
  id: 'wallet-1',
  name: 'Visa',
  type: 'credit_card',
  currency: 'THB',
  balance: 1000,
  creditLimit: 50000,
  color: '#3b82f6',
  icon: 'fa-credit-card',
  reconciliationEnabled: true,
}

function renderPage(props: Partial<React.ComponentProps<typeof WalletFormPage>> = {}) {
  const onSubmit = vi.fn<(form: Wallet) => Promise<void>>(async () => {})
  const onDelete = vi.fn<() => Promise<void>>(async () => {})
  const onBack = vi.fn()

  render(
    <WalletFormPage
      currencies={currencies}
      error={null}
      initialType="payment"
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={onSubmit}
      wallet={undefined}
      {...props}
    />,
  )

  return {
    onBack,
    onDelete,
    onSubmit,
  }
}

describe('WalletFormPage', () => {
  it('renders create mode with payment defaults', () => {
    renderPage()

    expect(screen.getByText('New Wallet')).toBeInTheDocument()
    expect(screen.getByText('New wallet')).toBeInTheDocument()
    expect(screen.getByText('Payment Account')).toBeInTheDocument()
    expect(screen.getAllByText('THB')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with delete action', () => {
    renderPage({ wallet: existingWallet })

    expect(screen.getByText('Edit Wallet')).toBeInTheDocument()
    expect(screen.getByText('Visa')).toBeInTheDocument()
    expect(screen.getAllByText('Credit Card').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows credit limit for credit card create mode', () => {
    renderPage({ initialType: 'credit_card' })

    expect(screen.getByText('Credit Limit')).toBeInTheDocument()
  })

  it('submits reconciliation changes', async () => {
    const { onSubmit } = renderPage()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Reconciliation' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      reconciliationEnabled: true,
    })
  })

  it('submits credit card type and default icon in credit card create mode', async () => {
    const { onSubmit } = renderPage({ initialType: 'credit_card' })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      type: 'credit_card',
      icon: 'fa-credit-card',
    })
  })

  it('calls delete callback in edit mode', async () => {
    const { onDelete } = renderPage({ wallet: existingWallet })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('opens icon picker when icon field is tapped', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('submits with selected icon after picking', async () => {
    const { onSubmit } = renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ icon: 'fa-wallet' })
  })

  it('displays error prop when provided', () => {
    renderPage({ error: 'Name is required' })
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })
})
