import { act, renderHook } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  useCurrencyStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'
import type {
  Currency,
  Transaction,
  Wallet,
} from '@/types/domain'

import { useWalletEditPage } from '../useWalletEditPage'

const currency: Currency = {
  code: 'THB',
  symbol: '฿',
  name: 'Thai Baht',
  isBase: true,
  rate: 1,
}

const existingWallet: Wallet = {
  id: 'wallet-1',
  name: 'Cash',
  type: 'payment',
  currency: 'THB',
  balance: 0,
  color: '#10b981',
  icon: 'fa-wallet',
}

function wrapperNew({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/balance/wallets/new']}>
      <Routes>
        <Route path="/balance/wallets/new" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  )
}

function wrapperEdit({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={[`/balance/wallets/${existingWallet.id}`]}>
      <Routes>
        <Route path="/balance/wallets/:id" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('useWalletEditPage', () => {
  afterEach(() => {
    useTransactionStore.setState({ items: [] })
    useWalletStore.setState({ items: [] })
    useCurrencyStore.setState({ items: [] })
  })

  it('creates wallet with balance=0 and opening balance adjustment transaction', async () => {
    useCurrencyStore.setState({ items: [currency] })
    const { result } = renderHook(() => useWalletEditPage(), { wrapper: wrapperNew })

    expect(result.current).not.toBeNull()

    await act(async () => {
      result.current!.onChangeName('My Wallet')
      result.current!.onChangeBalance(500)
    })

    await act(async () => {
      await result.current!.onSubmit()
    })

    const wallets = useWalletStore.getState().items
    expect(wallets).toHaveLength(1)
    expect(wallets[0].balance).toBe(0)
    expect(wallets[0].name).toBe('My Wallet')

    const txs = useTransactionStore.getState().items
    expect(txs).toHaveLength(1)
    expect(txs[0].type).toBe('adjustment')
    expect(txs[0].items[0].amount).toBe(500)
    expect(txs[0].items[0].categoryId).toBe('adjustment-opening-balance')
    expect(txs[0].walletId).toBe(wallets[0].id)
  })

  it('creates no transaction when new wallet has balance=0', async () => {
    useCurrencyStore.setState({ items: [currency] })
    const { result } = renderHook(() => useWalletEditPage(), { wrapper: wrapperNew })

    await act(async () => {
      result.current!.onChangeName('Empty Wallet')
    })

    await act(async () => {
      await result.current!.onSubmit()
    })

    expect(useTransactionStore.getState().items).toHaveLength(0)
  })

  it('creates diff adjustment transaction when editing wallet balance', async () => {
    useWalletStore.setState({ items: [existingWallet] })
    useCurrencyStore.setState({ items: [currency] })

    const openingTx: Transaction = {
      id: 'tx-opening',
      type: 'adjustment',
      walletId: existingWallet.id,
      currency: 'THB',
      items: [{ categoryId: 'adjustment-opening-balance', amount: 100 }],
      date: '2026-05-01T00:00:00.000Z',
      createdAt: '2026-05-01T00:00:00.000Z',
    }
    useTransactionStore.setState({ items: [openingTx] })

    const { result } = renderHook(() => useWalletEditPage(), { wrapper: wrapperEdit })

    expect(result.current).not.toBeNull()
    // form.balance should be initialized to walletCurrentAmount = 0 + 100 = 100
    expect(result.current!.form.balance).toBe(100)

    await act(async () => {
      result.current!.onChangeBalance(70)
    })

    await act(async () => {
      await result.current!.onSubmit()
    })

    const txs = useTransactionStore.getState().items
    const adjTxs = txs.filter((t) => t.items[0]?.categoryId === 'adjustment-balance-adjustment')
    expect(adjTxs).toHaveLength(1)
    expect(adjTxs[0].type).toBe('adjustment')
    expect(adjTxs[0].items[0].amount).toBe(-30)
  })

  it('creates no transaction when editing wallet balance is unchanged', async () => {
    useWalletStore.setState({ items: [existingWallet] })
    useCurrencyStore.setState({ items: [currency] })
    useTransactionStore.setState({ items: [] })

    const { result } = renderHook(() => useWalletEditPage(), { wrapper: wrapperEdit })

    // Do not change balance — just change the name
    await act(async () => {
      result.current!.onChangeName('Renamed Wallet')
    })

    const txCountBefore = useTransactionStore.getState().items.length

    await act(async () => {
      await result.current!.onSubmit()
    })

    expect(useTransactionStore.getState().items).toHaveLength(txCountBefore)
  })
})
