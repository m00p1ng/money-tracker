import { formatAmount } from '@/lib/format'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'

import type { TodayTransactionRowData } from './TodayTransactions'

export function useTodayTransactions() {
  const todayTransactions = useTransactionStore((state) => state.todayTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)
  const transactions = todayTransactions()

  const rows: TodayTransactionRowData[] = transactions.flatMap((transaction) =>
    transaction.items.map((item, index) => {
      const category = findCategory(item.categoryId)
      const parent = category ? parentOf(category) : undefined
      return {
        key: `${transaction.id}-${index}`,
        to: `/transaction/${transaction.id}`,
        icon: category?.icon ?? 'fa-ellipsis',
        iconBg: `${category?.color ?? '#64748b'}25`,
        iconColor: category?.color ?? '#94a3b8',
        primaryLabel: category?.name ?? 'Unknown',
        secondaryLabel: parent?.name ?? transaction.type,
        amount: `${transaction.type === 'income' ? '+' : '-'}${formatAmount(item.amount, transaction.currency)}`,
        amountColor: transaction.type === 'income' ? 'text-income' : 'text-expense',
      }
    }),
  )

  return { rows }
}
