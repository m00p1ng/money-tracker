import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { Switch } from '@/components'

describe('SwitchField', () => {
  it('renders label and description', () => {
    render(
      <Switch
        checked={false}
        description="Include this wallet in reconciliation checks"
        label="Reconciliation"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Reconciliation')).toBeInTheDocument()
    expect(screen.getByText('Include this wallet in reconciliation checks')).toBeInTheDocument()
  })

  it('calls onChange with next checked value', async () => {
    const onChange = vi.fn()

    render(
      <Switch
        checked={false}
        label="Reconciliation"
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Reconciliation' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})
