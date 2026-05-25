import { SwipeableTransactionRow, WalletRow } from '@/features/balance'
import { CreditCardStats } from '@/features/balance/WalletDetailPage/components/CreditCardStats'
import { DateRangeHeader } from '@/features/balance/WalletDetailPage/components/DateRangeHeader'
import { TransactionRow } from '@/features/balance/WalletDetailPage/components/TransactionRow'
import { WalletStats } from '@/features/balance/WalletDetailPage/components/WalletStats'

import { SubSection, VariantLabel } from '../sectionHelpers'
import {
  STUB_CATEGORY,
  STUB_RANGE,
  STUB_RUNNING_ROW,
  STUB_TRANSACTION,
  STUB_WALLET_CREDIT,
  STUB_WALLET_PAYMENT,
} from './stubs'

export function BalanceFeatSection() {
  return (
    <div className="space-y-8">
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

      <SubSection id="date-range-header" title="DateRangeHeader">
        <DateRangeHeader range={STUB_RANGE} onOpenPreset={() => {}} />
      </SubSection>

      <SubSection id="credit-card-stats" title="CreditCardStats">
        <VariantLabel label="without reconciliation" />
        <CreditCardStats
          wallet={STUB_WALLET_CREDIT}
          currentAmount={1200}
          clearedAmount={0}
          reconciliation={false}
        />
        <VariantLabel label="with reconciliation" />
        <CreditCardStats
          wallet={STUB_WALLET_CREDIT}
          currentAmount={1200}
          clearedAmount={800}
          reconciliation={true}
        />
      </SubSection>

      <SubSection id="wallet-stats" title="WalletStats">
        <VariantLabel label="without reconciliation" />
        <WalletStats
          wallet={STUB_WALLET_PAYMENT}
          currentAmount={500}
          clearedAmount={0}
          totalExpenses={120}
          reconciliation={false}
        />
        <VariantLabel label="with reconciliation" />
        <WalletStats
          wallet={STUB_WALLET_PAYMENT}
          currentAmount={500}
          clearedAmount={350}
          totalExpenses={120}
          reconciliation={true}
        />
      </SubSection>

      <SubSection id="balance-transaction-row" title="TransactionRow">
        <TransactionRow
          row={STUB_RUNNING_ROW}
          wallet={STUB_WALLET_PAYMENT}
          categories={[STUB_CATEGORY]}
        />
      </SubSection>
    </div>
  )
}
