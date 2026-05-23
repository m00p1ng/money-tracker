import { useTodayTransactions } from './useTodayTransactions'
import { TodayTransactions } from './TodayTransactions'

export function TodayTransactionsContainer() {
  const props = useTodayTransactions()
  return <TodayTransactions {...props} />
}
