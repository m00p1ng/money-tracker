import { useState } from 'react'

import {
  DatePicker,
  DateRangePresetPicker,
  Icon,
  PageHeader,
  TransactionRow,
} from '@/components'
import { isReconciliationEnabled, walletRunningRows } from '@/features/balance/balanceCalculations'
import {
  buildTransactionRowDisplay,
  getPresetRange,
  transactionAmountColor,
  type DateRange,
  type DateRangePreset,
} from '@/lib'
import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

import {
  DateRangeHeader,
  SwipeableTransactionRow,
  WalletSummaryCard,
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
  const reconciliation = isReconciliationEnabled(wallet)

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

      {reconciliation && (
        <WalletSummaryCard
          wallet={wallet}
          currentAmount={currentAmount}
          clearedAmount={clearedAmount}
        />
      )}

      <DateRangeHeader
        range={range}
        onClickStart={() => setStartPickerOpen(true)}
        onClickEnd={() => setEndPickerOpen(true)}
        onOpenPreset={() => setPresetSheetOpen(true)}
      />

      <section>
        {rows.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No transactions</p>}
        {rows.map((row) => {
          if (reconciliation) {
            return (
              <SwipeableTransactionRow
                key={row.transaction.id}
                row={row}
                wallets={wallets}
                categories={categories}
                onToggleCleared={onToggleCleared}
              />
            )
          }

          return (
            <div className="mb-2">
              <TransactionRow
                {...buildTransactionRowDisplay({
                  transaction: row.transaction,
                  findCategory: (categoryId) => categories.find((c) => c.id === categoryId),
                  wallets,
                  amount: Math.abs(row.amount),
                  amountColor: transactionAmountColor(row.transaction, row.amount),
                  secondaryAmount: row.runningAmount,
                  secondaryAmountColor: 'text-white/28',
                })}
              />
            </div>
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
