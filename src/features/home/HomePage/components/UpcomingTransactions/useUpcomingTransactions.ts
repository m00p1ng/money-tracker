import {
  buildTransactionRowDisplay,
  formatShortDate,
} from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { UpcomingTransactionRowData } from './UpcomingTransactions'

function dateLabelFor(day: string): string {
  const [year, month, date] = day.split('-').map(Number)

  return formatShortDate(new Date(year, month - 1, date))
}

export function useUpcomingTransactions() {
  const upcomingTransactions = useTransactionStore((state) => state.upcomingTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const wallets = useWalletStore((state) => state.items)
  const rawRows = upcomingTransactions()

  const rows: UpcomingTransactionRowData[] = rawRows.map((row) => {
    const transaction = row.kind === 'real'
      ? row.transaction
      : row.occurrence.transaction
    const to =
      row.kind === 'real'
        ? `/transaction/${transaction.id}`
        : `/transaction/repeat/${row.occurrence.sourceId}/${row.occurrence.occurrenceDate}`
    const secondaryLabel = `${dateLabelFor(row.date)}${row.kind === 'virtual-repeat'
      ? ' · Repeat'
      : ''}`

    return {
      id: row.id,
      ...buildTransactionRowDisplay({
        transaction,
        findCategory,
        wallets,
        secondaryLabel,
      }),
      to,
    }
  })

  return { rows }
}
