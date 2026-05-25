import { TransactionRow as SharedTransactionRow } from '@/components'
import type { RunningWalletRow } from '@/features/balance/balanceCalculations'
import { buildTransactionBaseProps, formatAmount } from '@/lib'
import type { Category, Wallet } from '@/types/domain'

export type TransactionRowProps = {
  row: RunningWalletRow
  wallet: Wallet
  wallets: Wallet[]
  categories: Category[]
}

export function TransactionRow({
  row, wallet, wallets, categories,
}: TransactionRowProps) {
  const isCredit = wallet.type === 'credit_card'
  const { transaction } = row
  const category = transaction.type !== 'transfer'
    ? categories.find((c) => c.id === transaction.items[0]?.categoryId)
    : undefined
  const base = buildTransactionBaseProps(transaction, category, wallets)

  return (
    <div className="mb-2">
      <SharedTransactionRow
        {...base}
        amount={`${row.amount >= 0
          ? '+'
          : '-'}${formatAmount(Math.abs(row.amount), wallet.currency)}`}
        amountColor={row.amount >= 0
          ? 'text-income'
          : 'text-expense'}
        secondaryAmount={isCredit
          ? `${formatAmount(row.runningAmount, wallet.currency)} debt`
          : formatAmount(row.runningAmount, wallet.currency)}
        secondaryAmountColor={isCredit
          ? 'text-expense/70'
          : 'text-white/28'}
      />
    </div>
  )
}
