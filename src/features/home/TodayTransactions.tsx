import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { Card } from '../../components/ui/Card'
import { formatShortDate } from '../../lib/date'
import { formatAmount } from '../../lib/format'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'

export function TodayTransactions() {
  const todayTransactions = useTransactionStore((state) => state.todayTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)
  const transactions = todayTransactions()

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Today</h2>
        <span className="text-sm text-slate-400">{formatShortDate(new Date())}</span>
      </div>
      <Card className="space-y-1 p-2">
        {transactions.length === 0 ? <p className="px-2 py-8 text-center text-sm text-slate-500">No transactions today</p> : null}
        {transactions.map((transaction) =>
          transaction.items.map((item) => {
            const category = findCategory(item.categoryId)
            const parent = category ? parentOf(category) : undefined
            return (
              <Link key={`${transaction.id}-${item.categoryId}`} to={`/transaction/${transaction.id}`} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-white/5">
                <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: `${category?.color ?? '#64748b'}25`, color: category?.color ?? '#94a3b8' }}>
                  <Icon name={category?.icon ?? 'fa-ellipsis'} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{category?.name ?? 'Unknown'}</span>
                  <span className="block truncate text-sm text-slate-500">{parent?.name ?? transaction.type}</span>
                </span>
                <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatAmount(item.amount, transaction.currency)}
                </span>
              </Link>
            )
          }),
        )}
      </Card>
    </section>
  )
}
