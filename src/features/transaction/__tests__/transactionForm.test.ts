import {
  describe,
  expect,
  it,
} from 'vitest'

import { buildTransaction, validateDraft } from '@/features/transaction/transactionForm'

describe('transactionForm', () => {
  it('rejects drafts without category items', () => {
    expect(
      validateDraft({
        type: 'expense',
        walletId: 'wallet-cash',
        items: [],
      }),
    ).toEqual(['Add at least one category'])
  })

  it('rejects drafts without walletId', () => {
    expect(
      validateDraft({ type: 'expense', items: [{ categoryId: 'expense-food', amount: 28 }] }),
    ).toContain('Select a wallet')
  })

  it('accepts zero category item amounts', () => {
    expect(
      validateDraft({
        type: 'expense',
        walletId: 'wallet-cash',
        items: [{ categoryId: 'expense-food', amount: 0 }],
      }),
    ).toEqual([])
  })

  it('accepts valid drafts', () => {
    expect(
      validateDraft({
        type: 'expense',
        walletId: 'wallet-cash',
        items: [{ categoryId: 'expense-food', amount: 28 }],
      }),
    ).toEqual([])
  })

  it('accepts valid income drafts', () => {
    expect(
      validateDraft({
        type: 'income',
        walletId: 'wallet-cash',
        items: [{ categoryId: 'income-salary', amount: 500 }],
      }),
    ).toEqual([])
  })

  it('accepts negative category item amounts', () => {
    expect(
      validateDraft({
        type: 'expense',
        walletId: 'wallet-cash',
        items: [{ categoryId: 'expense-food', amount: -28 }],
      }),
    ).toEqual([])
  })

  it('accepts legacy expense drafts without explicit type', () => {
    expect(validateDraft({ walletId: 'wallet-cash', items: [{ categoryId: 'expense-food', amount: 28 }] })).toEqual([])
  })

  it('builds a transaction object for saving', () => {
    const transaction = buildTransaction({
      id: undefined,
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 28 }],
      date: '2026-05-22T10:30',
      note: 'latte',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-1',
    })

    expect(transaction).toMatchObject({
      id: 'tx-1',
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      createdAt: '2026-05-22T10:31:00.000Z',
    })
    expect(transaction.items[0].amount).toBe(28)
  })

  it('does not copy stale transfer-only fields onto expense or income transactions', () => {
    for (const type of ['expense', 'income'] as const) {
      const transaction = buildTransaction({
        type,
        walletId: 'wallet-cash',
        toWalletId: 'wallet-usd',
        currency: 'THB',
        exchangeRate: 36.1234,
        toExchangeRate: 1,
        items: [{ categoryId: type === 'expense'
          ? 'expense-food'
          : 'income-salary',
        amount: 28 }],
        date: '2026-05-22T10:30',
        now: '2026-05-22T10:31:00.000Z',
        createId: () => `tx-${type}`,
      })

      expect(transaction).not.toHaveProperty('toWalletId')
      expect(transaction).not.toHaveProperty('exchangeRate')
      expect(transaction).not.toHaveProperty('toExchangeRate')
    }
  })

  it('uses provided id when given', () => {
    const transaction = buildTransaction({
      id: 'tx-provided',
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: 'latte',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-generated',
    })
    expect(transaction.id).toBe('tx-provided')
  })

  it('generates id when not provided', () => {
    const transaction = buildTransaction({
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: 'latte',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-generated',
    })
    expect(transaction.id).toBe('tx-generated')
    expect(transaction.status).toBe('paid')
  })

  it('trims note and falls back to undefined when empty', () => {
    const withSpaces = buildTransaction({
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: '  latte  ',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-1',
    })
    expect(withSpaces.note).toBe('latte')

    const empty = buildTransaction({
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: '   ',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-1',
    })
    expect(empty.note).toBeUndefined()
  })

  it('builds a planned transfer transaction for saving', () => {
    const transaction = buildTransaction({
      type: 'transfer',
      walletId: 'wallet-thb',
      toWalletId: 'wallet-usd',
      currency: 'USD',
      exchangeRate: 36.1234,
      toExchangeRate: 1,
      transferAmount: 25,
      items: [],
      date: '2026-05-24T10:00',
      markedPaid: false,
      repeat: { preset: 'monthly' },
      now: '2026-05-23T10:00:00.000Z',
      createId: () => 'tx-transfer',
    })

    expect(transaction).toMatchObject({
      id: 'tx-transfer',
      type: 'transfer',
      walletId: 'wallet-thb',
      toWalletId: 'wallet-usd',
      currency: 'USD',
      exchangeRate: 36.1234,
      toExchangeRate: 1,
      status: 'planned',
      repeat: { preset: 'monthly' },
      items: [{ categoryId: 'transfer', amount: 25 }],
    })
  })

  it('drops repeat from paid transfers', () => {
    const transaction = buildTransaction({
      type: 'transfer',
      walletId: 'wallet-thb',
      toWalletId: 'wallet-usd',
      currency: 'USD',
      transferAmount: 25,
      items: [],
      date: '2026-05-24T10:00',
      markedPaid: true,
      repeat: { preset: 'monthly' },
      now: '2026-05-23T10:00:00.000Z',
      createId: () => 'tx-paid-transfer',
    })

    expect(transaction.status).toBe('paid')
    expect(transaction.repeat).toBeUndefined()
  })
})
