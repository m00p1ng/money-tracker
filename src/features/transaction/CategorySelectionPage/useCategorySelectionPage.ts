import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useBackNavigate } from '@/context/navigationDirection'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionDraftStore } from '@/stores/transactionDraftStore'
import type { Category } from '@/types/domain'
import type { CategorySelectionPageProps } from './CategorySelectionPage'

export function useCategorySelectionPage(): CategorySelectionPageProps {
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
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
  const isLocked = isAddCategory || changingIndex !== null

  const visible = categories.filter((c) => c.type === type && c.parentId === parentId)
  const parent = parentId ? categories.find((c) => c.id === parentId) : undefined

  function onTypeChange(newType: 'expense' | 'income' | 'transfer') {
    if (newType === 'transfer') {
      navigate('/transaction/new?type=transfer')
      return
    }
    setType(newType)
    setParentId(undefined)
  }

  function onBack() {
    if (parentId) {
      setParentId(parent?.parentId)
    } else {
      backNavigate(-1)
    }
  }

  function onSelect(category: Category) {
    const hasChildren = categories.some((c) => c.parentId === category.id)
    if (hasChildren) {
      setParentId(category.id)
      return
    }

    if (draft && (changingIndex !== null || isAddCategory)) {
      if (changingIndex !== null) {
        const newItems = draft.items.map((item, i) =>
          i === changingIndex ? { ...item, categoryId: category.id } : item,
        )
        updateDraft({ items: newItems })
      } else {
        updateDraft({ items: [...draft.items, { categoryId: category.id, amount: 0 }] })
      }
      backNavigate(-1)
      return
    }

    navigate(`/transaction/new?type=${type}&categoryId=${category.id}`)
  }

  return {
    type,
    isLocked,
    visible,
    parentId,
    onTypeChange,
    onBack,
    onSelect,
  }
}
