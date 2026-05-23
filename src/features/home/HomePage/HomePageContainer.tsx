import { useHomePage } from './useHomePage'
import { HomePage } from './HomePage'

export function HomePageContainer() {
  const props = useHomePage()
  return <HomePage {...props} />
}
