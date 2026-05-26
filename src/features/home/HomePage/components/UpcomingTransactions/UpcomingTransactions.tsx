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
  title: string
  date: string
  amount: string
  amountColor: string
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
              title={row.title}
              date={row.date}
              amount={row.amount}
              amountColor={row.amountColor}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
