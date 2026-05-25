import { formatAmount, formatShortDate } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { TodayTransactionRowData } from './TodayTransactions'

type TotalType = 'expense' | 'income'

function titleWithNote(title: string, note: string | undefined): string {
  const trimmed = note?.trim()

  return trimmed
    ? `${title} (${trimmed})`
    : title
}

function transactionDateLabel(value: string): string {
  return formatShortDate(new Date(value))
}

function totalFor(
  transactions: ReturnType<typeof useTransactionStore.getState>['items'],
  type: TotalType,
): string | undefined {
  const matching = transactions.filter((transaction) => transaction.type === type)
  const total = matching.reduce(
    (sum, transaction) => sum + transaction.items.reduce((itemSum, item) => itemSum + item.amount, 0),
    0,
  )

  return total > 0
    ? formatAmount(total, matching[0]?.currency)
    : undefined
}

export function useTodayTransactions() {
  const todayTransactions = useTransactionStore((state) => state.todayTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
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
        primaryLabel: titleWithNote(
          `Transfer (${fromWallet?.name ?? '—'}->${toWallet?.name ?? '—'})`,
          transaction.note,
        ),
        secondaryLabel: transactionDateLabel(transaction.date),
        amount: formatAmount(amount, transaction.currency),
        amountColor: 'text-slate-400',
      }]
    }

    return transaction.items.map((item, index) => {
      const category = findCategory(item.categoryId)

      return {
        key: `${transaction.id}-${index}`,
        to: `/transaction/${transaction.id}`,
        icon: category?.icon ?? 'fa-ellipsis',
        iconBg: `${category?.color ?? '#64748b'}25`,
        iconColor: category?.color ?? '#94a3b8',
        primaryLabel: titleWithNote(category?.name ?? 'Unknown', transaction.note),
        secondaryLabel: transactionDateLabel(transaction.date),
        amount: `${transaction.type === 'income'
          ? '+'
          : '-'}${formatAmount(item.amount, transaction.currency)}`,
        amountColor: transaction.type === 'income'
          ? 'text-income'
          : 'text-expense',
      }
    })
  })

  return {
    rows,
    totalExpense: totalFor(transactions, 'expense'),
    totalIncome: totalFor(transactions, 'income'),
  }
}
