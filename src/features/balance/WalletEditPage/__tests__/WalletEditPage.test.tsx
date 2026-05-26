import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { WalletEditPage } from '@/features/balance/WalletEditPage/WalletEditPage'
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

const paymentForm: Wallet = {
  id: 'new-id',
  name: '',
  type: 'payment',
  currency: 'THB',
  balance: 0,
  color: '#10b981',
  icon: 'fa-wallet',
}

const creditCardForm: Wallet = {
  id: 'new-id',
  name: '',
  type: 'credit_card',
  currency: 'THB',
  balance: 0,
  color: '#10b981',
  icon: 'fa-credit-card',
}

const existingForm: Wallet = {
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

function renderPage(props: Partial<React.ComponentProps<typeof WalletEditPage>> = {}) {
  const onSubmit = vi.fn<() => Promise<void>>(async () => {})
  const onDelete = vi.fn<() => Promise<void>>(async () => {})
  const onBack = vi.fn()
  const onChangeName = vi.fn()
  const onChangeType = vi.fn()
  const onChangeCurrency = vi.fn()
  const onChangeIcon = vi.fn()
  const onChangeBalance = vi.fn()
  const onChangeCreditLimit = vi.fn()
  const onChangeReconciliation = vi.fn()

  render(
    <WalletEditPage
      balanceLabel="Starting Balance"
      currencies={currencies}
      error={null}
      form={paymentForm}
      showDelete={false}
      title="New Wallet"
      typeDisabled={false}
      onBack={onBack}
      onChangeBalance={onChangeBalance}
      onChangeCreditLimit={onChangeCreditLimit}
      onChangeCurrency={onChangeCurrency}
      onChangeIcon={onChangeIcon}
      onChangeName={onChangeName}
      onChangeReconciliation={onChangeReconciliation}
      onChangeType={onChangeType}
      onDelete={onDelete}
      onSubmit={onSubmit}
      {...props}
    />,
  )

  return {
    onBack,
    onDelete,
    onSubmit,
    onChangeName,
    onChangeType,
    onChangeCurrency,
    onChangeIcon,
    onChangeBalance,
    onChangeCreditLimit,
    onChangeReconciliation,
  }
}

describe('WalletEditPage', () => {
  it('renders create mode with payment defaults', () => {
    renderPage()

    expect(screen.getByText('New Wallet')).toBeInTheDocument()
    expect(screen.getAllByText('Payment Account').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('THB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with delete action', () => {
    renderPage({
      form: existingForm, title: 'Edit Wallet', showDelete: true, typeDisabled: true,
    })

    expect(screen.getByText('Edit Wallet')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Visa')).toBeInTheDocument()
    expect(screen.getAllByText('Credit Card').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows credit limit for credit card form', () => {
    renderPage({ form: creditCardForm })

    expect(screen.getByText('Credit Limit')).toBeInTheDocument()
  })

  it('calls onChangeReconciliation when toggling switch', async () => {
    const { onChangeReconciliation } = renderPage()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Reconciliation' }))

    expect(onChangeReconciliation).toHaveBeenCalledWith(true)
  })

  it('calls onSubmit when save clicked', async () => {
    const { onSubmit } = renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete clicked', async () => {
    const { onDelete } = renderPage({ form: existingForm, showDelete: true })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('opens icon picker when icon button is tapped', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Change icon' }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('displays error prop when provided', () => {
    renderPage({ error: 'Name is required' })
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })

  it('renders a Type selector field', () => {
    renderPage()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getAllByText('Payment Account').length).toBeGreaterThanOrEqual(1)
  })

  it('type selector is disabled when typeDisabled is true', () => {
    renderPage({ form: existingForm, typeDisabled: true })
    const typeButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent?.includes('Credit Card') && btn.closest('[class*="relative"]'),
    )
    expect(typeButton).toBeDisabled()
  })

  it('calls onChangeType when type changes', async () => {
    const { onChangeType } = renderPage()

    const typeLabel = screen.getByText('Type').closest('label')!
    const typeDropdownBtn = typeLabel.querySelector('button[type="button"]') as HTMLElement
    await userEvent.click(typeDropdownBtn)
    await userEvent.click(screen.getByText('Credit Card'))

    expect(onChangeType).toHaveBeenCalledWith('credit_card')
  })

  it('calls onChangeName when name input changes', async () => {
    const { onChangeName } = renderPage()

    await userEvent.type(screen.getByRole('textbox'), 'My Wallet')

    expect(onChangeName).toHaveBeenCalled()
  })

  it('renders balanceLabel prop as the field label', () => {
    renderPage({ balanceLabel: 'Current Balance' })
    expect(screen.getByText('Current Balance')).toBeInTheDocument()
  })
})
