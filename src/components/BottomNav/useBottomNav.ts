import { useLocation } from 'react-router'

export function useBottomNav() {
  const location = useLocation()
  return { pathname: location.pathname }
}
