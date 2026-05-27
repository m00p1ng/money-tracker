import keyBy from 'lodash/keyBy'
import { create } from 'zustand'

import { db } from '@/db/schema'
import type { Wallet } from '@/types/domain'

type WalletStore = {
  items: Wallet[]
  load: () => Promise<void>
  add: (wallet: Wallet) => Promise<void>
  update: (wallet: Wallet) => Promise<void>
  remove: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
  applyDelta: (id: string, delta: number) => Promise<void>
  findById: (id: string) => Wallet | undefined
}

function normalizeWallet(wallet: Wallet): Wallet {
  return { ...wallet, currency: wallet.currency.trim().toUpperCase() }
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  items: [],
  async load() {
    set({ items: await db.wallets.toArray() })
  },
  async add(wallet) {
    const normalized = normalizeWallet(wallet)
    await db.wallets.put(normalized)
    set({ items: [...get().items.filter((item) => item.id !== normalized.id), normalized] })
  },
  async update(wallet) {
    const normalized = normalizeWallet(wallet)
    await db.wallets.put(normalized)
    set({ items: [...get().items.filter((item) => item.id !== normalized.id), normalized] })
  },
  async remove(id) {
    const transactions = await db.transactions.toArray()
    if (transactions.some((transaction) => transaction.walletId === id || transaction.toWalletId === id)) {
      throw new Error('Wallet has existing transactions')
    }

    await db.wallets.delete(id)
    set({ items: get().items.filter((wallet) => wallet.id !== id) })
  },
  async reorder(ids) {
    const current = get().items
    const currentById = keyBy(current, 'id')
    const updated: Wallet[] = ids.flatMap((id, index) => {
      const wallet = currentById[id]
      if (!wallet) {
        return []
      }

      return [{ ...wallet, position: index }]
    })
    const updatedById = keyBy(updated, 'id')

    await db.wallets.bulkPut(updated)
    set({
      items: current.map((wallet) => updatedById[wallet.id] ?? wallet),
    })
  },
  async applyDelta(id, delta) {
    const wallet = get().items.find((item) => item.id === id)
    if (!wallet) {
      return
    }
    const updated = { ...wallet, balance: wallet.balance + delta }
    await db.wallets.put(updated)
    set({ items: get().items.map((item) => (item.id === id
      ? updated
      : item)) })
  },
  findById(id) {
    return get().items.find((wallet) => wallet.id === id)
  },
}))
