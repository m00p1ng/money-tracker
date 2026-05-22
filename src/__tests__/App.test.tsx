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
})
