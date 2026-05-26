import {
  HomeTitle,
  SummaryCards,
  TodayTransactions,
  UpcomingTransactions,
} from '@/features/home'

import { SubSection } from '../sectionHelpers'

export function HomeFeatSection() {
  return (
    <div className="space-y-8">
      <SubSection id="home-title" title="HomeTitle">
        <HomeTitle onAddTransaction={() => {}} onNavigateToCalendar={() => {}} />
      </SubSection>

      <SubSection id="summary-cards" title="SummaryCards">
        <SummaryCards income={0} expense={0} currency="THB" />
      </SubSection>

      <SubSection id="today-transactions" title="TodayTransactions">
        <TodayTransactions rows={[]} />
      </SubSection>

      <SubSection id="upcoming-transactions" title="UpcomingTransactions">
        <UpcomingTransactions rows={[]} />
      </SubSection>
    </div>
  )
}
