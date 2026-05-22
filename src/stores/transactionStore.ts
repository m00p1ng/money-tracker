import { create } from 'zustand'
import { db } from '../db/schema'
import { isTodayInLocalTime } from '../lib/date'
import type { Transaction } from '../types/domain'

function total(transaction: Transaction): number {
  return transaction.items.reduce((sum, item) => sum + item.amount, 0)
}

function isCurrentMonth(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate)
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

type TransactionStore = {
  items: Transaction[]
  load: () => Promise<void>
  add: (transaction: Transaction) => Promise<void>
  update: (transaction: Transaction) => Promise<void>
  remove: (id: string) => Promise<void>
  findById: (id: string) => Transaction | undefined
  monthlyIncome: () => number
  monthlyExpense: () => number
  todayTransactions: () => Transaction[]
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  items: [],
  async load() {
    const items = await db.transactions.orderBy('date').reverse().toArray()
    set({ items })
  },
  async add(transaction) {
    await db.transactions.put(transaction)
    set({ items: [transaction, ...get().items].sort((a, b) => b.date.localeCompare(a.date)) })
  },
  async update(transaction) {
    await db.transactions.put(transaction)
    set({
      items: get()
        .items.map((item) => (item.id === transaction.id ? transaction : item))
        .sort((a, b) => b.date.localeCompare(a.date)),
    })
  },
  async remove(id) {
    await db.transactions.delete(id)
    set({ items: get().items.filter((transaction) => transaction.id !== id) })
  },
  findById(id) {
    return get().items.find((transaction) => transaction.id === id)
  },
  monthlyIncome() {
    return get()
      .items.filter((transaction) => transaction.type === 'income' && isCurrentMonth(transaction.date))
      .reduce((sum, transaction) => sum + total(transaction), 0)
  },
  monthlyExpense() {
    return get()
      .items.filter((transaction) => transaction.type === 'expense' && isCurrentMonth(transaction.date))
      .reduce((sum, transaction) => sum + total(transaction), 0)
  },
  todayTransactions() {
    return get()
      .items.filter((transaction) => isTodayInLocalTime(transaction.date))
      .sort((a, b) => b.date.localeCompare(a.date))
  },
}))
