import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
  { label: 'Last 90d', value: 'last-90d' },
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

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
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

  const expenseRatio = currentAmount > 0 ? Math.min((totalExpenses / currentAmount) * 100, 100) : totalExpenses > 0 ? 100 : 0
  const creditUsedRatio = isCredit && wallet.creditLimit ? Math.min((currentAmount / wallet.creditLimit) * 100, 100) : 0

  return (
    <div className="space-y-4">
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={() => backNavigate('/balance')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <h1 className="text-center text-base font-bold">{wallet.name}</h1>
        <div />
      </header>

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
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-emerald-400">
                <Icon name="fa-wallet" />
                Balance
              </span>
              <span className="text-xs font-semibold text-emerald-400">{formatAmount(currentAmount, wallet.currency)}</span>
            </div>
            <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
              <motion.div
                className="flex h-full items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-300 px-4 text-base font-bold text-emerald-950"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}
              >
                {formatAmount(currentAmount, wallet.currency)}
              </motion.div>
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
                <motion.div
                  className="flex h-full items-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-4 text-base font-bold text-amber-950"
                  style={{ minWidth: '5rem' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${expenseRatio}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }}
                >
                  {formatAmount(totalExpenses, wallet.currency)}
                </motion.div>
              )}
            </div>
          </div>
        </div>
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
                  <p className={`text-sm font-bold ${row.amount >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {row.amount >= 0 ? '+' : '-'}{formatAmount(Math.abs(row.amount), wallet.currency)}
                  </p>
                  <p className={`mt-0.5 text-xs ${isCredit ? 'text-red-400/70' : 'text-white/28'}`}>
                    {isCredit ? `${formatAmount(row.runningAmount, wallet.currency)} debt` : formatAmount(row.runningAmount, wallet.currency)}
                  </p>
                </div>
              </Card>
            </Link>
          )
        })}
      </section>

      {/* Preset bottom sheet */}
      <AnimatePresence>
        {isPresetSheetOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPresetSheetOpen(false)}
            />
            <motion.div
              key="sheet"
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/[0.08] bg-[var(--bg)] pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            >
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" />
              <h3 className="px-5 pb-2.5 pt-3.5 text-center text-[15px] font-bold">Date Range</h3>
              <div className="mx-5 mb-2 h-px bg-white/[0.06]" />
              <div className="px-4 space-y-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setPreset(p.value)
                      setPresetSheetOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      preset === p.value
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'text-white/70 hover:bg-white/[0.05]'
                    }`}
                  >
                    {p.label}
                    {preset === p.value && <Icon name="fa-circle-check" className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
