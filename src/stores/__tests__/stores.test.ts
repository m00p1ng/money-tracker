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

  it('writes wallets through to Dexie and blocks deleting wallets with transactions', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useWalletStore.getState().add({
      id: 'wallet-card',
      name: 'Visa',
      type: 'credit_card',
      currency: 'THB',
      balance: 0,
      creditLimit: 10000,
      color: '#ef4444',
      icon: 'fa-credit-card',
    })

    expect(await db.wallets.get('wallet-card')).toMatchObject({
      id: 'wallet-card',
      creditLimit: 10000,
    })
    expect(useWalletStore.getState().findById('wallet-card')?.creditLimit).toBe(10000)

    await useTransactionStore.getState().add({
      id: 'tx-card',
      type: 'expense',
      walletId: 'wallet-card',
      currency: 'THB',
      items: [{ categoryId: 'expense-shopping-clothes', amount: 500 }],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    await expect(useWalletStore.getState().remove('wallet-card')).rejects.toThrow('Wallet has existing transactions')
  })

  it('blocks deleting wallets used as transfer destinations', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useWalletStore.getState().add({
      id: 'wallet-card',
      name: 'Visa',
      type: 'credit_card',
      currency: 'THB',
      balance: 0,
      creditLimit: 10000,
      color: '#ef4444',
      icon: 'fa-credit-card',
    })
    await useTransactionStore.getState().add({
      id: 'tx-card',
      type: 'expense',
      walletId: 'wallet-cash',
      toWalletId: 'wallet-card',
      currency: 'THB',
      items: [{ categoryId: 'expense-shopping-clothes', amount: 500 }],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    await expect(useWalletStore.getState().remove('wallet-card')).rejects.toThrow('Wallet has existing transactions')
    expect(await db.wallets.get('wallet-card')).toBeDefined()
  })

  it('writes categories through to Dexie and blocks deleting parents with children', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCategoryStore.getState().add({
      id: 'expense-custom',
      name: 'Custom',
      type: 'expense',
      level: 1,
      icon: 'fa-tag',
      color: '#64748b',
      isDefault: false,
    })
    await useCategoryStore.getState().add({
      id: 'expense-custom-child',
      name: 'Custom Child',
      type: 'expense',
      parentId: 'expense-custom',
      level: 2,
      icon: 'fa-tag',
      color: '#64748b',
      isDefault: false,
    })

    expect(await db.categories.get('expense-custom')).toMatchObject({ id: 'expense-custom' })
    expect(useCategoryStore.getState().childrenOf('expense-custom')).toEqual([
      expect.objectContaining({ id: 'expense-custom-child' }),
    ])
    await expect(useCategoryStore.getState().remove('expense-custom')).rejects.toThrow('Category has child categories')
  })

  it('checks Dexie before deleting category parents when store state is stale', async () => {
    await seedDatabase()
    await bootstrapStores()

    await db.categories.bulkPut([
      {
        id: 'expense-custom',
        name: 'Custom',
        type: 'expense',
        level: 1,
        icon: 'fa-tag',
        color: '#64748b',
        isDefault: false,
      },
      {
        id: 'expense-custom-child',
        name: 'Custom Child',
        type: 'expense',
        parentId: 'expense-custom',
        level: 2,
        icon: 'fa-tag',
        color: '#64748b',
        isDefault: false,
      },
    ])
    useCategoryStore.setState({
      items: [...useCategoryStore.getState().items, (await db.categories.get('expense-custom'))!],
    })

    await expect(useCategoryStore.getState().remove('expense-custom')).rejects.toThrow('Category has child categories')
    expect(await db.categories.get('expense-custom')).toBeDefined()
  })

  it('validates category parents from Dexie when store state is stale', async () => {
    await seedDatabase()
    await bootstrapStores()

    useCategoryStore.setState({
      items: [
        ...useCategoryStore.getState().items,
        {
          id: 'expense-custom',
          name: 'Custom',
          type: 'expense',
          level: 1,
          icon: 'fa-tag',
          color: '#64748b',
          isDefault: false,
        },
      ],
    })

    await expect(
      useCategoryStore.getState().add({
        id: 'expense-custom-child',
        name: 'Custom Child',
        type: 'expense',
        parentId: 'expense-custom',
        level: 2,
        icon: 'fa-tag',
        color: '#64748b',
        isDefault: false,
      }),
    ).rejects.toThrow('Parent category does not exist')
    expect(await db.categories.get('expense-custom-child')).toBeUndefined()

    await expect(
      useCategoryStore.getState().update({
        id: 'expense-food-and-drink',
        name: 'Food & Drink',
        type: 'expense',
        parentId: 'expense-custom',
        level: 2,
        icon: 'fa-utensils',
        color: '#65a30d',
        isDefault: true,
      }),
    ).rejects.toThrow('Parent category does not exist')
  })

  it('blocks unsafe category hierarchy updates when children exist', async () => {
    await seedDatabase()
    await bootstrapStores()

    await expect(
      useCategoryStore.getState().update({
        id: 'expense-shopping',
        name: 'Shopping',
        type: 'income',
        level: 1,
        icon: 'fa-bag-shopping',
        color: '#db2777',
        isDefault: true,
      }),
    ).rejects.toThrow('Category has child categories')
    expect(await db.categories.get('expense-shopping')).toMatchObject({ type: 'expense', level: 1 })
  })

  it('writes currencies through to Dexie, sets the base currency, and blocks deleting it', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().add({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      isBase: false,
      rate: 36,
    })

    expect(await db.currencies.get('USD')).toMatchObject({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      rate: 36,
    })

    await useCurrencyStore.getState().setBase('USD')

    expect(await db.currencies.get('USD')).toMatchObject({ isBase: true, rate: 1 })
    expect(await db.currencies.get('THB')).toMatchObject({ isBase: false })
    expect(useCurrencyStore.getState().findByCode('USD')).toMatchObject({ isBase: true, rate: 1 })
    await expect(useCurrencyStore.getState().remove('USD')).rejects.toThrow('Base currency cannot be deleted')
  })

  it('sets exactly one base currency in Dexie when store state is stale', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().add({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      isBase: false,
      rate: 36,
    })
    await db.currencies.put({
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      isBase: true,
      rate: 39,
    })

    await useCurrencyStore.getState().setBase('USD')

    const currencies = await db.currencies.toArray()
    expect(currencies.filter((currency) => currency.isBase).map((currency) => currency.code)).toEqual(['USD'])
    expect(await db.currencies.get('USD')).toMatchObject({ isBase: true, rate: 1 })
    expect(await db.currencies.get('EUR')).toMatchObject({ isBase: false, rate: 39 })
    expect(useCurrencyStore.getState().items).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'EUR' })]))
  })

  it('checks Dexie before deleting base currencies when store state is stale', async () => {
    await seedDatabase()
    await bootstrapStores()

    await db.currencies.put({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      isBase: true,
      rate: 1,
    })

    await expect(useCurrencyStore.getState().remove('USD')).rejects.toThrow('Base currency cannot be deleted')
    expect(await db.currencies.get('USD')).toBeDefined()
  })
})
