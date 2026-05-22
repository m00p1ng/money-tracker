import { create } from 'zustand'
import { db } from '../db/schema'
import type { Currency } from '../types/domain'

type CurrencyStore = {
  items: Currency[]
  load: () => Promise<void>
  add: (currency: Currency) => Promise<void>
  update: (currency: Currency) => Promise<void>
  remove: (code: string) => Promise<void>
  setBase: (code: string) => Promise<void>
  findByCode: (code: string) => Currency | undefined
}

function normalizeCurrency(currency: Currency): Currency {
  const normalized = {
    ...currency,
    code: currency.code.trim().toUpperCase(),
    symbol: currency.symbol.trim(),
    name: currency.name.trim(),
  }

  if (!normalized.code) throw new Error('Currency code is required')
  if (!normalized.symbol) throw new Error('Currency symbol is required')
  if (!normalized.name) throw new Error('Currency name is required')
  if (normalized.rate <= 0) throw new Error('Currency rate must be positive')

  return normalized.isBase ? { ...normalized, rate: 1 } : normalized
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  items: [],
  async load() {
    set({ items: await db.currencies.toArray() })
  },
  async add(currency) {
    const incoming = normalizeCurrency(currency)
    const existing = await db.currencies.get(incoming.code)
    const normalized = existing?.isBase ? { ...incoming, isBase: true, rate: 1 } : incoming
    await db.currencies.put(normalized)
    set({ items: [...get().items.filter((item) => item.code !== normalized.code), normalized] })
    if (normalized.isBase) await get().setBase(normalized.code)
  },
  async update(currency) {
    const existing = await db.currencies.get(currency.code.trim().toUpperCase())
    const normalized = normalizeCurrency(existing?.isBase ? { ...currency, isBase: true } : currency)
    await db.currencies.put(normalized)
    set({ items: [...get().items.filter((item) => item.code !== normalized.code), normalized] })
    if (normalized.isBase) await get().setBase(normalized.code)
  },
  async remove(code) {
    const normalizedCode = code.trim().toUpperCase()
    const currency = await db.currencies.get(normalizedCode)
    if (currency?.isBase) throw new Error('Base currency cannot be deleted')

    const wallets = await db.wallets.toArray()
    if (wallets.some((wallet) => wallet.currency.trim().toUpperCase() === normalizedCode)) {
      throw new Error('Currency is used by wallets')
    }

    await db.currencies.delete(normalizedCode)
    set({ items: get().items.filter((currency) => currency.code !== normalizedCode) })
  },
  async setBase(code) {
    const normalizedCode = code.trim().toUpperCase()
    const currencies = await db.currencies.toArray()
    if (!currencies.some((currency) => currency.code === normalizedCode)) throw new Error('Currency not found')

    const items = currencies.map((currency) => ({
      ...currency,
      isBase: currency.code === normalizedCode,
      rate: currency.code === normalizedCode ? 1 : currency.rate,
    }))

    await db.currencies.bulkPut(items)
    set({ items })
  },
  findByCode(code) {
    const normalizedCode = code.trim().toUpperCase()
    return get().items.find((currency) => currency.code === normalizedCode)
  },
}))
