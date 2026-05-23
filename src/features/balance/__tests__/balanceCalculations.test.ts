import { describe, expect, it } from 'vitest'

import { amountInWalletCurrency, assetsTotal, debtTotal, walletCurrentAmount, walletRunningRows, walletTransactions } from '@/features/balance/balanceCalculations'
import type { Transaction, Wallet } from '@/types/domain'

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

  it('converts foreign currency expenses into wallet currency', () => {
    const transaction: Transaction = {
      id: 'usd-expense',
      type: 'expense',
      walletId: 'cash',
      currency: 'USD',
      exchangeRate: 36.1234,
      items: [{ categoryId: 'travel', amount: 10 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(amountInWalletCurrency(transaction, wallets[0])).toBe(361.234)
    expect(walletCurrentAmount(wallets[0], [transaction])).toBeCloseTo(638.766)
  })

  it('applies same-currency transfer amounts to source and destination wallets', () => {
    const savingsWallet: Wallet = { id: 'savings', name: 'Savings', type: 'payment', currency: 'THB', balance: 200, color: '#0ea5e9', icon: 'fa-piggy-bank' }
    const unrelatedWallet: Wallet = { id: 'usd-cash', name: 'USD Cash', type: 'payment', currency: 'USD', balance: 100, color: '#22c55e', icon: 'fa-dollar-sign' }
    const transaction: Transaction = {
      id: 'cash-to-savings',
      type: 'transfer',
      walletId: 'cash',
      toWalletId: 'savings',
      currency: 'THB',
      items: [{ categoryId: 'transfer', amount: 300 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(walletCurrentAmount(wallets[0], [transaction])).toBe(700)
    expect(walletCurrentAmount(savingsWallet, [transaction])).toBe(500)
    expect(walletCurrentAmount(unrelatedWallet, [transaction])).toBe(100)
  })

  it('uses toExchangeRate for transfer destination wallet conversion', () => {
    const usdWallet: Wallet = { id: 'usd-cash', name: 'USD Cash', type: 'payment', currency: 'USD', balance: 100, color: '#22c55e', icon: 'fa-dollar-sign' }
    const transaction: Transaction = {
      id: 'cash-to-usd',
      type: 'transfer',
      walletId: 'cash',
      toWalletId: 'usd-cash',
      currency: 'THB',
      exchangeRate: 1,
      toExchangeRate: 0.0275,
      items: [{ categoryId: 'transfer', amount: 1000 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(amountInWalletCurrency(transaction, usdWallet)).toBe(27.5)
    expect(walletCurrentAmount(usdWallet, [transaction])).toBe(127.5)
  })

  it('reduces credit card debt when cash transfers to a card', () => {
    const cardWithDebt: Wallet = { ...wallets[1], balance: 500 }
    const transaction: Transaction = {
      id: 'cash-to-card',
      type: 'transfer',
      walletId: 'cash',
      toWalletId: 'card',
      currency: 'THB',
      items: [{ categoryId: 'transfer', amount: 200 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(walletCurrentAmount(wallets[0], [transaction])).toBe(800)
    expect(walletCurrentAmount(cardWithDebt, [transaction])).toBe(300)
  })

  it('increases credit card debt when transferring a cash advance to payment wallet', () => {
    const cardWithDebt: Wallet = { ...wallets[1], balance: 500 }
    const transaction: Transaction = {
      id: 'card-to-cash',
      type: 'transfer',
      walletId: 'card',
      toWalletId: 'cash',
      currency: 'THB',
      items: [{ categoryId: 'transfer', amount: 200 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(walletCurrentAmount(cardWithDebt, [transaction])).toBe(700)
    expect(walletCurrentAmount(wallets[0], [transaction])).toBe(1200)
  })

  it('calculates credit card current debt as positive owed amount', () => {
    expect(walletCurrentAmount(wallets[1], transactions)).toBe(500)
  })

  it('keeps credit card expense and payment debt behavior', () => {
    expect(walletCurrentAmount(wallets[1], transactions)).toBe(500)
  })

  it('calculates total assets and debt', () => {
    expect(assetsTotal(wallets, transactions)).toBe(1400)
    expect(debtTotal(wallets, transactions)).toBe(500)
  })

  it('filters transactions by wallet and date range', () => {
    expect(walletTransactions('cash', transactions, { start: '2026-05-02', end: '2026-05-31' }).map((tx) => tx.id)).toEqual(['income'])
  })

  it('includes transfers where the wallet is the destination', () => {
    const transfer: Transaction = {
      id: 'cash-to-savings',
      type: 'transfer',
      walletId: 'cash',
      toWalletId: 'savings',
      currency: 'THB',
      items: [{ categoryId: 'transfer', amount: 300 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(walletTransactions('savings', [transfer]).map((tx) => tx.id)).toEqual(['cash-to-savings'])
  })

  it('does not include non-transfer transactions with stale destination wallet ids', () => {
    const transaction: Transaction = {
      id: 'stale-destination',
      type: 'expense',
      walletId: 'cash',
      toWalletId: 'savings',
      currency: 'THB',
      items: [{ categoryId: 'food', amount: 100 }],
      date: '2026-05-05T08:00:00.000Z',
      createdAt: '2026-05-05T08:00:00.000Z',
    }

    expect(walletTransactions('savings', [transaction])).toEqual([])
  })

  it('returns newest-first running payment balances computed oldest-to-newest', () => {
    expect(walletRunningRows(wallets[0], transactions, { start: '2026-05-01', end: '2026-05-31' }).map((row) => [row.transaction.id, row.runningAmount])).toEqual([
      ['income', 1400],
      ['old-expense', 900],
    ])
  })

  it('includes prior out-of-range transactions when computing in-range running balances', () => {
    const history: Transaction[] = [
      { id: 'prior-expense', type: 'expense', walletId: 'cash', currency: 'THB', items: [{ categoryId: 'food', amount: 100 }], date: '2026-04-30T08:00:00.000Z', createdAt: '2026-04-30T08:00:00.000Z' },
      { id: 'range-income', type: 'income', walletId: 'cash', currency: 'THB', items: [{ categoryId: 'salary', amount: 50 }], date: '2026-05-02T08:00:00.000Z', createdAt: '2026-05-02T08:00:00.000Z' },
    ]

    expect(walletRunningRows(wallets[0], history, { start: '2026-05-01', end: '2026-05-31' }).map((row) => [row.transaction.id, row.runningAmount])).toEqual([['range-income', 950]])
  })
})
