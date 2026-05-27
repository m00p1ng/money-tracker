import Dexie, { type Table } from 'dexie'

import type {
  Category,
  Currency,
  Settings,
  Transaction,
  Wallet,
} from '@/types/domain'

export class MoneyTrackerDb extends Dexie {
  transactions!: Table<Transaction, string>
  wallets!: Table<Wallet, string>
  categories!: Table<Category, string>
  currencies!: Table<Currency, string>
  settings!: Table<Settings, string>

  constructor() {
    super('money-tracker')
    this.version(1).stores({
      transactions: 'id, type, walletId, date, status',
      wallets: 'id',
      categories: 'id, parentId, type',
      currencies: 'code',
      settings: 'id',
    })
    this.version(2).stores({
      transactions: 'id, type, walletId, date, paid',
      wallets: 'id',
      categories: 'id, parentId, type',
      currencies: 'code',
      settings: 'id',
    }).upgrade((tx) =>
      tx.table('transactions').toCollection().modify((transaction) => {
        transaction.paid = typeof transaction.paid === 'boolean'
          ? transaction.paid
          : transaction.status === undefined || transaction.status === 'paid'
        delete transaction.status
      }),
    )
  }
}

export const db = new MoneyTrackerDb()
