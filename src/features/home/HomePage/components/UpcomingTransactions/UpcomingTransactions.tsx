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

export type UpcomingTransactionRowData = {
  id: string
  to: string
  icon: string
  primaryLabel: string
  secondaryLabel: string
  amount: string
}

type UpcomingTransactionsProps = {
  rows: UpcomingTransactionRowData[]
}

export function UpcomingTransactions({ rows }: UpcomingTransactionsProps) {
  if (rows.length === 0) {
    return null
  }

  return (
    <section>
      <SectionLabel>Upcoming</SectionLabel>
      <motion.div className="space-y-2 mt-3" variants={listVariants} initial="hidden" animate="visible">
        {rows.map((row) => (
          <motion.div key={row.id} variants={rowVariants}>
            <TransactionRow
              to={row.to}
              icon={row.icon}
              iconBg="rgba(251,191,36,0.15)"
              iconColor="#fcd34d"
              primaryLabel={row.primaryLabel}
              secondaryLabel={row.secondaryLabel}
              amount={row.amount}
              amountColor="text-amber-200"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
