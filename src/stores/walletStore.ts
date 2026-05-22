import { create } from 'zustand'
import { db } from '../db/schema'
import type { Wallet } from '../types/domain'

type WalletStore = {
  items: Wallet[]
  load: () => Promise<void>
  add: (wallet: Wallet) => Promise<void>
  update: (wallet: Wallet) => Promise<void>
  remove: (id: string) => Promise<void>
  findById: (id: string) => Wallet | undefined
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  items: [],
  async load() {
    set({ items: await db.wallets.toArray() })
  },
  async add(wallet) {
    await db.wallets.put(wallet)
    set({ items: [...get().items.filter((item) => item.id !== wallet.id), wallet] })
  },
  async update(wallet) {
    await db.wallets.put(wallet)
    set({ items: get().items.map((item) => (item.id === wallet.id ? wallet : item)) })
  },
  async remove(id) {
    const transactionCount = await db.transactions.where('walletId').equals(id).count()
    if (transactionCount > 0) throw new Error('Wallet has existing transactions')

    await db.wallets.delete(id)
    set({ items: get().items.filter((wallet) => wallet.id !== id) })
  },
  findById(id) {
    return get().items.find((wallet) => wallet.id === id)
  },
}))
