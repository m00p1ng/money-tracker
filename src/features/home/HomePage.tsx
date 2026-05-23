import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Icon } from '../../components/Icon'
import { formatHeaderDate } from '../../lib/date'
import { SummaryCards } from './SummaryCards'
import { TodayTransactions } from './TodayTransactions'
import { UpcomingTransactions } from './UpcomingTransactions'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
}

export function HomePage() {
  const navigate = useNavigate()

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.header variants={sectionVariants} className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{formatHeaderDate(new Date())}</p>
          <h1 className="bg-gradient-to-r from-white to-white/75 bg-clip-text text-2xl font-semibold text-transparent">Overview</h1>
        </div>
        <motion.button
          aria-label="Add transaction"
          onClick={() => navigate('/transaction/category')}
          className="grid h-11 w-11 place-items-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))' }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.92 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(108,71,255,0)',
              '0 0 12px 4px rgba(108,71,255,0.35)',
              '0 0 0 0 rgba(108,71,255,0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          type="button"
        >
          <Icon name="fa-plus" />
        </motion.button>
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
