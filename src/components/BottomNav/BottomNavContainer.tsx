import { useBottomNav } from './useBottomNav'
import { BottomNav } from './BottomNav'

export function BottomNavContainer() {
  const props = useBottomNav()
  return <BottomNav {...props} />
}
