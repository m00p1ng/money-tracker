import { useState } from 'react'

import {
  CategoryItemsCardView,
  ReconciliationRow,
  RepeatRow,
  TransactionHeader,
  WalletSelectorRow,
} from '@/features/transaction'
import type { TransactionType } from '@/types/domain'

import { SubSection, VariantLabel } from '../sectionHelpers'

import {
  STUB_REPEAT_DAILY,
  STUB_REPEAT_NEVER,
  STUB_WALLET_PAYMENT,
} from './stubs'

export function TransactionFeatSection() {
  const [txType, setTxType] = useState<TransactionType>('expense')
  const [cleared, setCleared] = useState(false)

  return (
    <div className="space-y-8">
      <SubSection id="category-items-card" title="CategoryItemsCard">
        <CategoryItemsCardView
          items={[
            { categoryId: 'stub-1', amount: 500 },
            { categoryId: 'stub-2', amount: 250 },
          ]}
          focusedIndex={0}
          currency="USD"
          onFocus={() => {}}
          onAdd={() => {}}
          onRemove={() => {}}
          onChangeCategory={() => {}}
          findCategory={() => undefined}
        />
      </SubSection>

      <SubSection id="transaction-header" title="TransactionHeader">
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
          <TransactionHeader
            type={txType}
            onChangeType={setTxType}
            onBack={() => {}}
            onSave={async () => {}}
          />
        </div>
        <VariantLabel label={`current type: ${txType}`} />
      </SubSection>

      <SubSection id="wallet-selector-row" title="WalletSelectorRow">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <WalletSelectorRow
              ariaLabel="Select wallet"
              wallet={STUB_WALLET_PAYMENT}
              fallbackName="Select wallet"
              onClick={() => {}}
            />
          </div>
          <VariantLabel label="without balance" />
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <WalletSelectorRow
              ariaLabel="Select wallet"
              wallet={STUB_WALLET_PAYMENT}
              fallbackName="Select wallet"
              showBalance
              onClick={() => {}}
            />
          </div>
          <VariantLabel label="with balance" />
        </div>
      </SubSection>

      <SubSection id="reconciliation-row" title="ReconciliationRow">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <ReconciliationRow cleared={false} onToggle={() => {}} />
          </div>
          <VariantLabel label="not cleared" />
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <ReconciliationRow cleared={cleared} onToggle={() => setCleared((v) => !v)} />
          </div>
          <VariantLabel label="cleared (tap to toggle)" />
        </div>
      </SubSection>

      <SubSection id="repeat-row" title="RepeatRow">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <RepeatRow repeatConfig={STUB_REPEAT_NEVER} onClick={() => {}} />
          </div>
          <VariantLabel label="never" />
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <RepeatRow repeatConfig={STUB_REPEAT_DAILY} onClick={() => {}} />
          </div>
          <VariantLabel label="daily" />
        </div>
      </SubSection>
    </div>
  )
}
