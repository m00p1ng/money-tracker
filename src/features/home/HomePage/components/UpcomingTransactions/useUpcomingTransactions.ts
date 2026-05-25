import { formatAmount, formatShortDate } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { UpcomingTransactionRowData } from './UpcomingTransactions'

function titleWithNote(title: string, note: string | undefined): string {
  const trimmed = note?.trim()

  return trimmed
    ? `${title} (${trimmed})`
    : title
}

function dateLabelFor(day: string): string {
  const [year, month, date] = day.split('-').map(Number)

  return formatShortDate(new Date(year, month - 1, date))
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
    const category = firstItem
      ? findCategory(firstItem.categoryId)
      : undefined
    const fromWallet = findWallet(transaction.walletId)
    const toWallet = transaction.toWalletId
      ? findWallet(transaction.toWalletId)
      : undefined
    const label = transaction.type === 'transfer'
      ? `Transfer (${fromWallet?.name ?? 'Wallet'}->${toWallet?.name ?? 'Wallet'})`
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
      primaryLabel: titleWithNote(label, transaction.note),
      secondaryLabel: `${dateLabelFor(row.date)}${row.kind === 'virtual-repeat'
        ? ' · Repeat'
        : ''}`,
      amount: formatAmount(firstItem?.amount ?? 0, transaction.currency),
    }
  })

  return { rows }
}
