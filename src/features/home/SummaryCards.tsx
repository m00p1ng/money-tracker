import { Icon } from '../../components/Icon'
import { Card } from '../../components/ui/Card'
import { monthRangeLabel } from '../../lib/date'
import { formatAmount } from '../../lib/format'
import { useTransactionStore } from '../../stores/transactionStore'

export function SummaryCards() {
  const monthlyIncome = useTransactionStore((state) => state.monthlyIncome)
  const monthlyExpense = useTransactionStore((state) => state.monthlyExpense)
  const income = monthlyIncome()
  const expense = monthlyExpense()

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-emerald-400/20">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
          <span>Income</span>
          <Icon name="fa-arrow-up" className="text-emerald-300" />
        </div>
        <p className="text-lg font-semibold text-emerald-300">{formatAmount(income)}</p>
        <p className="mt-1 text-[11px] text-slate-500">{monthRangeLabel()}</p>
      </Card>
      <Card className="border-rose-400/20">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
          <span>Expense</span>
          <Icon name="fa-arrow-down" className="text-rose-300" />
        </div>
        <p className="text-lg font-semibold text-rose-300">{formatAmount(expense)}</p>
        <p className="mt-1 text-[11px] text-slate-500">{monthRangeLabel()}</p>
      </Card>
    </div>
  )
}
