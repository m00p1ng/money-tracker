import { useWalletDetailPage } from './useWalletDetailPage'
import { WalletDetailPage } from './WalletDetailPage'

export function WalletDetailPageContainer() {
  const props = useWalletDetailPage()

  return <WalletDetailPage {...props} />
}
