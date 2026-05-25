import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { WalletDetailPage } from '@/features/balance/WalletDetailPage/WalletDetailPage'
import type { Wallet } from '@/types/domain'

const wallet: Wallet = {
  id: 'wallet-cash',
  name: 'Cash',
  type: 'payment',
  currency: 'THB',
  balance: 0,
  color: '#10b981',
  icon: 'fa-wallet',
}

function renderPage(props: Partial<React.ComponentProps<typeof WalletDetailPage>> = {}) {
  const onAdd = vi.fn()
  const onBack = vi.fn()
  const onSearch = vi.fn()
  const onToggleCleared = vi.fn()

  render(
    <WalletDetailPage
      categories={[]}
      clearedAmount={0}
      currentAmount={0}
      onAdd={onAdd}
      onBack={onBack}
      onSearch={onSearch}
      onToggleCleared={onToggleCleared}
      transactions={[]}
      wallet={wallet}
      {...props}
    />,
  )

  return {
    onAdd,
    onSearch,
  }
}

describe('WalletDetailPage', () => {
  it('renders search and add actions in the page title', async () => {
    const user = userEvent.setup()
    const { onAdd, onSearch } = renderPage()

    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(screen.getByRole('button', { name: 'Add transaction' }))

    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledTimes(1)
  })
})
