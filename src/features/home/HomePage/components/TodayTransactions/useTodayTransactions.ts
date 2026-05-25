import { buildTransactionBaseProps, formatAmount } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { TodayTransactionRowData } from './TodayTransactions'

type TotalType = 'expense' | 'income'

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
  const wallets = useWalletStore((state) => state.items)
  const transactions = todayTransactions()

  const rows: TodayTransactionRowData[] = transactions.flatMap((transaction) => {
    if (transaction.type === 'transfer') {
      const amount = transaction.items[0]?.amount ?? 0
      const base = buildTransactionBaseProps(transaction, undefined, wallets)

      return [{
        key: `${transaction.id}-0`,
        ...base,
        amount: formatAmount(amount, transaction.currency),
        amountColor: 'text-slate-400',
      }]
    }

    return transaction.items.map((item, index) => {
      const category = findCategory(item.categoryId)
      const base = buildTransactionBaseProps(transaction, category, wallets)

      return {
        key: `${transaction.id}-${index}`,
        ...base,
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
