import { motion } from 'framer-motion'

import { SectionLabel, TransactionRow } from '@/components'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 26,
    },
  },
}

export type TodayTransactionRowData = {
  key: string
  to: string
  icon: string
  title: string
  date: string
  amount: number
  currency: string
  amountColor: string
}

type TodayTransactionsProps = {
  rows: TodayTransactionRowData[]
  totalExpense?: string
  totalIncome?: string
}

export function TodayTransactions({
  rows,
  totalExpense,
  totalIncome,
}: TodayTransactionsProps) {
  return (
    <section>
      <SectionLabel>Today</SectionLabel>
      <motion.div
        className="mt-3 space-y-2"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {rows.length === 0
          ? <p className="py-8 text-center text-sm text-slate-500">No transactions today</p>
          : null
        }
        {rows.map((row) => (
          <motion.div key={row.key} variants={rowVariants}>
            <TransactionRow
              to={row.to}
              icon={row.icon}
              title={row.title}
              date={row.date}
              amount={row.amount}
              currency={row.currency}
              amountColor={row.amountColor}
            />
          </motion.div>
        ))}
      </motion.div>
      {totalExpense || totalIncome
        ? (
          <div className="mt-3 space-y-1 text-right text-sm font-medium text-slate-300">
            {totalExpense
              ? <p>Total Expenses: {totalExpense}</p>
              : null}
            {totalIncome
              ? <p>Total Income: {totalIncome}</p>
              : null}
          </div>
        )
        : null}
    </section>
  )
}
