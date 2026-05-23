import { motion } from 'framer-motion'
import { Icon } from '@/components/Icon'
import { formatAmount } from '@/lib/format'
import { useTransactionStore } from '@/stores/transactionStore'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 20 } },
}

export function SummaryCards() {
  const monthlyIncome = useTransactionStore((state) => state.monthlyIncome)
  const monthlyExpense = useTransactionStore((state) => state.monthlyExpense)
  const income = monthlyIncome()
  const expense = monthlyExpense()

  return (
    <div>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-white/30">This Month</h2>
      <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants} className="rounded-2xl border border-income/20 bg-gradient-to-br from-income/10 to-income/5 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[1px] text-income">
            <Icon name="fa-arrow-up" />
            <span>Income</span>
          </div>
          <p className="text-xl font-bold text-income">{formatAmount(income)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-2xl border border-expense/20 bg-gradient-to-br from-expense/10 to-expense/5 p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[1px] text-expense">
            <Icon name="fa-arrow-down" />
            <span>Expense</span>
          </div>
          <p className="text-xl font-bold text-expense">{formatAmount(expense)}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
