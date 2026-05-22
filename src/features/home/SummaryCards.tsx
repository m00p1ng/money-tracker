import { Icon } from '../../components/Icon'
import { formatAmount } from '../../lib/format'
import { useTransactionStore } from '../../stores/transactionStore'

export function SummaryCards() {
  const monthlyIncome = useTransactionStore((state) => state.monthlyIncome)
  const monthlyExpense = useTransactionStore((state) => state.monthlyExpense)
  const income = monthlyIncome()
  const expense = monthlyExpense()

  return (
    <div>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-white/30">This Month</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-emerald-600/5 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[1px] text-emerald-400">
            <Icon name="fa-arrow-up" />
            <span>Income</span>
          </div>
          <p className="text-xl font-bold text-emerald-300">{formatAmount(income)}</p>
        </div>
        <div className="rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-400/10 to-rose-600/5 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[1px] text-rose-400">
            <Icon name="fa-arrow-down" />
            <span>Expense</span>
          </div>
          <p className="text-xl font-bold text-rose-300">{formatAmount(expense)}</p>
        </div>
      </div>
    </div>
  )
}
