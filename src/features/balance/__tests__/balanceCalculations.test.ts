import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  amountInWalletCurrency,
  assetsTotal,
  debtTotal,
  isReconciliationEnabled,
  walletClearedAmount,
  walletCurrentAmount,
  walletRunningRows,
  walletTransactions,
} from '@/features/balance/balanceCalculations'
import type { Transaction, Wallet } from '@/types/domain'

// wallet.balance represents the current balance (already includes all transactions)
// cash: started at 1000, expense -100, income +500 → current 1400
// card: started at 0, card-expense +750 debt, card-payment -250 debt → current debt 500
const wallets: Wallet[] = [
  {
    id: 'cash',
    name: 'Cash',
    type: 'payment',
    currency: 'THB',
    balance: 1400,
    color: '#10b981',
    icon: 'fa-wallet',
  },
  {
    id: 'card',
    name: 'Card',
    type: 'credit_card',
    currency: 'THB',
    balance: 500,
    creditLimit: 5000,
    color: '#ef4444',
    icon: 'fa-credit-card',
  },
]

const transactions: Transaction[] = [
  {
    id: 'old-expense',
    type: 'expense',
    walletId: 'cash',
    currency: 'THB',
    items: [{ categoryId: 'food', amount: 100 }],
    date: '2026-05-01T08:00:00.000Z',
    createdAt: '2026-05-01T08:00:00.000Z',
  },
  {
    id: 'income',
    type: 'income',
    walletId: 'cash',
    currency: 'THB',
    items: [{ categoryId: 'salary', amount: 500 }],
    date: '2026-05-02T08:00:00.000Z',
    createdAt: '2026-05-02T08:00:00.000Z',
  },
  {
    id: 'card-expense',
    type: 'expense',
    walletId: 'card',
    currency: 'THB',
    items: [{ categoryId: 'shopping', amount: 750 }],
    date: '2026-05-03T08:00:00.000Z',
    createdAt: '2026-05-03T08:00:00.000Z',
  },
  {
    id: 'card-payment',
    type: 'income',
    walletId: 'card',
    currency: 'THB',
    items: [{ categoryId: 'refund', amount: 250 }],
    date: '2026-05-04T08:00:00.000Z',
    createdAt: '2026-05-04T08:00:00.000Z',
  },
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
    // wallet.balance is maintained incrementally: 1000 - 361.234 = 638.766
    const cashAfterUsdExpense: Wallet = { ...wallets[0], balance: 638.766 }
    expect(walletCurrentAmount(cashAfterUsdExpense, [transaction])).toBeCloseTo(638.766)
  })

  it('applies same-currency transfer amounts to source and destination wallets', () => {
    // wallet.balance = current balance after the transfer
    const cashAfterTransfer: Wallet = {
      id: 'cash',
      name: 'Cash',
      type: 'payment',
      currency: 'THB',
      balance: 700,
      color: '#10b981',
      icon: 'fa-wallet',
    }
    const savingsAfterTransfer: Wallet = {
      id: 'savings',
      name: 'Savings',
      type: 'payment',
      currency: 'THB',
      balance: 500,
      color: '#0ea5e9',
      icon: 'fa-piggy-bank',
    }
    const unrelatedWallet: Wallet = {
      id: 'usd-cash',
      name: 'USD Cash',
      type: 'payment',
      currency: 'USD',
      balance: 100,
      color: '#22c55e',
      icon: 'fa-dollar-sign',
    }
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

    expect(walletCurrentAmount(cashAfterTransfer, [transaction])).toBe(700)
    expect(walletCurrentAmount(savingsAfterTransfer, [transaction])).toBe(500)
    expect(walletCurrentAmount(unrelatedWallet, [transaction])).toBe(100)
  })

  it('uses toExchangeRate for transfer destination wallet conversion', () => {
    // wallet.balance = current (100 initial + 27.5 from transfer = 127.5)
    const usdWalletAfterTransfer: Wallet = {
      id: 'usd-cash',
      name: 'USD Cash',
      type: 'payment',
      currency: 'USD',
      balance: 127.5,
      color: '#22c55e',
      icon: 'fa-dollar-sign',
    }
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

    expect(amountInWalletCurrency(transaction, usdWalletAfterTransfer)).toBe(27.5)
    expect(walletCurrentAmount(usdWalletAfterTransfer, [transaction])).toBe(127.5)
  })

  it('reduces credit card debt when cash transfers to a card', () => {
    // cash: 1000 - 200 = 800; card: 500 debt - 200 = 300 debt
    const cashAfter: Wallet = { ...wallets[0], balance: 800 }
    const cardAfter: Wallet = { ...wallets[1], balance: 300 }
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

    expect(walletCurrentAmount(cashAfter, [transaction])).toBe(800)
    expect(walletCurrentAmount(cardAfter, [transaction])).toBe(300)
  })

  it('increases credit card debt when transferring a cash advance to payment wallet', () => {
    // card: 500 + 200 = 700 debt; cash: 1000 + 200 = 1200
    const cardAfter: Wallet = { ...wallets[1], balance: 700 }
    const cashAfter: Wallet = { ...wallets[0], balance: 1200 }
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

    expect(walletCurrentAmount(cardAfter, [transaction])).toBe(700)
    expect(walletCurrentAmount(cashAfter, [transaction])).toBe(1200)
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
    expect(
      walletTransactions('cash', transactions, { start: '2026-05-02', end: '2026-05-31' })
        .map((tx) => tx.id),
    ).toEqual(['income'])
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
    // wallets[0].balance = 1400 (current); startingBalance = 1400 - (-100+500) = 1000
    expect(
      walletRunningRows(wallets[0], transactions, { start: '2026-05-01', end: '2026-05-31' })
        .map((row) => [row.transaction.id, row.runningAmount]),
    ).toEqual([
      ['income', 1400],
      ['old-expense', 900],
    ])
  })

  it('includes prior out-of-range transactions when computing in-range running balances', () => {
    const history: Transaction[] = [
      {
        id: 'prior-expense',
        type: 'expense',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'food', amount: 100 }],
        date: '2026-04-30T08:00:00.000Z',
        createdAt: '2026-04-30T08:00:00.000Z',
      },
      {
        id: 'range-income',
        type: 'income',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'salary', amount: 50 }],
        date: '2026-05-02T08:00:00.000Z',
        createdAt: '2026-05-02T08:00:00.000Z',
      },
    ]
    // wallet.balance = current after both txns: 1000 - 100 + 50 = 950
    // startingBalance = 950 - (-100+50) = 1000; prior: 900; range-income: 950
    const cashAfter: Wallet = { ...wallets[0], balance: 950 }

    expect(
      walletRunningRows(cashAfter, history, { start: '2026-05-01', end: '2026-05-31' })
        .map((row) => [row.transaction.id, row.runningAmount]),
    ).toEqual([['range-income', 950]])
  })

  it('counts only cleared transactions for cleared balance', () => {
    // wallet.balance = current after both txns: 1000 - 200 - 100 = 700
    // startingBalance = 700 - (-200-100) = 1000; cleared: 1000-200 = 800
    const wallet: Wallet = {
      id: 'cash',
      name: 'Cash',
      type: 'payment',
      currency: 'THB',
      balance: 700,
      color: '#10b981',
      icon: 'fa-wallet',
    }
    const txns: Transaction[] = [
      {
        id: 'cleared-expense',
        type: 'expense',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'food', amount: 200 }],
        date: '2026-05-01T08:00:00.000Z',
        createdAt: '2026-05-01T08:00:00.000Z',
        cleared: true,
      },
      {
        id: 'uncleared-expense',
        type: 'expense',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'food', amount: 100 }],
        date: '2026-05-02T08:00:00.000Z',
        createdAt: '2026-05-02T08:00:00.000Z',
        cleared: false,
      },
    ]
    expect(walletClearedAmount(wallet, txns)).toBe(800)
  })

  it('returns starting balance when no transactions are cleared', () => {
    // wallet.balance = current: 500 - 100 = 400; startingBalance = 400+100 = 500
    const wallet: Wallet = {
      id: 'cash',
      name: 'Cash',
      type: 'payment',
      currency: 'THB',
      balance: 400,
      color: '#10b981',
      icon: 'fa-wallet',
    }
    const txns: Transaction[] = [
      {
        id: 'uncleared',
        type: 'expense',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'food', amount: 100 }],
        date: '2026-05-01T08:00:00.000Z',
        createdAt: '2026-05-01T08:00:00.000Z',
        cleared: false,
      },
    ]
    expect(walletClearedAmount(wallet, txns)).toBe(500)
  })

  describe('isReconciliationEnabled', () => {
    it('returns false when reconciliationEnabled is undefined', () => {
      const wallet: Wallet = {
        id: 'w1',
        name: 'W',
        type: 'payment',
        currency: 'THB',
        balance: 0,
        color: '#fff',
        icon: 'fa-wallet',
      }
      expect(isReconciliationEnabled(wallet)).toBe(false)
    })

    it('returns false when reconciliationEnabled is false', () => {
      const wallet: Wallet = {
        id: 'w1',
        name: 'W',
        type: 'payment',
        currency: 'THB',
        balance: 0,
        color: '#fff',
        icon: 'fa-wallet',
        reconciliationEnabled: false,
      }
      expect(isReconciliationEnabled(wallet)).toBe(false)
    })

    it('returns true when reconciliationEnabled is true', () => {
      const wallet: Wallet = {
        id: 'w1',
        name: 'W',
        type: 'payment',
        currency: 'THB',
        balance: 0,
        color: '#fff',
        icon: 'fa-wallet',
        reconciliationEnabled: true,
      }
      expect(isReconciliationEnabled(wallet)).toBe(true)
    })
  })

  describe('adjustment transactions', () => {
    it('adds signed adjustment amount directly to wallet balance', () => {
      // wallet.balance = current after opening adj of 500
      const wallet: Wallet = {
        id: 'cash',
        name: 'Cash',
        type: 'payment',
        currency: 'THB',
        balance: 500,
        color: '#10b981',
        icon: 'fa-wallet',
      }
      const opening: Transaction = {
        id: 'adj-1',
        type: 'adjustment',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'adjustment-balance-adjustment', amount: 500 }],
        date: '2026-05-27T00:00:00.000Z',
        createdAt: '2026-05-27T00:00:00.000Z',
        note: 'Opening Balance',
      }
      expect(walletCurrentAmount(wallet, [opening])).toBe(500)
    })

    it('subtracts negative adjustment amount from wallet balance', () => {
      // wallet.balance = current: 100 + (-30) = 70
      const adjustment: Transaction = {
        id: 'adj-2',
        type: 'adjustment',
        walletId: 'cash',
        currency: 'THB',
        items: [{ categoryId: 'adjustment-balance-adjustment', amount: -30 }],
        date: '2026-05-27T00:00:00.000Z',
        createdAt: '2026-05-27T00:00:00.000Z',
        note: 'Balance Adjustment',
      }
      const walletWith70: Wallet = {
        id: 'cash',
        name: 'Cash',
        type: 'payment',
        currency: 'THB',
        balance: 70,
        color: '#10b981',
        icon: 'fa-wallet',
      }
      expect(walletCurrentAmount(walletWith70, [adjustment])).toBe(70)
    })

    it('does not flip sign for credit card wallet', () => {
      // wallet.balance = current after adj of 200
      const creditCard: Wallet = {
        id: 'cc',
        name: 'Visa',
        type: 'credit_card',
        currency: 'THB',
        balance: 200,
        color: '#ef4444',
        icon: 'fa-credit-card',
      }
      const adjustment: Transaction = {
        id: 'adj-3',
        type: 'adjustment',
        walletId: 'cc',
        currency: 'THB',
        items: [{ categoryId: 'adjustment-balance-adjustment', amount: 200 }],
        date: '2026-05-27T00:00:00.000Z',
        createdAt: '2026-05-27T00:00:00.000Z',
      }
      expect(walletCurrentAmount(creditCard, [adjustment])).toBe(200)
    })
  })
})
