import { formatAmount } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { UpcomingTransactionRowData } from './UpcomingTransactions'

function badgeFor(day: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = tomorrowDate.toISOString().slice(0, 10)

  if (day < today) {
    return 'Overdue'
  }

  if (day === today) {
    return 'Today'
  }

  if (day === tomorrow) {
    return 'Tomorrow'
  }

  return day
}

export function useUpcomingTransactions() {
  const upcomingTransactions = useTransactionStore((state) => state.upcomingTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const findWallet = useWalletStore((state) => state.findById)
  const rawRows = upcomingTransactions()

  const rows: UpcomingTransactionRowData[] = rawRows.map((row) => {
    const transaction = row.kind === 'real'
      ? row.transaction
      : row.occurrence.transaction
    const firstItem = transaction.items[0]
    const category = firstItem ? findCategory(firstItem.categoryId) : undefined
    const fromWallet = findWallet(transaction.walletId)
    const toWallet = transaction.toWalletId ? findWallet(transaction.toWalletId) : undefined
    const label =
      transaction.type === 'transfer'
        ? `${fromWallet?.name ?? 'Wallet'} -> ${toWallet?.name ?? 'Wallet'}`
        : category?.name ?? 'Transaction'
    const to =
      row.kind === 'real'
        ? `/transaction/${transaction.id}`
        : `/transaction/repeat/${row.occurrence.sourceId}/${row.occurrence.occurrenceDate}`

    return {
      id: row.id,
      to,
      icon: transaction.type === 'transfer'
        ? 'fa-right-left'
        : category?.icon ?? 'fa-clock',
      primaryLabel: label,
      secondaryLabel: `${badgeFor(row.date)}${row.kind === 'virtual-repeat' ? ' · Repeat' : ''}`,
      amount: formatAmount(firstItem?.amount ?? 0, transaction.currency),
    }
  })

  return { rows }
}
