import { useTransactionPage } from './useTransactionPage'
import { TransactionPage } from './TransactionPage'

export function TransactionPageContainer() {
  const props = useTransactionPage()
  return <TransactionPage {...props} />
}
