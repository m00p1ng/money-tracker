import { useState } from 'react'

import {
  Icon,
  AnimatedBar,
  PageHeader,
  SectionDivider,
  Card,
} from '@/components'
import { DateRangePresetPicker } from '@/components/ui'
import { walletRunningRows } from '@/features/balance/balanceCalculations'
import {
  type DateRangePreset,
  getPresetRange,
  formatAmount,
} from '@/lib'
import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

import { SwipeableTransactionRow } from './SwipeableTransactionRow'

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${day} ${monthName} ${year}`
}

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

  const totalExpenses = rows
    .filter((row) => row.amount < 0)
    .reduce((sum, row) => sum + Math.abs(row.amount), 0)

  const creditUsedRatio = isCredit && wallet.creditLimit
    ? Math.min((currentAmount / wallet.creditLimit) * 100, 100)
    : 0

  return (
    <div className="space-y-4">
      <PageHeader title={wallet.name} onBack={onBack} />

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Card className="flex-1 p-2.5!">
            <p className="text-[10px] uppercase tracking-wide text-white/30">Begin</p>
            <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.start)}</p>
          </Card>
          <Card className="flex-1 p-2.5!">
            <p className="text-[10px] uppercase tracking-wide text-white/30">End</p>
            <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.end)}</p>
          </Card>
          <button
            aria-label="More date range options"
            onClick={() => setPresetSheetOpen(true)}
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              'border border-white/8 bg-white/5 text-white/50',
            ].join(' ')}
            type="button"
          >
            <Icon name="fa-ellipsis" />
          </button>
        </div>
      </div>

      {isCredit && wallet.creditLimit ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Debt</p>
              <p className="mt-1 text-sm font-bold text-expense">{formatAmount(currentAmount, wallet.currency)}</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Available</p>
              <p className="mt-1 text-sm font-bold text-income">
                {formatAmount(wallet.creditLimit - currentAmount, wallet.currency)}
              </p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Limit</p>
              <p className="mt-1 text-sm font-bold text-white/55">
                {formatAmount(wallet.creditLimit, wallet.currency)}
              </p>
            </div>
          </div>
          <div className="p-3">
            <div className="mb-1.5 flex justify-between text-[11px] text-white/35">
              <span>Used {creditUsedRatio.toFixed(1)}%</span>
              <span className="text-expense">
                {formatAmount(currentAmount, wallet.currency)} / {formatAmount(wallet.creditLimit, wallet.currency)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-1.5 rounded-full bg-linear-to-r from-red-400 to-orange-400"
                style={{ width: `${creditUsedRatio}%` }}
              />
            </div>
          </div>
          <div className="px-3 pb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 text-xs uppercase tracking-wide"
                style={{ color: 'var(--accent-light)' }}
              >
                <Icon name="fa-circle-check" />
                Cleared Debt
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>
                {formatAmount(clearedAmount, wallet.currency)}
              </span>
            </div>
            <AnimatedBar
              value={clearedAmount}
              maxValue={currentAmount || 1}
              colorFrom="#6c47ff"
              colorTo="#9b7dff"
              textColor="#1a1030"
              currency={wallet.currency}
              delay={0.3}
            />
            {currentAmount !== clearedAmount && (
              <p className="mt-1 text-[11px] text-white/40">
                {formatAmount(currentAmount - clearedAmount, wallet.currency)} uncleared
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-income">
                <Icon name="fa-wallet" />
                Balance
              </span>
              <span className="text-xs font-semibold text-income">{formatAmount(currentAmount, wallet.currency)}</span>
            </div>
            <AnimatedBar
              value={currentAmount}
              maxValue={currentAmount}
              colorFrom="#10b981"
              colorTo="#6ee7b7"
              textColor="#052e16"
              currency={wallet.currency}
              delay={0.1}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 text-xs uppercase tracking-wide"
                style={{ color: 'var(--accent-light)' }}
              >
                <Icon name="fa-circle-check" />
                Cleared
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>
                {formatAmount(clearedAmount, wallet.currency)}
              </span>
            </div>
            <AnimatedBar
              value={clearedAmount}
              maxValue={currentAmount}
              colorFrom="#6c47ff"
              colorTo="#9b7dff"
              textColor="#1a1030"
              currency={wallet.currency}
              delay={0.2}
            />
            {currentAmount !== clearedAmount && (
              <p className="mt-1 text-[11px] text-white/40">
                {formatAmount(currentAmount - clearedAmount, wallet.currency)} uncleared
              </p>
            )}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
                <Icon name="fa-arrow-down" />
                Expenses
              </span>
              <span className="text-xs font-semibold text-amber-400">
                {formatAmount(totalExpenses, wallet.currency)}
              </span>
            </div>
            {totalExpenses > 0 && (
              <AnimatedBar
                value={totalExpenses}
                maxValue={currentAmount}
                colorFrom="#f59e0b"
                colorTo="#fde047"
                textColor="#451a03"
                currency={wallet.currency}
                delay={0.3}
              />
            )}
            {totalExpenses === 0 && (
              <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/4" />
            )}
          </div>
        </div>
      )}

      <section>
        <SectionDivider label="Transactions" />
        {rows.length === 0 && <Card className="text-sm text-slate-400">No transactions in this range.</Card>}
        {rows.map((row) => (
          <SwipeableTransactionRow
            key={row.transaction.id}
            row={row}
            wallet={wallet}
            categories={categories}
            onToggleCleared={onToggleCleared}
          />
        ))}
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
