import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  CurrencyPicker,
  DateRangePresetPicker,
  RepeatPicker,
  SelectorSheet,
  WalletPicker,
} from '@/components'

vi.mock('@ncdai/react-wheel-picker', () => ({
  WheelPickerWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="wheel-picker">{children}</div>
  ),
  WheelPicker: ({
    value,
    onValueChange,
    options,
  }: {
    value: string
    onValueChange: (value: string) => void
    options: Array<{ value: string; label: ReactNode }>
  }) => (
    <div>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}))

describe('preset pickers', () => {
  it('renders selector sheet leading content and descriptions', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <SelectorSheet
        isOpen
        title="Accounts"
        options={[
          {
            label: 'Cash',
            value: 'cash',
            description: 'THB · 250.00',
            leading: <span data-testid="cash-icon">C</span>,
          },
          {
            label: 'Bank',
            value: 'bank',
            description: 'USD · 100.00',
            leading: <span data-testid="bank-icon">B</span>,
          },
        ]}
        value="cash"
        onSelect={onSelect}
        onClose={onClose}
      />,
    )

    expect(screen.getByTestId('cash-icon')).toBeInTheDocument()
    expect(screen.getByText('THB · 250.00')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Bank/ }))

    expect(onSelect).toHaveBeenCalledWith('bank')
  })

  it('confirms DateRangePresetPicker wheel selection before closing', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <DateRangePresetPicker
        isOpen
        value="last-7d"
        onSelect={onSelect}
        onClose={onClose}
      />,
    )

    expect(screen.getByTestId('wheel-picker')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last 7 Day' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Last 30 Day' }))

    expect(onSelect).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onSelect).toHaveBeenCalledWith('last-30d')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('selects and closes WalletPicker through the preset list', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <WalletPicker
        isOpen
        wallets={[
          {
            id: 'cash',
            name: 'Cash',
            type: 'payment',
            currency: 'THB',
            balance: 250,
            color: '#10b981',
            icon: 'fa-wallet',
          },
          {
            id: 'bank',
            name: 'Bank',
            type: 'payment',
            currency: 'USD',
            balance: 100,
            color: '#0ea5e9',
            icon: 'fa-building-columns',
          },
        ]}
        selectedId="cash"
        onSelect={onSelect}
        onClose={onClose}
      />,
    )

    expect(screen.getByText('THB · 250.00')).toBeInTheDocument()
    expect(document.querySelector('[data-icon="wallet"]')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Bank/ }))

    expect(onSelect).toHaveBeenCalledWith('bank')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('selects and closes CurrencyPicker through the preset list', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <CurrencyPicker
        isOpen
        currencies={[
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
            rate: 35,
          },
        ]}
        selectedCode="THB"
        onSelect={onSelect}
        onClose={onClose}
      />,
    )

    expect(screen.getByText('Thai Baht')).toBeInTheDocument()
    expect(screen.getByText('🇹🇭')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /USD/ }))

    expect(onSelect).toHaveBeenCalledWith('USD')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('selects and closes RepeatPicker immediately without a confirm button', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <RepeatPicker
        isOpen
        value={{ preset: 'never' }}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Monthly' }))

    expect(onConfirm).toHaveBeenCalledWith({ preset: 'monthly' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
