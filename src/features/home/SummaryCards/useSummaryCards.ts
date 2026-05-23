import { useTransactionStore } from '@/stores/transactionStore'

export function useSummaryCards() {
  const monthlyIncome = useTransactionStore((state) => state.monthlyIncome)
  const monthlyExpense = useTransactionStore((state) => state.monthlyExpense)
  return {
    income: monthlyIncome(),
    expense: monthlyExpense(),
  }
}
