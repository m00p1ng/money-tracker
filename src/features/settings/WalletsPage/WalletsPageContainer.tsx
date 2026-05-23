import { useWalletsPage } from './useWalletsPage'
import { WalletsPage } from './WalletsPage'

export function WalletsPageContainer() {
  const props = useWalletsPage()
  return <WalletsPage {...props} />
}
