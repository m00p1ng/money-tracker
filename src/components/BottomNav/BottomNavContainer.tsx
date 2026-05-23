import { BottomNav } from './BottomNav'
import { useBottomNav } from './useBottomNav'

export function BottomNavContainer() {
  const props = useBottomNav()
  return <BottomNav {...props} />
}
