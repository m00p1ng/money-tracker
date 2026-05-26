import { AnimatePresence, motion } from 'framer-motion'

import { ConfirmSheet, Icon, TypePickerDropdown } from '@/components'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Category } from '@/types/domain'

import { MergeTargetSheet } from './MergeTargetSheet'

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
  isEditMode: boolean
  visible: Category[]
  parentId: string | undefined
  parent: Category | undefined
  categories: Category[]
  confirmDeleteId: string | null
  mergeSourceId: string | null
  mergeTargetId: string | null
  onTypeChange: (newType: 'expense' | 'income' | 'transfer') => void
  onBack: () => void
  onSelect: (category: Category) => void
  onToggleEditMode: () => void
  onRequestDelete: (id: string) => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onSelectMergeTarget: (targetId: string) => void
  onConfirmMerge: () => void
  onCancelMerge: () => void
}

export function CategorySelectionPage({
  type,
  isLocked,
  isEditMode,
  visible,
  parentId,
  parent,
  categories,
  confirmDeleteId,
  mergeSourceId,
  mergeTargetId,
  onTypeChange,
  onBack,
  onSelect,
  onToggleEditMode,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onSelectMergeTarget,
  onConfirmMerge,
  onCancelMerge,
}: CategorySelectionPageProps) {
  const editButton = (
    <button
      type="button"
      onClick={onToggleEditMode}
      className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-300 active:bg-white/5"
    >
      Edit
    </button>
  )

  const doneButton = (
    <button
      type="button"
      onClick={onToggleEditMode}
      className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold active:bg-white/5"
      style={{ color: 'var(--accent-light)' }}
    >
      Done
    </button>
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title={<TypePickerDropdown value={type} onChange={onTypeChange} locked={isLocked} />}
        onBack={onBack}
        rightSlot={isEditMode ? doneButton : editButton}
      />

      {parent && (
        <div className="flex items-center gap-3 px-1 text-lg font-bold text-slate-100">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">
            <Icon name={parent.icon} />
          </span>
          <span>{parent.name}</span>
        </div>
      )}

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
            <motion.div
              key={category.id}
              variants={cellVariants}
              className="relative"
            >
              {isEditMode && (
                <button
                  aria-label={`Remove ${category.name}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRequestDelete(category.id) }}
                  className="absolute -left-1.5 -top-1.5 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                >
                  ×
                </button>
              )}
              <button
                onClick={() => onSelect(category)}
                type="button"
                className={[
                  'flex w-full flex-col items-center gap-3 rounded-2xl',
                  'border border-white/[0.07] bg-white/4 px-2 py-3.5',
                ].join(' ')}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
                  <Icon name={category.icon} />
                </span>
                <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <ConfirmSheet
        isOpen={confirmDeleteId !== null}
        title={`Delete "${categories.find(c => c.id === confirmDeleteId)?.name ?? ''}"?`}
        primaryLabel="Delete"
        onPrimary={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <MergeTargetSheet
        isOpen={mergeSourceId !== null && mergeTargetId === null}
        sourceId={mergeSourceId}
        categories={categories}
        onSelect={onSelectMergeTarget}
        onCancel={onCancelMerge}
      />

      <ConfirmSheet
        isOpen={mergeTargetId !== null}
        title={`Merge "${categories.find(c => c.id === mergeSourceId)?.name ?? ''}" into "${categories.find(c => c.id === mergeTargetId)?.name ?? ''}"?`}
        description="All transactions will be moved and the category will be deleted."
        primaryLabel="Merge & Delete"
        onPrimary={onConfirmMerge}
        onCancel={onCancelMerge}
      />
    </div>
  )
}
