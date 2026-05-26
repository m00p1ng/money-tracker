import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { db } from '@/db/schema'
import { useWalletStore } from '@/stores'
import type { Wallet } from '@/types/domain'

function makeWallet(id: string, type: 'payment' | 'credit_card' = 'payment'): Wallet {
  return {
    id,
    name: `Wallet ${id}`,
    type,
    currency: 'THB',
    balance: 0,
    color: '#10b981',
    icon: 'fa-wallet',
  }
}

describe('walletStore.reorder', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    useWalletStore.setState({ items: [] })
  })

  it('assigns position by array index and persists to db', async () => {
    const store = useWalletStore.getState()
    await store.add(makeWallet('w-a'))
    await store.add(makeWallet('w-b'))
    await store.add(makeWallet('w-c'))

    await store.reorder(['w-c', 'w-a', 'w-b'])

    const items = useWalletStore.getState().items
    expect(items.find((w) => w.id === 'w-c')?.position).toBe(0)
    expect(items.find((w) => w.id === 'w-a')?.position).toBe(1)
    expect(items.find((w) => w.id === 'w-b')?.position).toBe(2)

    const fromDb = await db.wallets.toArray()
    expect(fromDb.find((w) => w.id === 'w-c')?.position).toBe(0)
    expect(fromDb.find((w) => w.id === 'w-a')?.position).toBe(1)
    expect(fromDb.find((w) => w.id === 'w-b')?.position).toBe(2)
  })

  it('only updates wallets in the provided ids list', async () => {
    const store = useWalletStore.getState()
    await store.add(makeWallet('w-pay-1'))
    await store.add(makeWallet('w-pay-2'))
    await store.add(makeWallet('w-card-1', 'credit_card'))

    await store.reorder(['w-pay-2', 'w-pay-1'])

    const items = useWalletStore.getState().items
    expect(items.find((w) => w.id === 'w-card-1')?.position).toBeUndefined()
  })
})
