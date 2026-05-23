import { useBalancePage } from './useBalancePage'
import { BalancePage } from './BalancePage'

export function BalancePageContainer() {
  const props = useBalancePage()
  return <BalancePage {...props} />
}
