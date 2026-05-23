import { SummaryCards } from './SummaryCards'
import { useSummaryCards } from './useSummaryCards'

export function SummaryCardsContainer() {
  const props = useSummaryCards()
  return <SummaryCards {...props} />
}
