import { isTransactionPaid } from '@/features/transaction/transactionForm'
import {
  buildTransactionRowDisplay,
  formatAmount,
} from '@/lib'
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
    .filter((tx) => tx.type !== 'adjustment')
    .filter(isTransactionPaid)

  const rows: TodayTransactionRowData[] = transactions.map((transaction) => {
    if (transaction.type === 'transfer') {
      const amount = transaction.items[0]?.amount ?? 0

      return {
        key: `${transaction.id}-0`,
        ...buildTransactionRowDisplay({
          transaction,
          findCategory,
          wallets,
          amount,
          amountColor: 'text-slate-400',
        }),
      }
    }

    return {
      key: transaction.id,
      ...buildTransactionRowDisplay({
        transaction,
        findCategory,
        wallets,
      }),
    }
  })

  return {
    rows,
    totalExpense: totalFor(transactions, 'expense'),
    totalIncome: totalFor(transactions, 'income'),
  }
}
