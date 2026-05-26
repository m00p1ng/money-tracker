import { buildTransactionRowDisplay } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { UpcomingTransactionRowData } from './UpcomingTransactions'

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

    return {
      id: row.id,
      ...buildTransactionRowDisplay({
        transaction,
        findCategory,
        wallets,
        date: row.date,
      }),
      to,
    }
  })

  return { rows }
}
