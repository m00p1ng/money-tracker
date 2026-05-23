import { useWalletFormPage } from './useWalletFormPage'
import { WalletFormPage } from './WalletFormPage'

export function WalletFormPageContainer() {
  const props = useWalletFormPage()
  return <WalletFormPage {...props} />
}
