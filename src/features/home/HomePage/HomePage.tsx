import { motion } from 'framer-motion'

import { Icon } from '@/components'
import SummaryCards from '@/features/home/SummaryCards'
import TodayTransactions from '@/features/home/TodayTransactions'
import UpcomingTransactions from '@/features/home/UpcomingTransactions'
import { formatHeaderDay, formatHeaderMonthYear, formatHeaderWeekday } from '@/lib'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
}

type HomePageProps = {
  onAddTransaction: () => void
}

export function HomePage({ onAddTransaction }: HomePageProps) {
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.header variants={sectionVariants} className="flex items-center justify-between">
        <div className="grid grid-cols-[auto_1px_auto] items-center gap-x-3">
          <span className="row-span-2 bg-linear-to-r from-white to-white/75 bg-clip-text text-5xl font-bold text-transparent">
            {formatHeaderDay(new Date())}
          </span>
          <div className="row-span-2 self-stretch bg-white/30" />
          <span className="text-sm font-medium text-white">{formatHeaderWeekday(new Date())}</span>
          <span className="text-sm text-slate-400">{formatHeaderMonthYear(new Date())}</span>
        </div>
        <button
          aria-label="Add transaction"
          onClick={onAddTransaction}
          className="grid h-11 w-11 place-items-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))' }}
          type="button"
        >
          <Icon name="fa-plus" />
        </button>
      </motion.header>
      <motion.div variants={sectionVariants}>
        <SummaryCards />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <UpcomingTransactions />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <TodayTransactions />
      </motion.div>
    </motion.div>
  )
}
