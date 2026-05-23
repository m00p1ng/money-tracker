import { HomePage } from './HomePage'
import { useHomePage } from './useHomePage'

export function HomePageContainer() {
  const props = useHomePage()
  return <HomePage {...props} />
}
