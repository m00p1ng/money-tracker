import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/Button'
import type { Category, TransactionType } from '@/types/domain'

export function CategoryPicker({
  isOpen,
  categories,
  type,
  onSelect,
  onClose,
}: {
  isOpen: boolean
  categories: Category[]
  type: TransactionType
  onSelect: (category: Category) => void
  onClose: () => void
}) {
  const [parentId, setParentId] = useState<string | undefined>()
  const visible = useMemo(
    () => categories.filter((category) => category.type === type && category.parentId === parentId),
    [categories, parentId, type],
  )
  const parent = parentId ? categories.find((category) => category.id === parentId) : undefined

  function goBack() {
    if (!parent) {
      onClose(); return
    }
    setParentId(parent.parentId)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="picker"
          className="fixed inset-0 z-40 bg-[var(--bg)] px-4 py-6 text-slate-50"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        >
          <div className="mx-auto max-w-[430px] space-y-4">
            <header className="flex items-center gap-3">
              <Button aria-label="Back" className="px-0" onClick={goBack} type="button">
                <Icon name="fa-chevron-left" />
              </Button>
              <div>
                <p className="text-sm text-slate-500">Categories</p>
                <h2 className="text-xl font-semibold">{parent?.name ?? 'All'}</h2>
              </div>
            </header>
            <div className="space-y-2">
              {visible.map((category) => {
                const hasChildren = categories.some((item) => item.parentId === category.id)
                return (
                  <motion.button
                    key={category.id}
                    className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-3 py-4 text-left"
                    onClick={() => (hasChildren ? setParentId(category.id) : onSelect(category))}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: `${category.color}25`, color: category.color }}>
                      <Icon name={category.icon} />
                    </span>
                    <span className="flex-1 font-medium">{category.name}</span>
                    {hasChildren ? <span className="text-slate-500">›</span> : null}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
