import { BalancePage } from './BalancePage'
import { useBalancePage } from './useBalancePage'

export function BalancePageContainer() {
  const props = useBalancePage()

  return <BalancePage {...props} />
}
