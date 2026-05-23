import { motion } from 'framer-motion'
import { formatShortDate } from '../../lib/date'
import { formatAmount } from '../../lib/format'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { SectionLabel, TransactionRow } from '../../components/ui'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
}

export function TodayTransactions() {
  const todayTransactions = useTransactionStore((state) => state.todayTransactions)
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)
  const transactions = todayTransactions()

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <SectionLabel>Today</SectionLabel>
        <span className="text-sm text-slate-400">{formatShortDate(new Date())}</span>
      </div>
      <motion.div className="space-y-2" variants={listVariants} initial="hidden" animate="visible">
        {transactions.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No transactions today</p> : null}
        {transactions.map((transaction) =>
          transaction.items.map((item, index) => {
            const category = findCategory(item.categoryId)
            const parent = category ? parentOf(category) : undefined
            return (
              <motion.div key={`${transaction.id}-${index}`} variants={rowVariants}>
                <TransactionRow
                  to={`/transaction/${transaction.id}`}
                  icon={category?.icon ?? 'fa-ellipsis'}
                  iconBg={`${category?.color ?? '#64748b'}25`}
                  iconColor={category?.color ?? '#94a3b8'}
                  primaryLabel={category?.name ?? 'Unknown'}
                  secondaryLabel={parent?.name ?? transaction.type}
                  amount={`${transaction.type === 'income' ? '+' : '-'}${formatAmount(item.amount, transaction.currency)}`}
                  amountColor={transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}
                />
              </motion.div>
            )
          }),
        )}
      </motion.div>
    </section>
  )
}
