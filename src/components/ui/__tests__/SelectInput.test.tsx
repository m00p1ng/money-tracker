import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { SelectInput } from '@/components/ui/Field'

const OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
]

describe('SelectInput', () => {
  it('renders selected label on trigger button', () => {
    render(<SelectInput options={OPTIONS} value="expense" onChange={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Expense')
  })

  it('does not show options initially', () => {
    render(<SelectInput options={OPTIONS} value="expense" onChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('opens dropdown on trigger click', async () => {
    render(<SelectInput options={OPTIONS} value="expense" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
  })

  it('calls onChange with selected value and closes', async () => {
    const onChange = vi.fn()
    render(<SelectInput options={OPTIONS} value="expense" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Income' }))
    expect(onChange).toHaveBeenCalledWith('income')
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    render(<SelectInput options={OPTIONS} value="expense" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('closes on outside mousedown', async () => {
    render(
      <div>
        <SelectInput options={OPTIONS} value="expense" onChange={vi.fn()} />
        <div data-testid="outside" />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('does not open when disabled', async () => {
    render(<SelectInput options={OPTIONS} value="expense" onChange={vi.fn()} disabled />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('shows placeholder when value matches no option', () => {
    render(<SelectInput options={OPTIONS} value="" onChange={vi.fn()} placeholder="Select type" />)
    expect(screen.getByRole('button')).toHaveTextContent('Select type')
  })
})
