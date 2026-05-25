import { useState } from 'react'

import {
  Card,
  DateRangePresetPicker,
  PageHeader,
  SectionDivider,
} from '@/components'
import { isReconciliationEnabled, walletRunningRows } from '@/features/balance/balanceCalculations'
import { getPresetRange, type DateRangePreset } from '@/lib'
import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

import { CreditCardStats } from './components/CreditCardStats'
import { DateRangeHeader } from './components/DateRangeHeader'
import { TransactionRow } from './components/TransactionRow'
import { WalletStats } from './components/WalletStats'
import { SwipeableTransactionRow } from './SwipeableTransactionRow'

export type WalletDetailPageProps = {
  wallet: Wallet | undefined
  transactions: Transaction[]
  categories: Category[]
  currentAmount: number
  clearedAmount: number
  onBack: () => void
  onToggleCleared: (id: string) => void
}

export function WalletDetailPage({
  wallet,
  transactions,
  categories,
  currentAmount,
  clearedAmount,
  onBack,
  onToggleCleared,
}: WalletDetailPageProps) {
  const [preset, setPreset] = useState<DateRangePreset>('this-month')
  const [isPresetSheetOpen, setPresetSheetOpen] = useState(false)

  if (!wallet) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Wallet not found</h1>
        <button type="button" className="text-accent" onClick={onBack}>Back to Balance</button>
      </section>
    )
  }

  const range = getPresetRange(preset)
  const rows = walletRunningRows(wallet, transactions, range)
  const isCredit = wallet.type === 'credit_card'
  const reconciliation = isReconciliationEnabled(wallet)

  const totalExpenses = rows
    .filter((row) => row.amount < 0)
    .reduce((sum, row) => sum + Math.abs(row.amount), 0)

  return (
    <div className="space-y-4">
      <PageHeader title={wallet.name} onBack={onBack} />

      <DateRangeHeader range={range} onOpenPreset={() => setPresetSheetOpen(true)} />

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
        <SectionDivider label="Transactions" />
        {rows.length === 0 && <Card className="text-sm text-slate-400">No transactions in this range.</Card>}
        {rows.map((row) => {
          if (reconciliation) {
            return (
              <SwipeableTransactionRow
                key={row.transaction.id}
                row={row}
                wallet={wallet}
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
              categories={categories}
            />
          )
        })}
      </section>

      <DateRangePresetPicker
        isOpen={isPresetSheetOpen}
        value={preset}
        onSelect={setPreset}
        onClose={() => setPresetSheetOpen(false)}
      />
    </div>
  )
}
