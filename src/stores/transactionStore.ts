import sumBy from 'lodash/sumBy'
import { create } from 'zustand'

import { db } from '@/db/schema'
import { signedWalletAmount } from '@/features/balance/balanceCalculations'
import {
  materializeRepeatOccurrence as buildRepeatOccurrence,
  projectRepeatOccurrences,
  type VirtualRepeatOccurrence,
} from '@/features/transaction'
import {
  deriveStoredTransactionStatus,
  isTransactionPaid,
} from '@/features/transaction/transactionForm'
import { isTodayInLocalTime } from '@/lib'
import type { Transaction, TransactionStatus } from '@/types/domain'

import { useWalletStore } from './walletStore'

async function applyWalletDeltas(transaction: Transaction, multiplier: 1 | -1): Promise<void> {
  if (!isTransactionPaid(transaction)) {
    return
  }

  const { items: wallets, applyDelta } = useWalletStore.getState()
  const walletIds = new Set([transaction.walletId])
  if (transaction.type === 'transfer' && transaction.toWalletId) {
    walletIds.add(transaction.toWalletId)
  }

  for (const walletId of walletIds) {
    const wallet = wallets.find((w) => w.id === walletId)
    if (wallet) {
      await applyDelta(walletId, signedWalletAmount(wallet, transaction) * multiplier)
    }
  }
}

function normalizeTransaction(
  transaction: Transaction & { status?: TransactionStatus },
): Transaction {
  const normalized: Transaction & { status?: TransactionStatus } = {
    ...transaction,
    paid: isTransactionPaid(transaction),
  }
  delete normalized.status

  return normalized
}

function total(transaction: Transaction): number {
  return sumBy(transaction.items, 'amount')
}

function isCurrentMonth(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate)

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function localDateString(value: string): string {
  if (!value.includes('T')) {
    return value.slice(0, 10)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }

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
  toggleCleared: (id: string) => Promise<void>
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
  transactionsByMonth: (year: number, month: number) => Transaction[]
  upcomingByMonth: (year: number, month: number) => UpcomingTransactionRow[]
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  items: [],
  async load() {
    const items = (await db.transactions.orderBy('date').reverse().toArray()).map(normalizeTransaction)
    set({ items })
  },
  async add(transaction) {
    const normalized = normalizeTransaction(transaction)
    await db.transactions.put(normalized)
    set({ items: sortNewestFirst([normalized, ...get().items]) })
    await applyWalletDeltas(normalized, 1)
  },
  async update(transaction) {
    const old = get().items.find((item) => item.id === transaction.id)
    const normalized = normalizeTransaction(transaction)
    await db.transactions.put(normalized)
    set({
      items: sortNewestFirst(get().items.map((item) => (item.id === transaction.id
        ? normalized
        : item))),
    })
    if (old) {
      await applyWalletDeltas(old, -1)
    }
    await applyWalletDeltas(normalized, 1)
  },
  async remove(id) {
    const transaction = get().items.find((item) => item.id === id)
    await db.transactions.delete(id)
    set({ items: get().items.filter((item) => item.id !== id) })
    if (transaction) {
      await applyWalletDeltas(transaction, -1)
    }
  },
  async toggleCleared(id) {
    const tx = get().items.find((item) => item.id === id)
    if (!tx) {
      return
    }
    const updated = { ...tx, cleared: !tx.cleared }
    await db.transactions.update(id, { cleared: updated.cleared })
    set({
      items: get().items.map((item) => (item.id === id
        ? updated
        : item),
      ),
    })
  },
  findById(id) {
    return get().items.find((transaction) => transaction.id === id)
  },
  monthlyIncome() {
    return get()
      .items
      .filter((transaction) => transaction.type === 'income' && isCurrentMonth(transaction.date))
      .reduce((sum, transaction) => sum + total(transaction), 0)
  },
  monthlyExpense() {
    return get()
      .items
      .filter((transaction) => transaction.type === 'expense' && isCurrentMonth(transaction.date))
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
        const status = deriveStoredTransactionStatus(transaction, now)

        return status === 'overdue' || (status === 'planned' && date <= tomorrow)
      })
      .map((transaction) => ({
        kind: 'real',
        id: transaction.id,
        date: localDateString(transaction.date),
        transaction,
      }))

    const repeatRows: UpcomingTransactionRow[] = projectRepeatOccurrences(get().items, now)
      .filter((occurrence) => occurrence.occurrenceDate <= tomorrow)
      .map((occurrence) => ({
        kind: 'virtual-repeat',
        id: occurrence.id,
        date: occurrence.occurrenceDate,
        occurrence,
      }))

    return [...realRows, ...repeatRows].sort((a, b) => {
      const aOverdue = a.kind === 'real' && deriveStoredTransactionStatus(a.transaction, now) === 'overdue'
      const bOverdue = b.kind === 'real' && deriveStoredTransactionStatus(b.transaction, now) === 'overdue'
      if (aOverdue && !bOverdue) {
        return -1
      }
      if (!aOverdue && bOverdue) {
        return 1
      }

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

    const source =
      get().items.find((transaction) => transaction.id === sourceId)
      ?? (await db.transactions.get(sourceId))
    if (!source) {
      throw new Error('Repeat source not found')
    }

    const transaction = buildRepeatOccurrence(source, occurrenceDate, createId, now)
    await db.transactions.put(transaction)
    set({ items: sortNewestFirst([transaction, ...get().items]) })
    await applyWalletDeltas(transaction, 1)

    return transaction
  },
  transactionsByMonth(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`

    return get()
      .items.filter(
        (tx) =>
          localDateString(tx.date).startsWith(prefix) &&
          isTransactionPaid(tx),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  },
  upcomingByMonth(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const realRows: UpcomingTransactionRow[] = get()
      .items.filter(
        (tx) =>
          !isTransactionPaid(tx) &&
          localDateString(tx.date).startsWith(prefix),
      )
      .map((tx) => ({
        kind: 'real',
        id: tx.id,
        date: localDateString(tx.date),
        transaction: tx,
      }))
    const repeatRows: UpcomingTransactionRow[] = projectRepeatOccurrences(get().items)
      .filter((occ) => occ.occurrenceDate.startsWith(prefix))
      .map((occ) => ({
        kind: 'virtual-repeat',
        id: occ.id,
        date: occ.occurrenceDate,
        occurrence: occ,
      }))

    return [...realRows, ...repeatRows].sort((a, b) =>
      a.date.localeCompare(b.date),
    )
  },
}))
