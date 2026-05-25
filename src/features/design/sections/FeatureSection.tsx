import React, { useState } from 'react'

import { Button } from '@/components'
import { SwipeableTransactionRow, WalletRow } from '@/features/balance'
import { CalendarPageView } from '@/features/calendar'
import { CreditCardStats } from '@/features/balance/WalletDetailPage/components/CreditCardStats'
import { DateRangeHeader } from '@/features/balance/WalletDetailPage/components/DateRangeHeader'
import { TransactionRow } from '@/features/balance/WalletDetailPage/components/TransactionRow'
import { WalletStats } from '@/features/balance/WalletDetailPage/components/WalletStats'
import {
  HomeTitle,
  SummaryCards,
  TodayTransactions,
  UpcomingTransactions,
} from '@/features/home'
import { CurrencyRow } from '@/features/settings'
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
  TransactionSheets,
  WalletSelectorRow,
} from '@/features/transaction'
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

const STUB_RUNNING_ROW = {
  transaction: STUB_TRANSACTION,
  amount: -12.5,
  runningAmount: 487.5,
}

const STUB_RANGE = { start: '2026-05-01', end: '2026-05-31' }

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
          <HomeTitle onAddTransaction={() => { }} onNavigateToCalendar={() => { }} />
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

        <SubSection id="transaction-row" title="TransactionRow">
          <TransactionRow
            row={STUB_RUNNING_ROW}
            wallet={STUB_WALLET_PAYMENT}
            categories={[STUB_CATEGORY]}
          />
        </SubSection>
      </PageGroup>

      <PageGroup label="Transaction">
        <SubSection id="calculator-keyboard" title="CalculatorKeyboard">
          <CalculatorKeyboard onPress={() => { }} onDismiss={() => { }} />
        </SubSection>

        <SubSection id="category-items-card" title="CategoryItemsCard">
          <CategoryItemsCardView
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

      <PageGroup label="Calendar">
        <SubSection id="calendar-page" title="CalendarPage">
          <VariantLabel label="Default (today selected)" />
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <CalendarPageView
              currentYear={2026}
              currentMonth={4}
              today="2026-05-25"
              selectedDate="2026-05-25"
              indicatorMap={{
                '2026-05-01': 'transaction',
                '2026-05-06': 'transaction',
                '2026-05-15': 'both',
                '2026-05-25': 'transaction',
                '2026-05-28': 'upcoming',
              }}
              listRows={[
                {
                  key: 'demo-1',
                  to: '#',
                  icon: 'fa-utensils',
                  iconBg: '#65a30d25',
                  iconColor: '#65a30d',
                  primaryLabel: 'Food & Drink',
                  secondaryLabel: 'Lifestyle',
                  amount: '-฿120.00',
                  amountColor: 'text-expense',
                },
              ]}
              listHeader="25 May"
              onSelectDate={() => {}}
              onPrev={() => {}}
              onNext={() => {}}
              onAdd={() => {}}
              onBack={() => {}}
              onSearch={() => {}}
            />
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
