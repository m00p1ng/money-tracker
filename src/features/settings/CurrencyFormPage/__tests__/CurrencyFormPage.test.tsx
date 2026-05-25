import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CurrencyFormPage } from '@/features/settings/CurrencyFormPage/CurrencyFormPage'
import type { Currency } from '@/types/domain'

const existingCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  isBase: false,
  rate: 0.028,
}

function renderPage(props: Partial<React.ComponentProps<typeof CurrencyFormPage>> = {}) {
  const onSubmit = vi.fn<(form: Currency) => Promise<void>>(async () => {})
  const onDelete = vi.fn<() => Promise<void>>(async () => {})
  const onBack = vi.fn()

  render(
    <CurrencyFormPage
      existing={undefined}
      error={null}
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={onSubmit}
      {...props}
    />,
  )

  return {
    onBack, onDelete, onSubmit,
  }
}

describe('CurrencyFormPage', () => {
  it('renders create mode with New Currency title', () => {
    renderPage()

    expect(screen.getByText('New Currency')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with Edit Currency title and delete button', () => {
    renderPage({ existing: existingCurrency })

    expect(screen.getByText('Edit Currency')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows live preview with symbol, name, and code', () => {
    renderPage({ existing: existingCurrency })

    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('shows placeholder text in preview when name is empty in create mode', () => {
    renderPage()

    expect(screen.getByText('New currency')).toBeInTheDocument()
  })

  it('has a Switch for base currency (not a raw checkbox)', () => {
    renderPage()

    expect(screen.getByRole('checkbox', { name: 'Base currency' })).toBeInTheDocument()
  })

  it('disables rate field when base currency is toggled on', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Base currency' }))

    expect(screen.getByLabelText('Rate')).toBeDisabled()
  })

  it('calls delete callback in edit mode', async () => {
    const { onDelete } = renderPage({ existing: existingCurrency })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('calls submit callback on save', async () => {
    const { onSubmit } = renderPage({ existing: existingCurrency })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('displays error prop when provided', () => {
    renderPage({ error: 'Code is required' })

    expect(screen.getByText('Code is required')).toBeInTheDocument()
  })
})
