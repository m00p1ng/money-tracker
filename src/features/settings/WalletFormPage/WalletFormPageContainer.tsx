import { WalletFormPage } from './WalletFormPage'
import { useWalletFormPage } from './useWalletFormPage'

export function WalletFormPageContainer() {
  const props = useWalletFormPage()
  return <WalletFormPage {...props} />
}
