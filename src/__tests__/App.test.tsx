import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App routing', () => {
  it('renders the home route with bottom navigation', () => {
    render(<App />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})
