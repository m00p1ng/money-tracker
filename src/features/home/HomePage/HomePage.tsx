import { motion } from 'framer-motion'

import {
  HomeTitle,
  SummaryCards,
  TodayTransactions,
  UpcomingTransactions,
} from './components'

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
      <motion.header variants={sectionVariants}>
        <HomeTitle onAddTransaction={onAddTransaction} />
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
