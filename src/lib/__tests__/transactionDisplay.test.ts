import {
  describe,
  expect,
  it,
} from 'vitest'

import { buildTransactionRowDisplay } from '@/lib'
import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

const wallets: Wallet[] = [
  {
    id: 'wallet-cash',
    name: 'Cash',
    type: 'payment',
    currency: 'USD',
    balance: 0,
    color: '#10b981',
    icon: 'fa-wallet',
  },
  {
    id: 'wallet-bank',
    name: 'Bank',
    type: 'payment',
    currency: 'USD',
    balance: 0,
    color: '#0ea5e9',
    icon: 'fa-building-columns',
  },
]

const categories: Category[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    type: 'expense',
    level: 1,
    icon: 'fa-mug-hot',
    isDefault: true,
  },
  {
    id: 'food',
    name: 'Food',
    type: 'expense',
    level: 1,
    icon: 'fa-burger',
    isDefault: true,
  },
]

function findCategory(categoryId: string): Category | undefined {
  return categories.find((category) => category.id === categoryId)
}

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx-1',
    type: 'expense',
    walletId: 'wallet-cash',
    currency: 'USD',
    items: [{ categoryId: 'coffee', amount: 10 }],
    date: '2026-05-25T10:00:00.000Z',
    createdAt: '2026-05-25T10:00:00.000Z',
    ...overrides,
  }
}

describe('buildTransactionRowDisplay', () => {
  it('builds a grouped completed transaction row with note and total amount', () => {
    expect(buildTransactionRowDisplay({
      transaction: makeTransaction({
        note: 'brunch',
        items: [
          { categoryId: 'coffee', amount: 10 },
          { categoryId: 'food', amount: 20 },
        ],
      }),
      findCategory,
      wallets,
    })).toEqual({
      to: '/transaction/tx-1',
      icon: 'fa-mug-hot',
      title: 'Coffee, Food (brunch)',
      date: '2026-05-25T10:00:00.000Z',
      amount: '$30.00',
      amountColor: 'text-expense',
      secondaryAmount: undefined,
      secondaryAmountColor: undefined,
    })
  })

  it('keeps transfer label and supports caller-provided wallet amounts', () => {
    expect(buildTransactionRowDisplay({
      transaction: makeTransaction({
        id: 'tx-transfer',
        type: 'transfer',
        toWalletId: 'wallet-bank',
        items: [{ categoryId: 'transfer', amount: 50 }],
      }),
      findCategory,
      wallets,
      amount: '$50.00',
      amountColor: 'text-income',
      secondaryAmount: '$150.00',
      secondaryAmountColor: 'text-white/28',
    })).toEqual({
      to: '/transaction/tx-transfer',
      icon: 'fa-arrow-right-arrow-left',
      title: 'Transfer (Cash->Bank)',
      date: '2026-05-25T10:00:00.000Z',
      amount: '$50.00',
      amountColor: 'text-income',
      secondaryAmount: '$150.00',
      secondaryAmountColor: 'text-white/28',
    })
  })
})
