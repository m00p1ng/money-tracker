import { AnimatePresence, motion } from 'framer-motion'

import { Icon, TypePickerDropdown } from '@/components'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Category } from '@/types/domain'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 28,
    },
  },
}

export interface CategorySelectionPageProps {
  type: 'expense' | 'income'
  isLocked: boolean
  visible: Category[]
  parentId: string | undefined
  onTypeChange: (newType: 'expense' | 'income' | 'transfer') => void
  onBack: () => void
  onSelect: (category: Category) => void
}

export function CategorySelectionPage({
  type,
  isLocked,
  visible,
  parentId,
  onTypeChange,
  onBack,
  onSelect,
}: CategorySelectionPageProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={<TypePickerDropdown value={type} onChange={onTypeChange} locked={isLocked} />}
        onBack={onBack}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${parentId ?? 'root'}-${type}`}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit={{
            opacity: 0,
            x: -16,
            transition: { duration: 0.15 },
          }}
          className="grid grid-cols-3 gap-2.5"
        >
          {visible.map((category) => (
            <motion.button
              key={category.id}
              variants={cellVariants}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(category)}
              type="button"
              className={[
                'flex flex-col items-center gap-3 rounded-2xl',
                'border border-white/[0.07] bg-white/4 px-2 py-3.5',
              ].join(' ')}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
                <Icon name={category.icon} />
              </span>
              <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
