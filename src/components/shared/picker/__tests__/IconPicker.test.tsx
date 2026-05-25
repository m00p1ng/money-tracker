import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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
