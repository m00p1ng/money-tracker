import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import { RoutedApp } from '@/App'
import { useTransactionStore, useWalletStore } from '@/stores'

describe('App routing', () => {
  afterEach(() => {
    useWalletStore.setState({ items: [] })
    useTransactionStore.setState({ items: [] })
  })
  it('renders the home route with bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RoutedApp />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Add transaction' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders /transaction/new route', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/new']}>
        <RoutedApp />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders /transaction/:id route in edit mode', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/123']}>
        <RoutedApp />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders the Balance tab account groups', () => {
    useWalletStore.setState({
      items: [
        {
          id: 'w1',
          name: 'Cash',
          type: 'payment' as const,
          currency: 'THB',
          balance: 0,
          color: '#10b981',
          icon: 'fa-wallet',
        },
        {
          id: 'cc1',
          name: 'Visa',
          type: 'credit_card' as const,
          currency: 'THB',
          balance: 0,
          color: '#f59e0b',
          icon: 'fa-credit-card',
        },
      ],
    })
    render(
      <MemoryRouter initialEntries={['/balance']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Balance' })).toBeInTheDocument()
    expect(screen.getByText('Payment Accounts')).toBeInTheDocument()
    expect(screen.getByText('Credit Cards')).toBeInTheDocument()
  })

  it('enables Home Balance and Setting in bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/balance']}>
        <RoutedApp />
      </MemoryRouter>,
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
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('opens the design page after pressing Settings in the bottom navigation three times', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/design" element={<div>Design System</div>} />
          <Route path="/*" element={<RoutedApp />} />
        </Routes>
      </MemoryRouter>,
    )

    const settingsTab = screen.getByRole('link', { name: /Settings/i })
    await user.click(settingsTab)
    expect(screen.queryByText('Design System')).not.toBeInTheDocument()

    await user.click(settingsTab)
    expect(screen.queryByText('Design System')).not.toBeInTheDocument()

    await user.click(settingsTab)
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('does not open the design page with Shift+D', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/design" element={<div>Design System</div>} />
          <Route path="/*" element={<RoutedApp />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.keyboard('{Shift>}D{/Shift}')

    expect(screen.queryByText('Design System')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('renders Settings menu rows and child settings routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Currencies/i })).toHaveAttribute('href', '/settings/currencies')
    expect(screen.getByRole('link', { name: /Theme/i })).toHaveAttribute('href', '/settings/theme')
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('DD MMM YYYY')).toBeInTheDocument()
  })

  it('hides bottom navigation on wallet detail route', () => {
    render(
      <MemoryRouter initialEntries={['/balance/wallet/wallet-cash']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Wallet not found' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })

  it('renders wallet new form route', () => {
    render(
      <MemoryRouter initialEntries={['/balance/wallets/new?type=payment']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'New Wallet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders category currency and theme management routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings/theme']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forest' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Void' })).toBeInTheDocument()
  })

  it('renders wallet edit form route', () => {
    useWalletStore.setState({
      items: [{
        id: 'wallet-cash',
        name: 'Cash',
        type: 'payment',
        currency: 'THB',
        balance: 0,
        color: '#10b981',
        icon: 'fa-wallet',
      }],
    })
    render(
      <MemoryRouter initialEntries={['/balance/wallets/wallet-cash']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Edit Wallet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders repeat occurrence route without bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/transaction/repeat/tx-rent/2026-06-24']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })

  it('renders upcoming transactions on home', () => {
    useTransactionStore.setState({
      items: [{
        id: 'tx-overdue',
        type: 'expense',
        walletId: 'wallet-cash',
        currency: 'THB',
        items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 28 }],
        date: '2026-05-22T10:00:00.000Z',
        status: 'overdue',
        createdAt: '2026-05-22T10:00:00.000Z',
      }],
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <RoutedApp />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Upcoming' })).toBeInTheDocument()
    expect(screen.getByText('22 May')).toBeInTheDocument()
  })
})
