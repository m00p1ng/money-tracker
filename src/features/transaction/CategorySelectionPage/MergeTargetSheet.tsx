import { AnimatePresence, motion } from 'framer-motion'

import { Icon } from '@/components'
import type { Category } from '@/types/domain'

type MergeTargetSheetProps = {
  isOpen: boolean
  sourceId: string | null
  categories: Category[]
  onSelect: (targetId: string) => void
  onCancel: () => void
}

function buildTree(
  categories: Category[],
  parentId: string | undefined,
  sourceId: string | null,
  onSelect: (id: string) => void,
): React.ReactNode[] {
  const children = [...categories]
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))

  return children.flatMap((cat) => {
    const isSource = cat.id === sourceId
    const indent = (cat.level - 1) * 20

    return [
      <button
        key={cat.id}
        type="button"
        disabled={isSource}
        onClick={() => !isSource && onSelect(cat.id)}
        className={[
          'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left active:bg-white/5',
          isSource
            ? 'cursor-not-allowed opacity-30'
            : '',
        ].join(' ')}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/8 text-sm">
          <Icon name={cat.icon} />
        </span>
        <span className="text-sm font-semibold text-slate-100">{cat.name}</span>
        {isSource && (
          <span className="ml-auto text-xs text-white/30">being deleted</span>
        )}
      </button>,
      ...buildTree(categories, cat.id, sourceId, onSelect),
    ]
  })
}

export function MergeTargetSheet({
  isOpen,
  sourceId,
  categories,
  onSelect,
  onCancel,
}: MergeTargetSheetProps) {
  const sourceCategory = categories.find((c) => c.id === sourceId)
  const sameTypeCategories = categories.filter(
    (c) => c.type === sourceCategory?.type,
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
          />
          <motion.div
            key="sheet"
            className={[
              'fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-107.5',
              'rounded-t-3xl border-t border-white/8 bg-(--bg) pb-8',
            ].join(' ')}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring', stiffness: 400, damping: 38,
            }}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" />
            <h3 className="px-5 pb-2 pt-3.5 text-center text-base font-bold">
              Merge &quot;{sourceCategory?.name}&quot; into…
            </h3>
            <p className="px-5 pb-2 text-center text-sm text-white/40">
              All transactions will move to the selected category
            </p>
            <div className="mx-5 mb-2.5 h-px bg-white/6" />
            <div className="max-h-72 overflow-y-auto px-2">
              {buildTree(sameTypeCategories, undefined, sourceId, onSelect)}
            </div>
            <div className="mt-3 px-5">
              <button
                type="button"
                onClick={onCancel}
                className={[
                  'w-full rounded-xl bg-white/5 py-3.5 text-center',
                  'text-sm font-semibold text-white/60 active:bg-white/8',
                ].join(' ')}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
