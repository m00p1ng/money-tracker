import { useNavigate } from 'react-router'

import { useNavigationDirection } from '@/context/navigationDirection'

export function useHomePage() {
  const navigate = useNavigate()
  const { setDirection } = useNavigationDirection()

  function onAddTransaction() {
    setDirection('forward')
    navigate('/transaction/category')
  }

  function onNavigateToCalendar() {
    setDirection('forward')
    navigate('/calendar')
  }

  return { onAddTransaction, onNavigateToCalendar }
}
