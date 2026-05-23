import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useBackNavigate } from '../../context/navigationDirection'
import { Icon } from '../../components/Icon'
import { Card } from '../../components/ui/Card'
import { AnimatedBar, BottomSheet, PageHeader, SectionDivider } from '../../components/ui'
import { type DateRangePreset, getPresetRange } from '../../lib/dateRange'
import { formatAmount } from '../../lib/format'
import { hexToRgba } from '../../lib/color'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import { walletCurrentAmount, walletRunningRows } from './balanceCalculations'

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: 'Last 7d', value: 'last-7d' },
  { label: 'Last 30d', value: 'last-30d' },
  { label: 'Last 90d', value: 'last-90d' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
]

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${day} ${monthName} ${year}`
}

export function WalletDetailPage() {
  const { id } = useParams()
  const backNavigate = useBackNavigate()
  const wallet = useWalletStore((state) => state.items.find((item) => item.id === id))
  const transactions = useTransactionStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const [preset, setPreset] = useState<DateRangePreset>('this-month')
  const [isPresetSheetOpen, setPresetSheetOpen] = useState(false)
  const range = getPresetRange(preset)

  if (!wallet) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Wallet not found</h1>
        <button type="button" className="text-accent" onClick={() => backNavigate('/balance')}>Back to Balance</button>
      </section>
    )
  }

  const rows = walletRunningRows(wallet, transactions, range)
  const currentAmount = walletCurrentAmount(wallet, transactions)
  const isCredit = wallet.type === 'credit_card'

  const totalExpenses = rows
    .filter((row) => row.amount < 0)
    .reduce((sum, row) => sum + Math.abs(row.amount), 0)

  const creditUsedRatio = isCredit && wallet.creditLimit ? Math.min((currentAmount / wallet.creditLimit) * 100, 100) : 0

  return (
    <div className="space-y-4">
      <PageHeader title={wallet.name} onBack={() => backNavigate('/balance')} />

      {/* Date range filter */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Card className="flex-1 !p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-white/30">Begin</p>
            <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.start)}</p>
          </Card>
          <Card className="flex-1 !p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-white/30">End</p>
            <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.end)}</p>
          </Card>
          <button
            aria-label="More date range options"
            onClick={() => setPresetSheetOpen(true)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50"
            type="button"
          >
            <Icon name="fa-ellipsis" />
          </button>
        </div>
      </div>

      {/* Credit card stats */}
      {isCredit && wallet.creditLimit ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Debt</p>
              <p className="mt-1 text-sm font-bold text-expense">{formatAmount(currentAmount, wallet.currency)}</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Available</p>
              <p className="mt-1 text-sm font-bold text-income">{formatAmount(wallet.creditLimit - currentAmount, wallet.currency)}</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Limit</p>
              <p className="mt-1 text-sm font-bold text-white/55">{formatAmount(wallet.creditLimit, wallet.currency)}</p>
            </div>
          </div>
          <div className="p-3">
            <div className="mb-1.5 flex justify-between text-[11px] text-white/35">
              <span>Used {creditUsedRatio.toFixed(1)}%</span>
              <span className="text-expense">{formatAmount(currentAmount, wallet.currency)} / {formatAmount(wallet.creditLimit, wallet.currency)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                style={{ width: `${creditUsedRatio}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        /* Payment account: balance vs expenses bar */
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-income">
                <Icon name="fa-wallet" />
                Balance
              </span>
              <span className="text-xs font-semibold text-income">{formatAmount(currentAmount, wallet.currency)}</span>
            </div>
            <AnimatedBar value={currentAmount} maxValue={currentAmount} colorFrom="#10b981" colorTo="#6ee7b7" textColor="#052e16" currency={wallet.currency} delay={0.1} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
                <Icon name="fa-arrow-down" />
                Expenses
              </span>
              <span className="text-xs font-semibold text-amber-400">{formatAmount(totalExpenses, wallet.currency)}</span>
            </div>
            {totalExpenses > 0 && (
              <AnimatedBar value={totalExpenses} maxValue={currentAmount} colorFrom="#f59e0b" colorTo="#fde047" textColor="#451a03" currency={wallet.currency} delay={0.2} />
            )}
            {totalExpenses === 0 && <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]" />}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <section>
        <SectionDivider label="Transactions" />
        {rows.length === 0 && <Card className="text-sm text-slate-400">No transactions in this range.</Card>}
        {rows.map((row) => {
          const category = categories.find((item) => item.id === row.transaction.items[0]?.categoryId)
          const iconColor = category?.color ?? wallet.color
          return (
            <Link key={row.transaction.id} to={`/transaction/${row.transaction.id}`}>
              <Card className="mb-2 flex items-center gap-2.5 cursor-pointer active:opacity-70 transition-opacity">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm"
                  style={{ background: hexToRgba(iconColor, 0.15), color: iconColor }}
                >
                  <Icon name={category?.icon ?? 'fa-ellipsis'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{category?.name ?? row.transaction.type}</p>
                  <p className="mt-0.5 text-xs text-white/30">{new Date(row.transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`text-sm font-bold ${row.amount >= 0 ? 'text-income' : 'text-expense'}`}>
                    {row.amount >= 0 ? '+' : '-'}{formatAmount(Math.abs(row.amount), wallet.currency)}
                  </p>
                  <p className={`mt-0.5 text-xs ${isCredit ? 'text-expense/70' : 'text-white/28'}`}>
                    {isCredit ? `${formatAmount(row.runningAmount, wallet.currency)} debt` : formatAmount(row.runningAmount, wallet.currency)}
                  </p>
                </div>
              </Card>
            </Link>
          )
        })}
      </section>

      {/* Preset bottom sheet */}
      <BottomSheet isOpen={isPresetSheetOpen} onClose={() => setPresetSheetOpen(false)} title="Date Range">
        <div className="px-4 space-y-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setPreset(p.value); setPresetSheetOpen(false) 
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${preset === p.value
                ? 'bg-accent/15 text-accent-light'
                : 'text-white/70 hover:bg-white/[0.05]'
              }`}
            >
              {p.label}
              {preset === p.value && <Icon name="fa-circle-check" className="text-accent" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
