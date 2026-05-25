import { formatAmount } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { TodayTransactionRowData } from './TodayTransactions'

export function useTodayTransactions() {
  const todayTransactions = useTransactionStore((state) => state.todayTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)
  const findWallet = useWalletStore((state) => state.findById)
  const transactions = todayTransactions()

  const rows: TodayTransactionRowData[] = transactions.flatMap((transaction) => {
    if (transaction.type === 'transfer') {
      const fromWallet = findWallet(transaction.walletId)
      const toWallet = transaction.toWalletId
        ? findWallet(transaction.toWalletId)
        : undefined
      const amount = transaction.items[0]?.amount ?? 0

      return [{
        key: `${transaction.id}-0`,
        to: `/transaction/${transaction.id}`,
        icon: 'fa-arrow-right-arrow-left',
        iconBg: '#6366f125',
        iconColor: '#6366f1',
        primaryLabel: 'Transfer',
        secondaryLabel: `${fromWallet?.name ?? '—'} → ${toWallet?.name ?? '—'}`,
        amount: formatAmount(amount, transaction.currency),
        amountColor: 'text-slate-400',
      }]
    }

    return transaction.items.map((item, index) => {
      const category = findCategory(item.categoryId)
      const parent = category
        ? parentOf(category)
        : undefined

      return {
        key: `${transaction.id}-${index}`,
        to: `/transaction/${transaction.id}`,
        icon: category?.icon ?? 'fa-ellipsis',
        iconBg: `${category?.color ?? '#64748b'}25`,
        iconColor: category?.color ?? '#94a3b8',
        primaryLabel: category?.name ?? 'Unknown',
        secondaryLabel: parent?.name ?? transaction.type,
        amount: `${transaction.type === 'income'
          ? '+'
          : '-'}${formatAmount(item.amount, transaction.currency)}`,
        amountColor: transaction.type === 'income'
          ? 'text-income'
          : 'text-expense',
      }
    })
  })

  return { rows }
}
