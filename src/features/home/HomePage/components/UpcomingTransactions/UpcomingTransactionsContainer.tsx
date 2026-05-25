import { UpcomingTransactions } from './UpcomingTransactions'
import { useUpcomingTransactions } from './useUpcomingTransactions'

export function UpcomingTransactionsContainer() {
  const props = useUpcomingTransactions()

  return <UpcomingTransactions {...props} />
}
