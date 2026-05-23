import { motion } from 'framer-motion'

import { Icon } from '@/components'
import SummaryCards from '@/features/home/SummaryCards'
import TodayTransactions from '@/features/home/TodayTransactions'
import UpcomingTransactions from '@/features/home/UpcomingTransactions'
import { formatHeaderDate } from '@/lib'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
}

type HomePageProps = {
  onAddTransaction: () => void
}

export function HomePage({ onAddTransaction }: HomePageProps) {
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.header variants={sectionVariants} className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{formatHeaderDate(new Date())}</p>
          <h1 className="bg-gradient-to-r from-white to-white/75 bg-clip-text text-2xl font-semibold text-transparent">Overview</h1>
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
