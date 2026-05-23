import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/db/schema'
import { seedDatabase } from '@/db/seed'
import { bootstrapStores } from '@/stores/bootstrap'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWalletStore } from '@/stores/walletStore'
import type { Transaction } from '@/types/domain'

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    type: 'expense',
    walletId: 'wallet-cash',
    currency: 'THB',
    items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 100 }],
    date: '2026-02-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

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

  it('materializes repeat occurrences once and writes through to Dexie', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useTransactionStore.getState().add(
      transaction({
        id: 'tx-rent',
        date: '2026-01-31T08:45:00.000Z',
        status: 'planned',
        repeat: { preset: 'monthly' },
      }),
    )

    const materialized = await useTransactionStore
      .getState()
      .materializeRepeatOccurrence('tx-rent', '2026-02-28', () => 'tx-rent-feb', '2026-02-28T09:00:00.000Z')

    expect(materialized).toMatchObject({
      id: 'tx-rent-feb',
      status: 'paid',
      repeatSourceId: 'tx-rent',
      repeatOccurrenceDate: '2026-02-28',
      createdAt: '2026-02-28T09:00:00.000Z',
    })
    expect(await db.transactions.get('tx-rent-feb')).toMatchObject({
      id: 'tx-rent-feb',
      repeatSourceId: 'tx-rent',
      repeatOccurrenceDate: '2026-02-28',
    })
    expect(useTransactionStore.getState().findById('tx-rent-feb')).toMatchObject({ id: 'tx-rent-feb' })

    const deduped = await useTransactionStore
      .getState()
      .materializeRepeatOccurrence('tx-rent', '2026-02-28', () => 'tx-duplicate', '2026-02-28T10:00:00.000Z')

    expect(deduped.id).toBe('tx-rent-feb')
    expect(await db.transactions.count()).toBe(2)
    expect(useTransactionStore.getState().findById('tx-duplicate')).toBeUndefined()
  })

  it('exposes upcoming transactions with overdue first, planned cutoff, and virtual repeats', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useTransactionStore.getState().add(
      transaction({
        id: 'planned-today',
        date: '2026-02-10',
        status: 'planned',
      }),
    )
    await useTransactionStore.getState().add(
      transaction({
        id: 'planned-tomorrow',
        date: '2026-02-11',
        status: 'planned',
      }),
    )
    await useTransactionStore.getState().add(
      transaction({
        id: 'planned-too-late',
        date: '2026-02-12',
        status: 'planned',
      }),
    )
    await useTransactionStore.getState().add(
      transaction({
        id: 'overdue-newer',
        date: '2026-02-09',
        status: 'overdue',
      }),
    )
    await useTransactionStore.getState().add(
      transaction({
        id: 'overdue-older',
        date: '2026-02-01',
        status: 'overdue',
      }),
    )
    await useTransactionStore.getState().add(
      transaction({
        id: 'repeat-source',
        date: '2026-02-10',
        status: 'planned',
        repeat: { preset: 'daily' },
      }),
    )

    const upcoming = useTransactionStore.getState().upcomingTransactions(new Date('2026-02-10T12:00:00.000Z'))

    expect(upcoming.map((row) => row.id).slice(0, 2)).toEqual(['overdue-older', 'overdue-newer'])
    expect(upcoming).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'real', id: 'planned-today', date: '2026-02-10' }),
        expect.objectContaining({ kind: 'real', id: 'planned-tomorrow', date: '2026-02-11' }),
        expect.objectContaining({ kind: 'virtual-repeat', id: 'repeat:repeat-source:2026-02-11', date: '2026-02-11' }),
      ]),
    )
    expect(upcoming.find((row) => row.id === 'planned-too-late')).toBeUndefined()
    expect(upcoming.every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date))).toBe(true)
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

  it('writes wallet updates through to Dexie and state', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useWalletStore.getState().update({
      id: 'wallet-cash',
      name: 'Petty Cash',
      type: 'payment',
      currency: 'THB',
      balance: 1500,
      color: '#10b981',
      icon: 'fa-wallet',
    })

    expect(await db.wallets.get('wallet-cash')).toMatchObject({ name: 'Petty Cash', balance: 1500 })
    expect(useWalletStore.getState().findById('wallet-cash')).toMatchObject({ name: 'Petty Cash', balance: 1500 })
  })

  it('keeps state in sync when updating rows missing from store state', async () => {
    await seedDatabase()
    await bootstrapStores()

    await db.wallets.put({
      id: 'wallet-card',
      name: 'Visa',
      type: 'credit_card',
      currency: 'THB',
      balance: 0,
      creditLimit: 10000,
      color: '#ef4444',
      icon: 'fa-credit-card',
    })
    await db.categories.put({
      id: 'expense-custom',
      name: 'Custom',
      type: 'expense',
      level: 1,
      icon: 'fa-tag',
      color: '#64748b',
      isDefault: false,
    })
    await db.currencies.put({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      isBase: false,
      rate: 36,
    })
    useWalletStore.setState({ items: [] })
    useCategoryStore.setState({ items: [] })
    useCurrencyStore.setState({ items: [] })

    await useWalletStore.getState().update({
      id: 'wallet-card',
      name: 'Rewards Visa',
      type: 'credit_card',
      currency: 'THB',
      balance: 250,
      creditLimit: 10000,
      color: '#ef4444',
      icon: 'fa-credit-card',
    })
    await useCategoryStore.getState().update({
      id: 'expense-custom',
      name: 'Custom Updated',
      type: 'expense',
      level: 1,
      icon: 'fa-tag',
      color: '#ef4444',
      isDefault: false,
    })
    await useCurrencyStore.getState().update({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar Updated',
      isBase: false,
      rate: 35,
    })

    expect(useWalletStore.getState().findById('wallet-card')).toMatchObject({ name: 'Rewards Visa', balance: 250 })
    expect(useCategoryStore.getState().findById('expense-custom')).toMatchObject({
      name: 'Custom Updated',
      color: '#ef4444',
    })
    expect(useCurrencyStore.getState().findByCode('USD')).toMatchObject({ name: 'US Dollar Updated', rate: 35 })
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

  it('blocks deleting categories used by transactions', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useTransactionStore.getState().add({
      id: 'tx-card',
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-shopping-clothes', amount: 500 }],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    await expect(useCategoryStore.getState().remove('expense-shopping-clothes')).rejects.toThrow(
      'Category has existing transactions',
    )
    expect(await db.categories.get('expense-shopping-clothes')).toBeDefined()
  })

  it('exposes category type and parent selectors', async () => {
    await seedDatabase()
    await bootstrapStores()

    const expenseCategories = useCategoryStore.getState().byType('expense')
    const incomeCategories = useCategoryStore.getState().byType('income')
    const child = useCategoryStore.getState().findById('expense-shopping-clothes')!

    expect(expenseCategories).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'expense-shopping' })]))
    expect(incomeCategories).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'income-salary' })]))
    expect(useCategoryStore.getState().parentOf(child)).toMatchObject({ id: 'expense-shopping' })
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

  it('blocks duplicate category adds from structurally mutating parents with children', async () => {
    await seedDatabase()
    await bootstrapStores()

    await expect(
      useCategoryStore.getState().add({
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

  it('writes non-structural category updates through to Dexie and state', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCategoryStore.getState().update({
      id: 'expense-shopping',
      name: 'Retail',
      type: 'expense',
      level: 1,
      icon: 'fa-bag-shopping',
      color: '#ef4444',
      isDefault: true,
    })

    expect(await db.categories.get('expense-shopping')).toMatchObject({ name: 'Retail', color: '#ef4444' })
    expect(useCategoryStore.getState().findById('expense-shopping')).toMatchObject({
      name: 'Retail',
      color: '#ef4444',
    })
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

  it('normalizes currency code and base rate when adding currencies', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().add({
      code: ' usd ',
      symbol: '$',
      name: 'US Dollar',
      isBase: true,
      rate: 36,
    })

    expect(await db.currencies.get('USD')).toMatchObject({ code: 'USD', isBase: true, rate: 1 })
    expect(useCurrencyStore.getState().findByCode(' usd ')).toMatchObject({ code: 'USD', isBase: true, rate: 1 })
    expect(await db.currencies.get('THB')).toMatchObject({ isBase: false })
  })

  it('preserves current base when adding a duplicate base code as non-base', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().add({
      code: 'THB',
      symbol: '฿',
      name: 'Thai Baht',
      isBase: false,
      rate: 36,
    })

    const currencies = await db.currencies.toArray()
    expect(currencies.filter((currency) => currency.isBase).map((currency) => currency.code)).toEqual(['THB'])
    expect(await db.currencies.get('THB')).toMatchObject({ isBase: true, rate: 1 })
    expect(useCurrencyStore.getState().findByCode('THB')).toMatchObject({ isBase: true, rate: 1 })
  })

  it('blocks deleting currencies used by wallets', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().add({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      isBase: false,
      rate: 36,
    })
    await useWalletStore.getState().update({
      id: 'wallet-cash',
      name: 'Cash',
      type: 'payment',
      currency: 'USD',
      balance: 0,
      color: '#10b981',
      icon: 'fa-wallet',
    })

    await expect(useCurrencyStore.getState().remove('USD')).rejects.toThrow('Currency is used by wallets')
    expect(await db.currencies.get('USD')).toBeDefined()
  })

  it('blocks deleting currencies used by wallets with non-normalized currency text', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().add({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      isBase: false,
      rate: 36,
    })
    await db.wallets.put({
      id: 'wallet-cash',
      name: 'Cash',
      type: 'payment',
      currency: ' usd ',
      balance: 0,
      color: '#10b981',
      icon: 'fa-wallet',
    })

    await expect(useCurrencyStore.getState().remove('USD')).rejects.toThrow('Currency is used by wallets')
    expect(await db.currencies.get('USD')).toBeDefined()
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

  it('keeps the current base currency base when updated with isBase false', async () => {
    await seedDatabase()
    await bootstrapStores()

    await useCurrencyStore.getState().update({
      code: 'THB',
      symbol: '฿',
      name: 'Thai Baht',
      isBase: false,
      rate: 36,
    })

    expect(await db.currencies.get('THB')).toMatchObject({ isBase: true, rate: 1 })
    expect(useCurrencyStore.getState().findByCode('THB')).toMatchObject({ isBase: true, rate: 1 })
  })
})
