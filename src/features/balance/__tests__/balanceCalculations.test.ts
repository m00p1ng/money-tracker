import { describe, expect, it } from 'vitest'
import type { Transaction, Wallet } from '../../../types/domain'
import { assetsTotal, debtTotal, walletCurrentAmount, walletRunningRows, walletTransactions } from '../balanceCalculations'

const wallets: Wallet[] = [
  { id: 'cash', name: 'Cash', type: 'payment', currency: 'THB', balance: 1000, color: '#10b981', icon: 'fa-wallet' },
  { id: 'card', name: 'Card', type: 'credit_card', currency: 'THB', balance: 0, creditLimit: 5000, color: '#ef4444', icon: 'fa-credit-card' },
]

const transactions: Transaction[] = [
  { id: 'old-expense', type: 'expense', walletId: 'cash', currency: 'THB', items: [{ categoryId: 'food', amount: 100 }], date: '2026-05-01T08:00:00.000Z', createdAt: '2026-05-01T08:00:00.000Z' },
  { id: 'income', type: 'income', walletId: 'cash', currency: 'THB', items: [{ categoryId: 'salary', amount: 500 }], date: '2026-05-02T08:00:00.000Z', createdAt: '2026-05-02T08:00:00.000Z' },
  { id: 'card-expense', type: 'expense', walletId: 'card', currency: 'THB', items: [{ categoryId: 'shopping', amount: 750 }], date: '2026-05-03T08:00:00.000Z', createdAt: '2026-05-03T08:00:00.000Z' },
  { id: 'card-payment', type: 'income', walletId: 'card', currency: 'THB', items: [{ categoryId: 'refund', amount: 250 }], date: '2026-05-04T08:00:00.000Z', createdAt: '2026-05-04T08:00:00.000Z' },
]

describe('balance calculations', () => {
  it('calculates payment wallet current balance', () => {
    expect(walletCurrentAmount(wallets[0], transactions)).toBe(1400)
  })

  it('calculates credit card current debt as positive owed amount', () => {
    expect(walletCurrentAmount(wallets[1], transactions)).toBe(500)
  })

  it('calculates total assets and debt', () => {
    expect(assetsTotal(wallets, transactions)).toBe(1400)
    expect(debtTotal(wallets, transactions)).toBe(500)
  })

  it('filters transactions by wallet and date range', () => {
    expect(walletTransactions('cash', transactions, { start: '2026-05-02', end: '2026-05-31' }).map((tx) => tx.id)).toEqual(['income'])
  })

  it('returns newest-first running payment balances computed oldest-to-newest', () => {
    expect(walletRunningRows(wallets[0], transactions, { start: '2026-05-01', end: '2026-05-31' }).map((row) => [row.transaction.id, row.runningAmount])).toEqual([
      ['income', 1400],
      ['old-expense', 900],
    ])
  })
})
