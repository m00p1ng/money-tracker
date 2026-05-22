import { useNavigate } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/Icon'

export function TransactionPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Button aria-label="Back" onClick={() => navigate('/')} type="button">
        <Icon name="fa-chevron-left" />
      </Button>
    </div>
  )
}
