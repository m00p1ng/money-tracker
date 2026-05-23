import { useSummaryCards } from './useSummaryCards'
import { SummaryCards } from './SummaryCards'

export function SummaryCardsContainer() {
  const props = useSummaryCards()
  return <SummaryCards {...props} />
}
