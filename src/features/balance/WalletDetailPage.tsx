import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useBackNavigate } from '../../context/navigationDirection'
import { Icon } from '../../components/Icon'
import { Card } from '../../components/ui/Card'
import { type DateRangePreset, getPresetRange } from '../../lib/dateRange'
import { formatAmount } from '../../lib/format'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import { walletCurrentAmount, walletRunningRows } from './balanceCalculations'

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: 'Last 7d', value: 'last-7d' },
  { label: 'Last 30d', value: 'last-30d' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
]

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function WalletDetailPage() {
  const { id } = useParams()
  const backNavigate = useBackNavigate()
  const wallet = useWalletStore((state) => state.items.find((item) => item.id === id))
  const transactions = useTransactionStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const [preset, setPreset] = useState<DateRangePreset>('this-month')
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

  const expenseRatio = currentAmount > 0 ? Math.min((totalExpenses / currentAmount) * 100, 100) : totalExpenses > 0 ? 100 : 0
  const creditUsedRatio = isCredit && wallet.creditLimit ? Math.min((currentAmount / wallet.creditLimit) * 100, 100) : 0

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <Link
          to="/balance"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm text-slate-300"
        >
          <Icon name="fa-chevron-left" />
        </Link>
        <h1 className="flex-1 text-lg font-bold">{wallet.name}</h1>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
          style={{ background: hexToRgba(wallet.color, 0.15), color: wallet.color }}
        >
          <Icon name={wallet.icon} />
        </div>
      </header>

      {/* Date range filter */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Card className="flex-1 !p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-white/30">Begin</p>
            <p className="mt-0.5 text-sm font-semibold">{range.start}</p>
          </Card>
          <Card className="flex-1 !p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-white/30">End</p>
            <p className="mt-0.5 text-sm font-semibold">{range.end}</p>
          </Card>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`flex-shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                preset === p.value
                  ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/7 bg-white/[0.04] text-white/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Credit card stats */}
      {isCredit && wallet.creditLimit ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Card className="!p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Debt</p>
              <p className="mt-1 text-sm font-bold text-red-300">{formatAmount(currentAmount, wallet.currency)}</p>
            </Card>
            <Card className="!p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Available</p>
              <p className="mt-1 text-sm font-bold text-emerald-300">{formatAmount(wallet.creditLimit - currentAmount, wallet.currency)}</p>
            </Card>
            <Card className="!p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/30">Limit</p>
              <p className="mt-1 text-sm font-bold text-white/55">{formatAmount(wallet.creditLimit, wallet.currency)}</p>
            </Card>
          </div>
          <Card className="!p-3">
            <div className="mb-1.5 flex justify-between text-[11px] text-white/35">
              <span>Used {creditUsedRatio.toFixed(1)}%</span>
              <span className="text-red-400">{formatAmount(currentAmount, wallet.currency)} / {formatAmount(wallet.creditLimit, wallet.currency)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                style={{ width: `${creditUsedRatio}%` }}
              />
            </div>
          </Card>
        </>
      ) : (
        /* Payment account: balance vs expenses bar */
        <Card className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-emerald-400">
                <Icon name="fa-wallet" />
                Balance
              </span>
              <span className="text-xs font-semibold text-emerald-400">{formatAmount(currentAmount, wallet.currency)}</span>
            </div>
            <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
              <div className="flex h-full w-full items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-300 px-4 text-base font-bold text-emerald-950">
                {formatAmount(currentAmount, wallet.currency)}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
                <Icon name="fa-arrow-down" />
                Expenses
              </span>
              <span className="text-xs font-semibold text-amber-400">{formatAmount(totalExpenses, wallet.currency)}</span>
            </div>
            <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
              {totalExpenses > 0 && (
                <div
                  className="flex h-full items-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-4 text-base font-bold text-amber-950"
                  style={{ width: `${expenseRatio}%`, minWidth: '5rem' }}
                >
                  {formatAmount(totalExpenses, wallet.currency)}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Transaction list */}
      <section>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Transactions</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
        {rows.length === 0 && <Card className="text-sm text-slate-400">No transactions in this range.</Card>}
        {rows.map((row) => {
          const category = categories.find((item) => item.id === row.transaction.items[0]?.categoryId)
          const iconColor = category?.color ?? wallet.color
          return (
            <Card key={row.transaction.id} className="mb-2 flex items-center gap-2.5">
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
                <p className={`text-sm font-bold ${row.amount >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {row.amount >= 0 ? '+' : '-'}{formatAmount(Math.abs(row.amount), wallet.currency)}
                </p>
                <p className={`mt-0.5 text-xs ${isCredit ? 'text-red-400/70' : 'text-white/28'}`}>
                  {isCredit ? `${formatAmount(row.runningAmount, wallet.currency)} debt` : formatAmount(row.runningAmount, wallet.currency)}
                </p>
              </div>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
