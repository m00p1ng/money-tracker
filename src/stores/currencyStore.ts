import { create } from 'zustand'
import { db } from '../db/schema'
import type { Currency } from '../types/domain'

type CurrencyStore = {
  items: Currency[]
  load: () => Promise<void>
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  items: [],
  async load() {
    set({ items: await db.currencies.toArray() })
  },
}))
