import { create } from 'zustand'
import { db } from '../db/schema'
import {
  materializeRepeatOccurrence as buildRepeatOccurrence,
  projectRepeatOccurrences,
  type VirtualRepeatOccurrence,
} from '../features/transaction/repeatSchedule'
import { isTodayInLocalTime } from '../lib/date'
import type { Transaction } from '../types/domain'

function total(transaction: Transaction): number {
  return transaction.items.reduce((sum, item) => sum + item.amount, 0)
}

function isCurrentMonth(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate)
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function localDateString(value: string): string {
  if (!value.includes('T')) return value.slice(0, 10)

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayString(now: Date): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day + days)
  return todayString(date)
}

function sortNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))
}

export type UpcomingTransactionRow =
  | { kind: 'real'; id: string; date: string; transaction: Transaction }
  | { kind: 'virtual-repeat'; id: string; date: string; occurrence: VirtualRepeatOccurrence }

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
  upcomingTransactions: (now?: Date) => UpcomingTransactionRow[]
  materializeRepeatOccurrence: (
    sourceId: string,
    occurrenceDate: string,
    createId: () => string,
    now: string,
  ) => Promise<Transaction>
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  items: [],
  async load() {
    const items = await db.transactions.orderBy('date').reverse().toArray()
    set({ items })
  },
  async add(transaction) {
    await db.transactions.put(transaction)
    set({ items: sortNewestFirst([transaction, ...get().items]) })
  },
  async update(transaction) {
    await db.transactions.put(transaction)
    set({
      items: sortNewestFirst(get().items.map((item) => (item.id === transaction.id ? transaction : item))),
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
  upcomingTransactions(now = new Date()) {
    const tomorrow = addDays(todayString(now), 1)
    const realRows: UpcomingTransactionRow[] = get()
      .items.filter((transaction) => {
        const date = localDateString(transaction.date)
        return transaction.status === 'overdue' || (transaction.status === 'planned' && date <= tomorrow)
      })
      .map((transaction) => ({
        kind: 'real',
        id: transaction.id,
        date: localDateString(transaction.date),
        transaction,
      }))

    const repeatRows: UpcomingTransactionRow[] = projectRepeatOccurrences(get().items, now).map((occurrence) => ({
      kind: 'virtual-repeat',
      id: occurrence.id,
      date: occurrence.occurrenceDate,
      occurrence,
    }))

    return [...realRows, ...repeatRows].sort((a, b) => {
      const aOverdue = a.kind === 'real' && a.transaction.status === 'overdue'
      const bOverdue = b.kind === 'real' && b.transaction.status === 'overdue'
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return a.date.localeCompare(b.date)
    })
  },
  async materializeRepeatOccurrence(sourceId, occurrenceDate, createId, now) {
    const existing =
      get().items.find(
        (transaction) =>
          transaction.repeatSourceId === sourceId && transaction.repeatOccurrenceDate === occurrenceDate,
      ) ??
      (await db.transactions
        .filter(
          (transaction) =>
            transaction.repeatSourceId === sourceId && transaction.repeatOccurrenceDate === occurrenceDate,
        )
        .first())

    if (existing) {
      if (!get().items.some((transaction) => transaction.id === existing.id)) {
        set({ items: sortNewestFirst([existing, ...get().items]) })
      }
      return existing
    }

    const source = get().items.find((transaction) => transaction.id === sourceId) ?? (await db.transactions.get(sourceId))
    if (!source) throw new Error('Repeat source not found')

    const transaction = buildRepeatOccurrence(source, occurrenceDate, createId, now)
    await db.transactions.put(transaction)
    set({ items: sortNewestFirst([transaction, ...get().items]) })
    return transaction
  },
}))
