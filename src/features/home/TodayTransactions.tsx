import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
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
        <h2 className="text-[11px] font-semibold uppercase tracking-[2px] text-white/30">Today</h2>
        <span className="text-sm text-slate-400">{formatShortDate(new Date())}</span>
      </div>
      <div className="space-y-2">
        {transactions.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No transactions today</p> : null}
        {transactions.map((transaction) =>
          transaction.items.map((item, index) => {
            const category = findCategory(item.categoryId)
            const parent = category ? parentOf(category) : undefined
            return (
              <Link key={`${transaction.id}-${index}`} to={`/transaction/${transaction.id}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3.5 backdrop-blur transition-colors hover:bg-white/[0.07]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${category?.color ?? '#64748b'}25`, color: category?.color ?? '#94a3b8' }}>
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
      </div>
    </section>
  )
}
