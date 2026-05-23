import { WalletsPage } from './WalletsPage'
import { useWalletsPage } from './useWalletsPage'

export function WalletsPageContainer() {
  const props = useWalletsPage()
  return <WalletsPage {...props} />
}
