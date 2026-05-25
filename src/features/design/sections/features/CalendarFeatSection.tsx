import { CalendarPageView } from '@/features/calendar'

import { SubSection, VariantLabel } from '../sectionHelpers'

export function CalendarFeatSection() {
  return (
    <div className="space-y-8">
      <SubSection id="calendar-page" title="CalendarPage">
        <VariantLabel label="Default (today selected)" />
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <CalendarPageView
            currentYear={2026}
            currentMonth={4}
            today="2026-05-25"
            selectedDate="2026-05-25"
            indicatorMap={{
              '2026-05-01': 'transaction',
              '2026-05-06': 'transaction',
              '2026-05-15': 'both',
              '2026-05-25': 'transaction',
              '2026-05-28': 'upcoming',
            }}
            listRows={[
              {
                key: 'demo-1',
                to: '#',
                icon: 'fa-utensils',
                iconBg: '#65a30d25',
                iconColor: '#65a30d',
                primaryLabel: 'Food & Drink',
                secondaryLabel: 'Lifestyle',
                amount: '-฿120.00',
                amountColor: 'text-expense',
              },
            ]}
            onSelectDate={() => {}}
            onPrev={() => {}}
            onNext={() => {}}
            onAdd={() => {}}
            onBack={() => {}}
            onSearch={() => {}}
          />
        </div>
      </SubSection>
    </div>
  )
}
