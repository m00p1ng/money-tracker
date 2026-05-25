import {
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { IconPicker } from '../IconPicker'

describe('IconPicker', () => {
  it('renders nothing when closed', () => {
    render(
      <IconPicker
        isOpen={false}
        selectedIcon="fa-utensils"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByText('Icon')).not.toBeInTheDocument()
  })

  it('renders sheet title when open', () => {
    render(
      <IconPicker
        isOpen={true}
        selectedIcon="fa-utensils"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
  })

  it('renders expanded everyday icon options', () => {
    render(
      <IconPicker
        isOpen={true}
        selectedIcon="fa-utensils"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'fa-pizza-slice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fa-train' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fa-receipt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fa-piggy-bank' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fa-person-running' })).toBeInTheDocument()
  })

  it('renders category headers', () => {
    render(
      <IconPicker
        isOpen={true}
        selectedIcon="fa-utensils"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Finance & Work')).toBeInTheDocument()
  })

  it('renders the pizza slice icon glyph', () => {
    render(
      <IconPicker
        isOpen={true}
        selectedIcon="fa-utensils"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    const pizzaButton = screen.getByRole('button', { name: 'fa-pizza-slice' })

    expect(within(pizzaButton).getByRole('img', { hidden: true })).toHaveAttribute('data-icon', 'pizza-slice')
  })

  it('calls onSelect and onClose when an icon button is clicked', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <IconPicker
        isOpen={true}
        selectedIcon="fa-utensils"
        onSelect={onSelect}
        onClose={onClose}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'fa-car' }))

    expect(onSelect).toHaveBeenCalledWith('fa-car')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
