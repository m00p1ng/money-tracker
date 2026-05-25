import { TransactionRow as SharedTransactionRow } from '@/components'
import type { RunningWalletRow } from '@/features/balance/balanceCalculations'
import {
  buildTransactionRowDisplay,
  formatAmount,
  transactionAmountColor,
} from '@/lib'
import type {
  Category,
  Wallet,
} from '@/types/domain'

export type TransactionRowProps = {
  row: RunningWalletRow
  wallet: Wallet
  wallets: Wallet[]
  categories: Category[]
}

export function TransactionRow({
  row,
  wallet,
  wallets,
  categories,
}: TransactionRowProps) {
  const { transaction } = row

  return (
    <div className="mb-2">
      <SharedTransactionRow
        {...buildTransactionRowDisplay({
          transaction,
          findCategory: (categoryId) => categories.find((c) => c.id === categoryId),
          wallets,
          amount: formatAmount(Math.abs(row.amount), wallet.currency),
          amountColor: transactionAmountColor(transaction, row.amount),
          secondaryAmount: formatAmount(row.runningAmount, wallet.currency),
          secondaryAmountColor: 'text-white/28',
        })}
      />
    </div>
  )
}
