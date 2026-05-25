import React, { useState } from 'react'

import { Button } from '@/components'
import { WalletRow } from '@/features/balance/BalancePage/WalletRow/WalletRow'
import { SwipeableTransactionRow } from '@/features/balance/WalletDetailPage/SwipeableTransactionRow'
import { HomeTitle } from '@/features/home/HomePage/components/HomeTitle'
import { SummaryCards } from '@/features/home/HomePage/components/SummaryCards'
import { TodayTransactions } from '@/features/home/HomePage/components/TodayTransactions'
import { UpcomingTransactions } from '@/features/home/HomePage/components/UpcomingTransactions'
import { CurrencyRow } from '@/features/settings/CurrenciesPage/CurrencyRow/CurrencyRow'
import { CalculatorKeyboard } from '@/features/transaction/TransactionPage/components/CalculatorKeyboard'
import { CalculatorKeyboardSheet } from '@/features/transaction/TransactionPage/components/CalculatorKeyboardSheet'
import { CategoryItemsCard } from '@/features/transaction/TransactionPage/components/CategoryItemsCard'
import { DateTimeRow } from '@/features/transaction/TransactionPage/components/DateTimeRow'
import { ExchangeRateRow } from '@/features/transaction/TransactionPage/components/ExchangeRateRow'
import { NoteField } from '@/features/transaction/TransactionPage/components/NoteField'
import { ReconciliationRow } from '@/features/transaction/TransactionPage/components/ReconciliationRow'
import { RepeatRow } from '@/features/transaction/TransactionPage/components/RepeatRow'
import { TransactionHeader } from '@/features/transaction/TransactionPage/components/TransactionHeader'
import { TransactionSheets } from '@/features/transaction/TransactionPage/components/TransactionSheets'
import { WalletSelectorRow } from '@/features/transaction/TransactionPage/components/WalletSelectorRow'
import type {
  Category,
  Currency,
  RepeatConfig,
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

const STUB_CURRENCY_USD: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  isBase: true,
  rate: 1,
}

const STUB_CURRENCY_EUR: Currency = {
  code: 'EUR',
  symbol: '€',
  name: 'Euro',
  isBase: false,
  rate: 0.92,
}

const STUB_REPEAT_NEVER: RepeatConfig = { preset: 'never' }
const STUB_REPEAT_DAILY: RepeatConfig = { preset: 'daily' }

const STUB_DATE_PAST = new Date(Date.now() - 86400000).toISOString()
const STUB_DATE_FUTURE = new Date(Date.now() + 86400000).toISOString()

function VariantLabel({ label }: { label: string }) {
  return <p className="mt-2 text-center text-xs text-white/30">{label}</p>
}

