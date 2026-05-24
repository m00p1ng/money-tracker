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
  iconBg: string
  iconColor: string
  primaryLabel: string
  secondaryLabel: string
  amount: string
  amountColor: string
}

type TodayTransactionsProps = {
  rows: TodayTransactionRowData[]
}

export function TodayTransactions({ rows }: TodayTransactionsProps) {
  return (
    <section>
      <SectionLabel>Today</SectionLabel>
      <motion.div
        className="space-y-2 mt-3"
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
              iconBg={row.iconBg}
              iconColor={row.iconColor}
              primaryLabel={row.primaryLabel}
              secondaryLabel={row.secondaryLabel}
              amount={row.amount}
              amountColor={row.amountColor}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
