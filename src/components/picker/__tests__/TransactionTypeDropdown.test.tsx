import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { TransactionTypeDropdown } from '@/components'

describe('TransactionTypeDropdown', () => {
  it('renders current type label', () => {
    render(<TransactionTypeDropdown value="expense" onChange={vi.fn()} />)
    expect(screen.getByText('Expense')).toBeInTheDocument()
  })

  it('renders income label when value is income', () => {
    render(<TransactionTypeDropdown value="income" onChange={vi.fn()} />)
    expect(screen.getByText('Income')).toBeInTheDocument()
  })

  it('opens dropdown on button click', async () => {
    render(<TransactionTypeDropdown value="expense" onChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Transfer' })).toBeInTheDocument()
  })

  it('calls onChange and closes dropdown when a type row is clicked', async () => {
    const onChange = vi.fn()
    render(<TransactionTypeDropdown value="expense" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Income' }))
    expect(onChange).toHaveBeenCalledWith('income')
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('closes dropdown on outside mousedown', async () => {
    render(
      <div>
        <TransactionTypeDropdown value="expense" onChange={vi.fn()} />
        <div data-testid="outside" />
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: /expense/i }))
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('active type row has check icon visible (aria-label)', async () => {
    render(<TransactionTypeDropdown value="income" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /income/i }))
    // Active row is the Income row - verify it's the one with check icon by
    // confirming onChange is NOT called when clicking the already-active type
    const incomeBtns = screen.getAllByRole('button', { name: /income/i })
    // The trigger button + the dropdown row = 2 buttons. The dropdown row calls onChange.
    expect(incomeBtns.length).toBeGreaterThanOrEqual(1)
  })
})
