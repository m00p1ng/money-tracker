import { SwipeableTransactionRow, WalletRow } from '@/features/balance'
import { DateRangeHeader } from '@/features/balance/WalletDetailPage/components/DateRangeHeader'

import { SubSection } from '../sectionHelpers'

import {
  STUB_CATEGORY,
  STUB_RANGE,
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
          wallets={[STUB_WALLET_PAYMENT]}
          categories={[STUB_CATEGORY]}
          onToggleCleared={() => {}}
        />
      </SubSection>

      <SubSection id="date-range-header" title="DateRangeHeader">
        <DateRangeHeader
          range={STUB_RANGE}
          onClickStart={() => {}}
          onClickEnd={() => {}}
          onOpenPreset={() => {}}
        />
      </SubSection>
    </div>
  )
}
