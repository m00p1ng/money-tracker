import { render, screen } from '@testing-library/react'
import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Wallet } from '@/types/domain'

import { CreditCardStats } from './CreditCardStats'

const wallet: Wallet = {
  id: 'wallet-card',
  name: 'Card',
  type: 'credit',
  currency: 'USD',
  balance: 0,
  creditLimit: 1000,
  color: '#6c47ff',
  icon: 'fa-credit-card',
}

describe('CreditCardStats', () => {
  it('uses theme colors for the cleared debt bar', () => {
    render(
      <CreditCardStats
        wallet={wallet}
        currentAmount={500}
        clearedAmount={200}
        reconciliation
      />,
    )

    const activeBar = screen
      .getAllByText('$200.00')
      .find((element) => element.parentElement?.getAttribute('animate') === '[object Object]')
      ?.parentElement

    expect(activeBar).toHaveStyle({
      background: 'linear-gradient(to right, var(--accent-btn-1), var(--accent-btn-2))',
    })
  })
})
