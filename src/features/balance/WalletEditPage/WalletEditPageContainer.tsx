import { useWalletEditPage } from './useWalletEditPage'
import { WalletEditPage } from './WalletEditPage'

export function WalletEditPageContainer() {
  const props = useWalletEditPage()
  if (!props) {
    return null
  }

  return <WalletEditPage {...props} />
}
