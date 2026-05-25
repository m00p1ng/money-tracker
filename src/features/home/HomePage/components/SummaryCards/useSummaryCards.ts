import { useTransactionStore } from '@/stores'

export function useSummaryCards() {
  const monthlyIncome = useTransactionStore((state) => state.monthlyIncome)
  const monthlyExpense = useTransactionStore((state) => state.monthlyExpense)

  return {
    income: monthlyIncome(),
    expense: monthlyExpense(),
  }
}
