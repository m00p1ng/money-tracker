import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { DateRangeHeader } from '../DateRangeHeader'

const range = { start: '2026-05-01', end: '2026-05-31' }

describe('DateRangeHeader', () => {
  it('renders begin and end dates', () => {
    render(
      <DateRangeHeader
        range={range}
        onClickStart={vi.fn()}
        onClickEnd={vi.fn()}
        onOpenPreset={vi.fn()}
      />,
    )

    expect(screen.getByText('1 May 2026')).toBeInTheDocument()
    expect(screen.getByText('31 May 2026')).toBeInTheDocument()
  })

  it('calls onClickStart when Begin button is tapped', async () => {
    const user = userEvent.setup()
    const onClickStart = vi.fn()

    render(
      <DateRangeHeader
        range={range}
        onClickStart={onClickStart}
        onClickEnd={vi.fn()}
        onOpenPreset={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Begin' }))
    expect(onClickStart).toHaveBeenCalledTimes(1)
  })

  it('calls onClickEnd when End button is tapped', async () => {
    const user = userEvent.setup()
    const onClickEnd = vi.fn()

    render(
      <DateRangeHeader
        range={range}
        onClickStart={vi.fn()}
        onClickEnd={onClickEnd}
        onOpenPreset={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'End' }))
    expect(onClickEnd).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenPreset when ellipsis button is tapped', async () => {
    const user = userEvent.setup()
    const onOpenPreset = vi.fn()

    render(
      <DateRangeHeader
        range={range}
        onClickStart={vi.fn()}
        onClickEnd={vi.fn()}
        onOpenPreset={onOpenPreset}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'More date range options' }))
    expect(onOpenPreset).toHaveBeenCalledTimes(1)
  })
})
