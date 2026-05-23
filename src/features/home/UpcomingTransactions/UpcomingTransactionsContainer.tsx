import { useUpcomingTransactions } from './useUpcomingTransactions'
import { UpcomingTransactions } from './UpcomingTransactions'

export function UpcomingTransactionsContainer() {
  const props = useUpcomingTransactions()
  return <UpcomingTransactions {...props} />
}
