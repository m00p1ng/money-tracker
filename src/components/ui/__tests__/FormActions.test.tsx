import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { FormActions } from '@/components/ui'

describe('FormActions', () => {
  it('renders a submit action', () => {
    render(<FormActions />)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
  })

  it('hides delete action when showDelete is false', () => {
    render(<FormActions onDelete={vi.fn()} showDelete={false} />)

    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('calls onDelete from the delete action', async () => {
    const onDelete = vi.fn()

    render(<FormActions onDelete={onDelete} showDelete />)

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    expect(deleteButton).toHaveAttribute('type', 'button')

    await userEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
