import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { formatAmount } from '../../lib/format'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
}

function badgeFor(day: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = tomorrowDate.toISOString().slice(0, 10)
  if (day < today) return 'Overdue'
  if (day === today) return 'Today'
  if (day === tomorrow) return 'Tomorrow'
  return day
}

export function UpcomingTransactions() {
  const upcomingTransactions = useTransactionStore((state) => state.upcomingTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const findWallet = useWalletStore((state) => state.findById)
  const rows = upcomingTransactions()

  if (rows.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-white/30">Upcoming</h2>
      <motion.div className="space-y-2" variants={listVariants} initial="hidden" animate="visible">
        {rows.map((row) => {
          const transaction = row.kind === 'real' ? row.transaction : row.occurrence.transaction
          const firstItem = transaction.items[0]
          const category = firstItem ? findCategory(firstItem.categoryId) : undefined
          const fromWallet = findWallet(transaction.walletId)
          const toWallet = transaction.toWalletId ? findWallet(transaction.toWalletId) : undefined
          const label =
            transaction.type === 'transfer'
              ? `${fromWallet?.name ?? 'Wallet'} -> ${toWallet?.name ?? 'Wallet'}`
              : category?.name ?? 'Transaction'
          const to =
            row.kind === 'real'
              ? `/transaction/${transaction.id}`
              : `/transaction/repeat/${row.occurrence.sourceId}/${row.occurrence.occurrenceDate}`
          return (
            <motion.div key={row.id} variants={rowVariants}>
              <Link
                to={to}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3.5 transition-[background,box-shadow] hover:bg-[rgba(108,71,255,0.08)] hover:shadow-[0_0_0_1px_rgba(108,71,255,0.15)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
                  <Icon name={transaction.type === 'transfer' ? 'fa-right-left' : category?.icon ?? 'fa-clock'} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{label}</span>
                  <span className="block truncate text-sm text-slate-500">
                    {badgeFor(row.date)}
                    {row.kind === 'virtual-repeat' ? ' · Repeat' : ''}
                  </span>
                </span>
                <span className="font-semibold text-amber-200">{formatAmount(firstItem?.amount ?? 0, transaction.currency)}</span>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
