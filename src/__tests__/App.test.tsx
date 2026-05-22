import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App, { RoutedApp } from '../App'

describe('App routing', () => {
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

  it('hides bottom navigation on wallet detail route', () => {
    render(
      <MemoryRouter initialEntries={['/balance/wallet/wallet-cash']}>
        <RoutedApp />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Wallet not found' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })
})
