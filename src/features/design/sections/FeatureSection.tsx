import type React from 'react'

import { WalletRow } from '@/features/balance/BalancePage/WalletRow/WalletRow'
import { SwipeableTransactionRow } from '@/features/balance/WalletDetailPage/SwipeableTransactionRow'
import { SummaryCards } from '@/features/home/SummaryCards'
import { TodayTransactions } from '@/features/home/TodayTransactions'
import { UpcomingTransactions } from '@/features/home/UpcomingTransactions'
import { CurrencyRow } from '@/features/settings/CurrenciesPage/CurrencyRow/CurrencyRow'
import { CalculatorKeyboard } from '@/features/transaction/CalculatorKeyboard'
import { CategoryItemsCard } from '@/features/transaction/CategoryItemsCard'
import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

interface SubSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function SubSection({
  id,
  title,
  children,
}: SubSectionProps) {
  return (
    <section id={id} className="scroll-mt-8">
      <h3 className="mb-3 text-base font-semibold text-white/70">{title}</h3>
      {children}
      <hr className="mt-6 border-white/6" />
    </section>
  )
}

function PageGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <h3 className="text-sm font-bold uppercase tracking-[2px] text-white/30">{label}</h3>
      {children}
    </div>
  )
}

const STUB_WALLET_PAYMENT: Wallet = {
  id: 'w1',
  name: 'Cash',
  type: 'payment',
  currency: 'USD',
  balance: 500,
  color: '#22c55e',
  icon: 'fa-wallet',
}

const STUB_WALLET_CREDIT: Wallet = {
  id: 'w2',
  name: 'Credit Card',
  type: 'credit_card',
  currency: 'USD',
  balance: 1200,
  creditLimit: 5000,
  color: '#3b82f6',
  icon: 'fa-credit-card',
}

const STUB_CATEGORY: Category = {
  id: 'cat-1',
  name: 'Food',
  type: 'expense',
  level: 1,
  icon: 'fa-burger',
  color: '#ef4444',
  isDefault: true,
}

const STUB_TRANSACTION: Transaction = {
  id: 'tx-1',
  type: 'expense',
  walletId: 'w1',
  currency: 'USD',
  items: [{ categoryId: 'cat-1', amount: 12.5 }],
  date: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  cleared: false,
}

export function FeatureSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-lg font-bold">Feature Components</h2>
        <p className="mt-1 text-sm text-white/40">
          Rendered with stub data. Zero values and empty lists are expected.
        </p>
      </div>

      <PageGroup label="Home">
        <SubSection id="summary-cards" title="SummaryCards">
          <SummaryCards income={0} expense={0} />
        </SubSection>

        <SubSection id="today-transactions" title="TodayTransactions">
          <TodayTransactions rows={[]} />
        </SubSection>

        <SubSection id="upcoming-transactions" title="UpcomingTransactions">
          <UpcomingTransactions rows={[]} />
        </SubSection>
      </PageGroup>

      <PageGroup label="Balance">
        <SubSection id="wallet-row" title="WalletRow">
          <div className="space-y-0">
            <WalletRow wallet={STUB_WALLET_PAYMENT} amount={500} />
            <WalletRow wallet={STUB_WALLET_CREDIT} amount={1200} />
          </div>
        </SubSection>

        <SubSection id="swipeable-transaction-row" title="SwipeableTransactionRow">
          <SwipeableTransactionRow
            row={{
              transaction: STUB_TRANSACTION,
              amount: 12.5,
              runningAmount: 487.5,
            }}
            wallet={STUB_WALLET_PAYMENT}
            categories={[STUB_CATEGORY]}
            onToggleCleared={() => {}}
          />
        </SubSection>
      </PageGroup>

      <PageGroup label="Transaction">
        <SubSection id="calculator-keyboard" title="CalculatorKeyboard">
          <CalculatorKeyboard onPress={() => {}} onDismiss={() => {}} />
        </SubSection>

        <SubSection id="category-items-card" title="CategoryItemsCard">
          <CategoryItemsCard
            items={[
              { categoryId: 'stub-1', amount: 500 },
              { categoryId: 'stub-2', amount: 250 },
            ]}
            focusedIndex={0}
            onFocus={() => {}}
            onAdd={() => {}}
            onRemove={() => {}}
            onChangeCategory={() => {}}
            findCategory={() => undefined}
            parentOf={() => undefined}
          />
        </SubSection>
      </PageGroup>

      <PageGroup label="Settings">
        <SubSection id="currency-row" title="CurrencyRow">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <CurrencyRow code="USD" isBase={true} rate={1} baseCode="USD" />
            <CurrencyRow code="EUR" isBase={false} rate={0.92} baseCode="USD" />
            <CurrencyRow code="THB" isBase={false} rate={35.5} baseCode="USD" />
          </div>
        </SubSection>
      </PageGroup>
    </div>
  )
}
