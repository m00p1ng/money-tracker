import { useState } from 'react'

import { Button } from '@/components'
import {
  CalculatorKeyboard,
  CalculatorKeyboardSheet,
  CategoryItemsCardView,
  DateTimeRow,
  ExchangeRateRow,
  NoteField,
  ReconciliationRow,
  RepeatRow,
  TransactionHeader,
  WalletSelectorRow,
} from '@/features/transaction'
import type { TransactionType } from '@/types/domain'

import { SubSection, VariantLabel } from '../sectionHelpers'

import {
  STUB_DATE_FUTURE,
  STUB_DATE_PAST,
  STUB_REPEAT_DAILY,
  STUB_REPEAT_NEVER,
  STUB_WALLET_PAYMENT,
} from './stubs'

export function TransactionFeatSection() {
  const [txType, setTxType] = useState<TransactionType>('expense')
  const [cleared, setCleared] = useState(false)
  const [note, setNote] = useState('Lunch with team')
  const [exchangeRate, setExchangeRate] = useState('0.92')
  const [calcSheetOpen, setCalcSheetOpen] = useState(false)

  return (
    <div className="space-y-8">
      <SubSection id="calculator-keyboard" title="CalculatorKeyboard">
        <CalculatorKeyboard onPress={() => {}} onDismiss={() => {}} />
      </SubSection>

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

      <SubSection id="date-time-row" title="DateTimeRow">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <DateTimeRow date={STUB_DATE_PAST} status="paid" onClick={() => {}} onToggleStatus={() => {}} />
          </div>
          <VariantLabel label="paid" />
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <DateTimeRow date={STUB_DATE_PAST} status="overdue" onClick={() => {}} onToggleStatus={() => {}} />
          </div>
          <VariantLabel label="overdue" />
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <DateTimeRow date={STUB_DATE_FUTURE} status="planned" onClick={() => {}} onToggleStatus={() => {}} />
          </div>
          <VariantLabel label="planned" />
        </div>
      </SubSection>

      <SubSection id="wallet-selector-row" title="WalletSelectorRow">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <WalletSelectorRow
              ariaLabel="Select wallet"
              wallet={STUB_WALLET_PAYMENT}
              fallbackName="Select wallet"
              fallbackColor="#6c47ff"
              onClick={() => {}}
            />
          </div>
          <VariantLabel label="without balance" />
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <WalletSelectorRow
              ariaLabel="Select wallet"
              wallet={STUB_WALLET_PAYMENT}
              fallbackName="Select wallet"
              fallbackColor="#6c47ff"
              showBalance
              onClick={() => {}}
            />
          </div>
          <VariantLabel label="with balance" />
        </div>
      </SubSection>

      <SubSection id="note-field" title="NoteField">
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
          <NoteField note={note} onUpdateNote={setNote} onFocusNoteField={() => {}} />
        </div>
      </SubSection>

      <SubSection id="exchange-rate-row" title="ExchangeRateRow">
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
          <ExchangeRateRow
            label="USD → EUR"
            value={exchangeRate}
            defaultRate="0.92"
            onChange={setExchangeRate}
          />
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

      <SubSection id="calculator-keyboard-sheet" title="CalculatorKeyboardSheet">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setCalcSheetOpen(true)}>
            Open CalculatorKeyboardSheet
          </Button>
          <CalculatorKeyboardSheet
            isOpen={calcSheetOpen}
            onPress={(key) => {
              if (key === 'confirm') {
                setCalcSheetOpen(false)
              }
            }}
          />
        </div>
      </SubSection>
    </div>
  )
}