export function FeatureSection() {
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [cleared, setCleared] = useState(false)
  const [note, setNote] = useState('Lunch with team')
  const [exchangeRate, setExchangeRate] = useState('0.92')
  const [calcSheetOpen, setCalcSheetOpen] = useState(false)
  const [txSheetsDateOpen, setTxSheetsDateOpen] = useState(false)
  const [txSheetsDate, setTxSheetsDate] = useState(new Date().toISOString())
  const [txSheetsWallet, setTxSheetsWallet] = useState('w1')
  const [txSheetsCurrency, setTxSheetsCurrency] = useState('USD')
  const [txSheetsRepeat, setTxSheetsRepeat] = useState<RepeatConfig>({ preset: 'never' })

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-lg font-bold">Feature Components</h2>
        <p className="mt-1 text-sm text-white/40">
          Rendered with stub data. Zero values and empty lists are expected.
        </p>
      </div>

      <PageGroup label="Home">
        <SubSection id="home-title" title="HomeTitle">
          <HomeTitle onAddTransaction={() => { }} />
        </SubSection>

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
            onToggleCleared={() => { }}
          />
        </SubSection>
      </PageGroup>

      <PageGroup label="Transaction">
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
            findCategory={() => undefined}
          />
        </SubSection>
      </PageGroup>

      <PageGroup label="Transaction Form">
        <SubSection id="transaction-header" title="TransactionHeader">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <TransactionHeader
              type={txType}
              onChangeType={setTxType}
              onBack={() => { }}
              onSave={async () => { }}
            />
          </div>
          <VariantLabel label={`current type: ${txType}`} />
        </SubSection>

        <SubSection id="date-time-row" title="DateTimeRow">
          <div className="space-y-2">
            <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
              <DateTimeRow
                date={STUB_DATE_PAST}
                isPlanned={false}
                onClick={() => { }}
              />
            </div>
            <VariantLabel label="past date (normal)" />
            <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
              <DateTimeRow
                date={STUB_DATE_FUTURE}
                isPlanned={true}
                onClick={() => { }}
              />
            </div>
            <VariantLabel label="future date (planned badge)" />
          </div>
        </SubSection>

        <SubSection id="wallet-selector-row" title="WalletSelectorRow">
          <div className="space-y-2">
            <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
              <WalletSelectorRow
                ariaLabel="Select wallet"
                label="Wallet"
                wallet={STUB_WALLET_PAYMENT}
                fallbackName="Select wallet"
                fallbackColor="#6c47ff"
                onClick={() => { }}
              />
            </div>
            <VariantLabel label="without balance" />
            <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
              <WalletSelectorRow
                ariaLabel="Select wallet"
                label="Wallet"
                wallet={STUB_WALLET_PAYMENT}
                fallbackName="Select wallet"
                fallbackColor="#6c47ff"
                showBalance
                onClick={() => { }}
              />
            </div>
            <VariantLabel label="with balance" />
          </div>
        </SubSection>

        <SubSection id="note-field" title="NoteField">
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            <NoteField
              note={note}
              onUpdateNote={setNote}
              onFocusNoteField={() => { }}
            />
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
              <ReconciliationRow cleared={false} onToggle={() => { }} />
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
              <RepeatRow repeatConfig={STUB_REPEAT_NEVER} onClick={() => { }} />
            </div>
            <VariantLabel label="never" />
            <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
              <RepeatRow repeatConfig={STUB_REPEAT_DAILY} onClick={() => { }} />
            </div>
            <VariantLabel label="daily" />
          </div>
        </SubSection>

        <SubSection id="calculator-keyboard-sheet" title="CalculatorKeyboardSheet">
          <div className="space-y-3">
            <Button variant="ghost" onClick={() => setCalcSheetOpen(true)}>Open CalculatorKeyboardSheet</Button>
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

        <SubSection id="transaction-sheets" title="TransactionSheets">
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setTxSheetsDateOpen(true)}
            >
              Open DatePicker via TransactionSheets
            </Button>
            <TransactionSheets
              date={txSheetsDate}
              walletPickerTarget={null}
              isRepeatPickerOpen={false}
              isCurrencyPickerOpen={false}
              isDatePickerOpen={txSheetsDateOpen}
              wallets={[STUB_WALLET_PAYMENT, STUB_WALLET_CREDIT]}
              currencies={[STUB_CURRENCY_USD, STUB_CURRENCY_EUR]}
              walletId={txSheetsWallet}
              toWalletId={undefined}
              currency={txSheetsCurrency}
              repeatConfig={txSheetsRepeat}
              onUpdateDate={(d) => {
                setTxSheetsDate(d.toISOString()); setTxSheetsDateOpen(false)
              }}
              onUpdateWallet={setTxSheetsWallet}
              onUpdateToWallet={() => { }}
              onUpdateCurrency={setTxSheetsCurrency}
              onUpdateRepeatConfig={setTxSheetsRepeat}
              onCloseWalletPicker={() => { }}
              onCloseCurrencyPicker={() => { }}
              onCloseDatePicker={() => setTxSheetsDateOpen(false)}
              onCloseRepeatPicker={() => { }}
            />
            <VariantLabel label="date picker sheet" />
          </div>
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
