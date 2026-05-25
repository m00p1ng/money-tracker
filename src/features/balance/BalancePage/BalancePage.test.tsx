import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { BalancePage } from './BalancePage'

vi.mock('@/components', async () => {
  const actual = await vi.importActual<typeof import('@/components')>('@/components')

  return {
    ...actual,
    AnimatedBar: ({
      value,
      maxValue,
      colorFrom,
      colorTo,
      textColor,
    }: {
      value: number
      maxValue: number
      colorFrom: string
      colorTo: string
      textColor: string
    }) => {
      const width = maxValue > 0
        ? `${Math.min((value / maxValue) * 100, 100)}%`
        : '0%'

      const id = colorFrom === 'var(--income)'
        ? 'bar-income'
        : 'bar-expense'

      return (
        <div
          data-testid={id}
          data-max-value={maxValue}
          style={{
            background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
            color: textColor,
            width,
          }}
        />
      )
    },
  }
})

describe('BalancePage', () => {
  it('uses income and expense colors for asset and debt bars', () => {
    render(
      <MemoryRouter>
        <BalancePage
          paymentWallets={[]}
          creditCards={[]}
          assets={1000}
          debt={250}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({
      background: 'linear-gradient(to right, var(--income), var(--income))',
      color: 'var(--income-text)',
    })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({
      background: 'linear-gradient(to right, var(--expense), var(--expense))',
      color: 'var(--expense-text)',
    })
  })

  it('scales bars against the largest balance amount', () => {
    render(
      <MemoryRouter>
        <BalancePage
          paymentWallets={[]}
          creditCards={[]}
          assets={1000}
          debt={250}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({ width: '100%' })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({ width: '25%' })
  })

  it('scales assets against debt when debt is the largest amount', () => {
    render(
      <MemoryRouter>
        <BalancePage
          paymentWallets={[]}
          creditCards={[]}
          assets={250}
          debt={1000}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({ width: '25%' })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({ width: '100%' })
  })

  it('shows a zero-width bar when the amount is 0', () => {
    render(
      <MemoryRouter>
        <BalancePage
          paymentWallets={[]}
          creditCards={[]}
          assets={0}
          debt={0}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('bar-income')).toHaveStyle({ width: '0%' })
    expect(screen.getByTestId('bar-expense')).toHaveStyle({ width: '0%' })
  })
})
