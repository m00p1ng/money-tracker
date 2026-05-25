import { render, screen } from '@testing-library/react'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { AnimatedBar } from '@/components'

describe('AnimatedBar', () => {
  it('uses the text color as the inactive progress color', () => {
    render(
      <AnimatedBar
        value={25}
        maxValue={100}
        colorFrom="var(--income)"
        colorTo="var(--income)"
        textColor="var(--income-text)"
        currency=""
      />,
    )

    expect(screen.getAllByText(/25\.00/)[0].parentElement).toHaveStyle({
      background: 'var(--income-text)',
    })
  })

  it('keeps the amount label readable without changing the filled percent', () => {
    render(
      <AnimatedBar
        value={46}
        maxValue={468}
        colorFrom="var(--income)"
        colorTo="var(--income)"
        textColor="var(--income-text)"
        currency="THB"
      />,
    )

    expect(screen.getAllByText(/46\.00/)).toHaveLength(2)
    expect(screen.getAllByText(/46\.00/)[0]).toHaveStyle({
      color: 'var(--income)',
      whiteSpace: 'nowrap',
    })
    expect(screen.getAllByText(/46\.00/)[1].parentElement).not.toHaveStyle({
      minWidth: 'max-content',
    })
    expect(screen.getAllByText(/46\.00/)[1].parentElement).toHaveAttribute('animate', '[object Object]')
    expect(screen.getAllByText(/46\.00/)[1]).toHaveStyle({
      minWidth: 'max-content',
      whiteSpace: 'nowrap',
    })
  })
})
