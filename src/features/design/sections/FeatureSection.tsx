// src/features/design/sections/FeatureSection.tsx
import { SummaryCards } from '@/features/home/SummaryCards'
import { TodayTransactions } from '@/features/home/TodayTransactions'
import { UpcomingTransactions } from '@/features/home/UpcomingTransactions'
import { CalculatorKeyboard } from '@/features/transaction/CalculatorKeyboard'
import { CategoryItemsCard } from '@/features/transaction/CategoryItemsCard'

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h3 className="mb-3 text-base font-semibold text-white/70">{title}</h3>
      {children}
      <hr className="mt-6 border-white/[0.06]" />
    </section>
  )
}

export function FeatureSection() {
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold">Feature Components</h2>
      <p className="text-sm text-white/40">
        Components rendered with empty/stub store state. Zero values and empty lists are expected.
      </p>

      <SubSection id="summary-cards" title="SummaryCards">
        <SummaryCards />
      </SubSection>

      <SubSection id="calculator-keyboard" title="CalculatorKeyboard">
        <CalculatorKeyboard onPress={() => { }} onDismiss={() => { }} />
      </SubSection>

      <SubSection id="category-items-card" title="CategoryItemsCard">
        <CategoryItemsCard
          items={[
            { categoryId: 'stub-1', amount: 500 },
            { categoryId: 'stub-2', amount: 250 },
          ]}
          focusedIndex={0}
          onFocus={() => { }}
          onAdd={() => { }}
          onRemove={() => { }}
          onChangeCategory={() => { }}
        />
      </SubSection>

      <SubSection id="today-transactions" title="TodayTransactions">
        <TodayTransactions />
      </SubSection>

      <SubSection id="upcoming-transactions" title="UpcomingTransactions">
        <UpcomingTransactions />
      </SubSection>
    </div>
  )
}
