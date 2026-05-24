import { useNavigate } from 'react-router'

export function useHomePage() {
  const navigate = useNavigate()

  return { onAddTransaction: () => navigate('/transaction/category') }
}
