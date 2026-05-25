import { Link } from 'react-router'

import { Card, Icon } from '@/components'
import type { RunningWalletRow } from '@/features/balance/balanceCalculations'
import { formatAmount, hexToRgba } from '@/lib'
import type { Category, Wallet } from '@/types/domain'

export type TransactionRowProps = {
  row: RunningWalletRow
  wallet: Wallet
  categories: Category[]
}

export function TransactionRow({
  row, wallet, categories,
}: TransactionRowProps) {
  const isCredit = wallet.type === 'credit_card'
  const category = categories.find((c) => c.id === row.transaction.items[0]?.categoryId)
  const iconColor = category?.color ?? wallet.color

  return (
    <Link to={`/transaction/${row.transaction.id}`} className="mb-2 block">
      <Card className="flex items-center gap-2.5 transition-opacity active:opacity-70">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm"
          style={{ background: hexToRgba(iconColor, 0.15), color: iconColor }}
        >
          <Icon name={category?.icon ?? 'fa-ellipsis'} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{category?.name ?? row.transaction.type}</p>
          <p className="mt-0.5 text-xs text-white/30">
            {new Date(row.transaction.date).toLocaleDateString()}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={row.amount >= 0
            ? 'text-sm font-bold text-income'
            : 'text-sm font-bold text-expense'}>
            {row.amount >= 0
              ? '+'
              : '-'}{formatAmount(Math.abs(row.amount), wallet.currency)}
          </p>
          <p className={isCredit
            ? 'mt-0.5 text-xs text-expense/70'
            : 'mt-0.5 text-xs text-white/28'}>
            {isCredit
              ? `${formatAmount(row.runningAmount, wallet.currency)} debt`
              : formatAmount(row.runningAmount, wallet.currency)}
          </p>
        </div>
      </Card>
    </Link>
  )
}
