import { motion } from 'framer-motion'
import { formatAmount } from '@/lib/format'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWalletStore } from '@/stores/walletStore'
import { SectionLabel, TransactionRow } from '@/components/ui'

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
  if (day < today) {
    return 'Overdue'
  }
  if (day === today) {
    return 'Today'
  }
  if (day === tomorrow) {
    return 'Tomorrow'
  }
  return day
}

export function UpcomingTransactions() {
  const upcomingTransactions = useTransactionStore((state) => state.upcomingTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const findWallet = useWalletStore((state) => state.findById)
  const rows = upcomingTransactions()

  if (rows.length === 0) {
    return null
  }

  return (
    <section>
      <div className="mb-3">
        <SectionLabel>Upcoming</SectionLabel>
      </div>
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
              <TransactionRow
                to={to}
                icon={transaction.type === 'transfer' ? 'fa-right-left' : category?.icon ?? 'fa-clock'}
                iconBg="rgba(251,191,36,0.15)"
                iconColor="#fcd34d"
                primaryLabel={label}
                secondaryLabel={`${badgeFor(row.date)}${row.kind === 'virtual-repeat' ? ' · Repeat' : ''}`}
                amount={formatAmount(firstItem?.amount ?? 0, transaction.currency)}
                amountColor="text-amber-200"
              />
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
