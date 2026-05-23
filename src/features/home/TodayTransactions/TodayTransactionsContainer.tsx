import { TodayTransactions } from './TodayTransactions'
import { useTodayTransactions } from './useTodayTransactions'

export function TodayTransactionsContainer() {
  const props = useTodayTransactions()
  return <TodayTransactions {...props} />
}
