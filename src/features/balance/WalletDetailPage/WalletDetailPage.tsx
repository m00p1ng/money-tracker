import { useState } from 'react'

import {
  Card,
  DatePicker,
  DateRangePresetPicker,
  Icon,
  PageHeader,
} from '@/components'
import { isReconciliationEnabled, walletRunningRows } from '@/features/balance/balanceCalculations'
import {
  getPresetRange,
  type DateRange,
  type DateRangePreset,
} from '@/lib'
import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

import {
  CreditCardStats,
  DateRangeHeader,
  SwipeableTransactionRow,
  TransactionRow,
  WalletStats,
} from './components'

export type WalletDetailPageProps = {
  wallet: Wallet | undefined
  wallets: Wallet[]
  transactions: Transaction[]
  categories: Category[]
  currentAmount: number
  clearedAmount: number
  onAdd: () => void
  onBack: () => void
  onSearch: () => void
  onToggleCleared: (id: string) => void
}

export function WalletDetailPage({
  wallet,
  wallets,
  transactions,
  categories,
  currentAmount,
  clearedAmount,
  onAdd,
  onBack,
  onSearch,
  onToggleCleared,
}: WalletDetailPageProps) {
  const [range, setRange] = useState<DateRange>(getPresetRange('this-month'))
  const [isPresetSheetOpen, setPresetSheetOpen] = useState(false)
  const [isStartPickerOpen, setStartPickerOpen] = useState(false)
  const [isEndPickerOpen, setEndPickerOpen] = useState(false)

  if (!wallet) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Wallet not found</h1>
        <button type="button" className="text-accent" onClick={onBack}>Back to Balance</button>
      </section>
    )
  }

  const rows = walletRunningRows(wallet, transactions, range)
  const isCredit = wallet.type === 'credit_card'
  const reconciliation = isReconciliationEnabled(wallet)

  const totalExpenses = rows
    .filter((row) => row.amount < 0)
    .reduce((sum, row) => sum + Math.abs(row.amount), 0)

  function handlePresetSelect(preset: DateRangePreset) {
    setRange(getPresetRange(preset))
    setPresetSheetOpen(false)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={wallet.name}
        onBack={onBack}
        rightSlot={(
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={onSearch}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-300"
            >
              <Icon name="fa-magnifying-glass" />
            </button>
            <button
              type="button"
              aria-label="Add transaction"
              onClick={onAdd}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 active:bg-white/5"
            >
              <Icon name="fa-plus" />
            </button>
          </div>
        )}
      />

      <DateRangeHeader
        range={range}
        onClickStart={() => setStartPickerOpen(true)}
        onClickEnd={() => setEndPickerOpen(true)}
        onOpenPreset={() => setPresetSheetOpen(true)}
      />

      {isCredit && wallet.creditLimit
        ? (
          <CreditCardStats
            wallet={wallet}
            currentAmount={currentAmount}
            clearedAmount={clearedAmount}
            reconciliation={reconciliation}
          />
        )
        : (
          <WalletStats
            wallet={wallet}
            currentAmount={currentAmount}
            clearedAmount={clearedAmount}
            totalExpenses={totalExpenses}
            reconciliation={reconciliation}
          />
        )}

      <section>
        {rows.length === 0 && <Card className="text-sm text-slate-400">No transactions in this range.</Card>}
        {rows.map((row) => {
          if (reconciliation) {
            return (
              <SwipeableTransactionRow
                key={row.transaction.id}
                row={row}
                wallet={wallet}
                wallets={wallets}
                categories={categories}
                onToggleCleared={onToggleCleared}
              />
            )
          }

          return (
            <TransactionRow
              key={row.transaction.id}
              row={row}
              wallet={wallet}
              wallets={wallets}
              categories={categories}
            />
          )
        })}
      </section>

      <DatePicker
        isOpen={isStartPickerOpen}
        title="Start Date"
        value={range.start}
        onChange={(date) => setRange((prev) => ({ ...prev, start: date }))}
        onClose={() => setStartPickerOpen(false)}
      />

      <DatePicker
        isOpen={isEndPickerOpen}
        title="End Date"
        value={range.end}
        onChange={(date) => setRange((prev) => ({ ...prev, end: date }))}
        onClose={() => setEndPickerOpen(false)}
      />

      <DateRangePresetPicker
        isOpen={isPresetSheetOpen}
        value="this-month"
        onSelect={handlePresetSelect}
        onClose={() => setPresetSheetOpen(false)}
      />
    </div>
  )
}
