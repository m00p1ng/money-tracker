import { create } from 'zustand'
import { db } from '../db/schema'
import type { Wallet } from '../types/domain'

type WalletStore = {
  items: Wallet[]
  load: () => Promise<void>
}

export const useWalletStore = create<WalletStore>((set) => ({
  items: [],
  async load() {
    set({ items: await db.wallets.toArray() })
  },
}))
