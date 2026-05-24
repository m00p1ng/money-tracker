import { TransactionPage } from './TransactionPage'
import { useTransactionPage } from './useTransactionPage'

export function TransactionPageContainer() {
  const props = useTransactionPage()

  return <TransactionPage {...props} />
}
