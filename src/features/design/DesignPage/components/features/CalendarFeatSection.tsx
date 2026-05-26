import { CalendarGrid } from '@/features/calendar/CalendarPage/components/CalendarGrid'

import { SubSection, VariantLabel } from '../sectionHelpers'

export function CalendarFeatSection() {
  return (
    <div className="space-y-8">
      <SubSection id="calendar-grid" title="CalendarGrid">
        <div className="overflow-hidden rounded-2xl border border-white/10 p-3">
          <CalendarGrid
            year={2026}
            month={4}
            today="2026-05-25"
            selectedDate="2026-05-25"
            indicatorMap={{
              '2026-05-01': 'transaction',
              '2026-05-06': 'transaction',
              '2026-05-15': 'both',
              '2026-05-25': 'transaction',
              '2026-05-28': 'upcoming',
            }}
            onSelectDate={() => {}}
            onPrev={() => {}}
            onNext={() => {}}
          />
        </div>
        <VariantLabel label="Default (today selected)" />
      </SubSection>
    </div>
  )
}
