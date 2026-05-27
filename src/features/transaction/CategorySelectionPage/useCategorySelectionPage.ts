import sortBy from 'lodash/sortBy'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { isCurrentMonth } from '@/lib'
import {
  useCategoryStore,
  useTransactionDraftStore,
  useTransactionStore,
} from '@/stores'
import type {
  Category,
  TransactionType,
} from '@/types/domain'

import type { CategorySelectionPageProps } from './CategorySelectionPage'

export function useCategorySelectionPage(): CategorySelectionPageProps {
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const [searchParams] = useSearchParams()
  const categories = useCategoryStore((state) => state.items)
  const transactions = useTransactionStore((state) => state.items)
  const updateDraft = useTransactionDraftStore((state) => state.update)
  const draft = useTransactionDraftStore((state) => state.draft)

  const changingIndexParam = searchParams.get('changingIndex')
  const changingIndex = changingIndexParam !== null
    ? Number(changingIndexParam)
    : null
  const isAddCategory = searchParams.get('addCategory') === 'true'
  const seedType = (searchParams.get('type') ?? 'expense') as 'expense' | 'income'
  const currentCategoryId = searchParams.get('currentCategoryId') ?? undefined

  const initialParentId = currentCategoryId
    ? categories.find((c) => c.id === currentCategoryId)?.parentId
    : undefined

  const [type, setType] = useState<'expense' | 'income'>(seedType)
  const [parentId, setParentId] = useState<string | undefined>(initialParentId)
  const [isEditMode, setIsEditMode] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null)
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null)
  const isLocked = isAddCategory || changingIndex !== null

  const categoriesWithTransactions = useMemo<Set<string>>(() => {
    const result = new Set<string>()
    for (const tx of transactions) {
      for (const item of tx.items) {
        result.add(item.categoryId)
      }
    }

    return result
  }, [transactions])

  const activeThisMonth = useMemo<Set<string>>(() => {
    const active = new Set<string>()

    for (const tx of transactions) {
      if (!isCurrentMonth(tx.date)) {
        continue
      }
      for (const item of tx.items) {
        let id: string | undefined = item.categoryId
        while (id) {
          if (active.has(id)) {
            break
          }
          active.add(id)
          id = categories.find((c) => c.id === id)?.parentId
        }
      }
    }

    return active
  }, [transactions, categories])

  const visible = sortBy(
    categories.filter((c) => c.type === type && c.parentId === parentId),
    (category) => category.position ?? Infinity,
  )
  const parent = parentId
    ? categories.find((c) => c.id === parentId)
    : undefined

  function onTypeChange(newType: TransactionType) {
    if (newType === 'transfer') {
      navigate('/transaction/new?type=transfer', { state: { fromCategorySelection: true } })

      return
    }
    if (newType !== 'adjustment') {
      setType(newType)
      setParentId(undefined)
    }
  }

  function onBack() {
    if (parentId) {
      setParentId(parent?.parentId)
    } else {
      backNavigate(-1)
    }
  }

  function onEditParent() {
    if (isEditMode && parentId) {
      navigate(`/transaction/category/edit/${parentId}`)
    }
  }

  function onAddCategory() {
    const params = new URLSearchParams({ type })
    if (parentId) {
      params.set('parentId', parentId)
    }
    navigate(`/transaction/category/new?${params.toString()}`)
  }

  function onSelect(category: Category) {
    if (isEditMode) {
      const hasChildren = categories.some((c) => c.parentId === category.id)
      if (hasChildren) {
        setParentId(category.id)
      } else {
        navigate(`/transaction/category/edit/${category.id}`)
      }

      return
    }

    const hasChildren = categories.some((c) => c.parentId === category.id)
    if (hasChildren) {
      setParentId(category.id)

      return
    }

    if (draft && (changingIndex !== null || isAddCategory)) {
      if (changingIndex !== null) {
        const newItems = draft.items.map((item, i) =>
          i === changingIndex
            ? { ...item, categoryId: category.id }
            : item)
        updateDraft({ items: newItems, focusedIndex: changingIndex })
      } else {
        const newIndex = draft.items.length
        updateDraft({ items: [...draft.items, { categoryId: category.id, amount: 0 }], focusedIndex: newIndex })
      }
      backNavigate(-1)

      return
    }

    navigate(`/transaction/new?type=${type}&categoryId=${category.id}`, { state: { fromCategorySelection: true } })
  }

  function onRequestDelete(categoryId: string) {
    const transactions = useTransactionStore.getState().items
    const hasTransactions = transactions.some((t) =>
      t.items.some((item) => item.categoryId === categoryId))
    if (hasTransactions) {
      setMergeSourceId(categoryId)
    } else {
      setConfirmDeleteId(categoryId)
    }
  }

  async function onConfirmDelete() {
    if (!confirmDeleteId) {
      return
    }
    await useCategoryStore.getState().remove(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  function onCancelDelete() {
    setConfirmDeleteId(null)
  }

  function onSelectMergeTarget(targetId: string) {
    setMergeTargetId(targetId)
  }

  async function onConfirmMerge() {
    if (!mergeSourceId || !mergeTargetId) {
      return
    }
    await useCategoryStore.getState().mergeAndDelete(mergeSourceId, mergeTargetId)
    await useTransactionStore.getState().load()
    setMergeSourceId(null)
    setMergeTargetId(null)
  }

  function onCancelMerge() {
    setMergeSourceId(null)
    setMergeTargetId(null)
  }

  return {
    type,
    isLocked,
    isEditMode,
    visible,
    parentId,
    parent,
    categories,
    activeThisMonth,
    categoriesWithTransactions,
    confirmDeleteId,
    mergeSourceId,
    mergeTargetId,
    onTypeChange,
    onBack,
    onSelect,
    onToggleEditMode: () => setIsEditMode((prev) => !prev),
    onEditParent,
    onAddCategory,
    onRequestDelete,
    onConfirmDelete,
    onCancelDelete,
    onSelectMergeTarget,
    onConfirmMerge,
    onCancelMerge,
    onReorder: (ids: string[]) => useCategoryStore.getState().reorder(ids),
    onReparent: (id: string, newParentId: string | undefined) =>
      useCategoryStore.getState().reparent(id, newParentId),
  }
}
