import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import App, { RoutedApp } from '../App'
import { useWalletStore } from '../stores/walletStore'

describe('App routing', () => {
  afterEach(() => {
    useWalletStore.setState({ items: [] })
  })
  it('renders the home route with bottom navigation', () => {
    render(<App />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders /transaction/new route', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/new']}>
        <RoutedApp />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders /transaction/:id route in edit mode', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/123']}>
        <RoutedApp />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders the Balance tab account groups', () => {
    render(
      <MemoryRouter initialEntries={['/balance']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Balance' })).toBeInTheDocument()
    expect(screen.getByText('Payment Accounts')).toBeInTheDocument()
    expect(screen.getByText('Credit Cards')).toBeInTheDocument()
  })

  it('enables Home Balance and Setting in bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/balance']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Balance/i })).toHaveAttribute('href', '/balance')
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('button', { name: /Budget/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Report/i })).toBeDisabled()
  })

  it('renders settings route with bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders Settings menu rows and child settings routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /Wallets/i })).toHaveAttribute('href', '/settings/wallets')
    expect(screen.getByRole('link', { name: /Categories/i })).toHaveAttribute('href', '/settings/categories')
    expect(screen.getByRole('link', { name: /Currencies/i })).toHaveAttribute('href', '/settings/currencies')
    expect(screen.getByRole('link', { name: /Theme/i })).toHaveAttribute('href', '/settings/theme')
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('DD MMM YYYY')).toBeInTheDocument()
  })

  it('hides bottom navigation on wallet detail route', () => {
    render(
      <MemoryRouter initialEntries={['/balance/wallet/wallet-cash']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Wallet not found' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })

  it('renders wallet management routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings/wallets']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Wallets' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Add Payment Account/i })).toHaveAttribute('href', '/settings/wallets/new?type=payment')
    expect(screen.getByRole('link', { name: /Add Credit Card/i })).toHaveAttribute('href', '/settings/wallets/new?type=credit_card')
  })

  it('renders wallet new form route', () => {
    render(
      <MemoryRouter initialEntries={['/settings/wallets/new?type=payment']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'New Wallet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders category currency and theme management routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings/theme']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forest' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Void' })).toBeInTheDocument()
  })

  it('renders wallet edit form route', () => {
    useWalletStore.setState({
      items: [{ id: 'wallet-cash', name: 'Cash', type: 'payment', currency: 'THB', balance: 0, color: '#10b981', icon: 'fa-wallet' }],
    })
    render(
      <MemoryRouter initialEntries={['/settings/wallets/wallet-cash']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Edit Wallet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders repeat occurrence route without bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/repeat/tx-rent/2026-06-24']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })
})
