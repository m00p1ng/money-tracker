import { CurrencyRow } from '@/features/settings'

import { SubSection } from '../sectionHelpers'

export function SettingsFeatSection() {
  return (
    <div className="space-y-8">
      <SubSection id="currency-row" title="CurrencyRow">
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
          <CurrencyRow code="USD" isBase={true} rate={1} baseCode="USD" />
          <CurrencyRow code="EUR" isBase={false} rate={0.92} baseCode="USD" />
          <CurrencyRow code="THB" isBase={false} rate={35.5} baseCode="USD" />
        </div>
      </SubSection>
    </div>
  )
}
