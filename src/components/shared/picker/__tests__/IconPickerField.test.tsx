import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { IconPickerField } from '../IconPickerField'

describe('IconPickerField', () => {
  it('renders trigger button showing current icon name', () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /icon/i })).toBeInTheDocument()
    expect(screen.getByText('fa-wallet')).toBeInTheDocument()
  })

  it('picker is closed initially', () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    expect(screen.queryByRole('heading', { name: 'Icon' })).not.toBeInTheDocument()
  })

  it('opens picker when trigger is clicked', async () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('calls onChange when an icon is selected', async () => {
    const onChange = vi.fn()
    render(<IconPickerField value="fa-wallet" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    await userEvent.click(screen.getByRole('button', { name: 'fa-car' }))
    expect(onChange).toHaveBeenCalledWith('fa-car')
  })

  it('closes picker after icon is selected', async () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    await userEvent.click(screen.getByRole('button', { name: 'fa-car' }))
    expect(screen.queryByRole('heading', { name: 'Icon' })).not.toBeInTheDocument()
  })
})
