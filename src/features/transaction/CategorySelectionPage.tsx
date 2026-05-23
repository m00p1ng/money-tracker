import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router'
import { Icon } from '../../components/Icon'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionDraftStore } from '../../stores/transactionDraftStore'
import type { Category, TransactionType } from '../../types/domain'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
}

export function CategorySelectionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categories = useCategoryStore((state) => state.items)
  const updateDraft = useTransactionDraftStore((state) => state.update)
  const draft = useTransactionDraftStore((state) => state.draft)

  const changingIndexParam = searchParams.get('changingIndex')
  const changingIndex = changingIndexParam !== null ? Number(changingIndexParam) : null
  const isAddCategory = searchParams.get('addCategory') === 'true'
  const seedType = (searchParams.get('type') ?? 'expense') as 'expense' | 'income'

  const [type, setType] = useState<'expense' | 'income'>(seedType)
  const [parentId, setParentId] = useState<string | undefined>()

  const visible = categories.filter((c) => c.type === type && c.parentId === parentId)
  const parent = parentId ? categories.find((c) => c.id === parentId) : undefined

  function handleTypeChange(newType: string) {
    if (newType === 'transfer') {
      navigate('/transaction/new?type=transfer')
      return
    }
    setType(newType as 'expense' | 'income')
    setParentId(undefined)
  }

  function handleBack() {
    if (parentId) {
      setParentId(parent?.parentId)
    } else {
      navigate(-1)
    }
  }

  function handleSelect(category: Category) {
    const hasChildren = categories.some((c) => c.parentId === category.id)
    if (hasChildren) {
      setParentId(category.id)
      return
    }

    // We came from TransactionPage with a draft — update draft and go back
    if (draft && (changingIndex !== null || isAddCategory)) {
      if (changingIndex !== null) {
        const newItems = draft.items.map((item, i) =>
          i === changingIndex ? { ...item, categoryId: category.id } : item,
        )
        updateDraft({ items: newItems })
      } else {
        // addCategory
        updateDraft({ items: [...draft.items, { categoryId: category.id, amount: 0 }] })
      }
      navigate(-1)
      return
    }

    // Standalone flow (launched from HomePage without a draft)
    navigate(`/transaction/new?type=${type}&categoryId=${category.id}`)
  }

  return (
    <div className="space-y-4">
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <h1 className="text-center text-base font-bold">{'New Transaction'}</h1>
        <div />
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-white/[0.05] p-1">
        {[
          { label: 'Expense', value: 'expense' },
          { label: 'Income', value: 'income' },
          { label: 'Transfer', value: 'transfer' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTypeChange(tab.value)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${type === tab.value ? 'bg-white/[0.1] text-white' : 'text-white/50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${parentId ?? 'root'}-${type}`}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
          className="grid grid-cols-2 gap-3"
        >
          {visible.map((category) => (
            <motion.button
              key={category.id}
              variants={cellVariants}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(category)}
              type="button"
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-5"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-xl"
                style={{ backgroundColor: `${category.color}25`, color: category.color }}
              >
                <Icon name={category.icon} />
              </span>
              <span className="text-center text-sm font-semibold leading-tight">{category.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
