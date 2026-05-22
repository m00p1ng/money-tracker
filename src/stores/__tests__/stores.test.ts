import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/schema'
import { seedDatabase } from '../../db/seed'
import { bootstrapStores } from '../bootstrap'
import { useCategoryStore } from '../categoryStore'
import { useCurrencyStore } from '../currencyStore'
import { useSettingsStore } from '../settingsStore'
import { useTransactionStore } from '../transactionStore'
import { useWalletStore } from '../walletStore'

describe('stores', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    useTransactionStore.setState({ items: [] })
    useWalletStore.setState({ items: [] })
    useCategoryStore.setState({ items: [] })
    useCurrencyStore.setState({ items: [] })
    useSettingsStore.setState({ settings: undefined })
  })

  it('loads seeded data during bootstrap', async () => {
    await seedDatabase()
    await bootstrapStores()

    expect(useWalletStore.getState().items).toHaveLength(1)
    expect(useCategoryStore.getState().items.length).toBe(60)
    expect(useCurrencyStore.getState().items).toHaveLength(1)
    expect(useSettingsStore.getState().settings).toBeDefined()
  })

  it('writes transactions through to Dexie and exposes selectors', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useTransactionStore.getState().add({
      id: 'tx-1',
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 28 }],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    expect(await db.transactions.count()).toBe(1)
    expect(useTransactionStore.getState().monthlyExpense()).toBe(28)
    expect(useTransactionStore.getState().monthlyIncome()).toBe(0)
    expect(useTransactionStore.getState().todayTransactions()).toHaveLength(1)
  })
})
