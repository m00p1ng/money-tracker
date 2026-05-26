import {
  useTransactionStore,
  useWalletStore,
} from '@/stores'

export function useSummaryCards() {
  const monthlyIncome = useTransactionStore((state) => state.monthlyIncome)
  const monthlyExpense = useTransactionStore((state) => state.monthlyExpense)
  const wallets = useWalletStore((state) => state.items)
  const currency = wallets[0]?.currency ?? 'THB'

  return {
    income: monthlyIncome(),
    expense: monthlyExpense(),
    currency,
  }
}
