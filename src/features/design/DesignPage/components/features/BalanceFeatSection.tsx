import { SwipeableTransactionRow, WalletSummaryCard } from '@/features/balance'

import { SubSection, VariantLabel } from '../sectionHelpers'

import {
  STUB_CATEGORY,
  STUB_TRANSACTION,
  STUB_WALLET_CREDIT,
  STUB_WALLET_PAYMENT,
} from './stubs'

export function BalanceFeatSection() {
  return (
    <div className="space-y-8">
      <SubSection id="wallet-summary-card" title="WalletSummaryCard">
        <div className="rounded-2xl border border-white/6 bg-white/4 p-4">
          <WalletSummaryCard
            wallet={STUB_WALLET_PAYMENT}
            currentAmount={500}
            clearedAmount={420}
          />
        </div>
        <VariantLabel label="Payment Account" />

        <div className="rounded-2xl border border-white/6 bg-white/4 p-4 mt-8">
          <WalletSummaryCard
            wallet={STUB_WALLET_CREDIT}
            currentAmount={-1200}
            clearedAmount={-800}
          />
        </div>
        <VariantLabel label="Credit Card" />
      </SubSection>

      <SubSection id="swipeable-transaction-row" title="SwipeableTransactionRow">
        <SwipeableTransactionRow
          row={{
            transaction: STUB_TRANSACTION,
            amount: 12.5,
            runningAmount: 487.5,
          }}
          wallets={[STUB_WALLET_PAYMENT]}
          categories={[STUB_CATEGORY]}
          onToggleCleared={() => {}}
        />
      </SubSection>

    </div>
  )
}
