import { useState } from 'react'
import {
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { createId } from '@/lib'
import { useCategoryStore } from '@/stores'
import type {
  Category,
  TransactionType,
} from '@/types/domain'

import type { CategoryEditPageProps } from './CategoryEditPage'

export function useCategoryEditPage(): CategoryEditPageProps | null {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const backNavigate = useBackNavigate()
  const findById = useCategoryStore((state) => state.findById)
  const add = useCategoryStore((state) => state.add)
  const update = useCategoryStore((state) => state.update)

  const existing = id
    ? findById(id)
    : undefined
  const parentId = searchParams.get('parentId') ?? undefined
  const parent = parentId
    ? findById(parentId)
    : undefined
  const newType = (searchParams.get('type') as TransactionType | null) ?? parent?.type ?? 'expense'
  const [newCategoryId] = useState(() => createId())
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(existing?.name ?? '')
  const [icon, setIcon] = useState(existing?.icon ?? 'fa-circle')

  if (id && !existing) {
    return null
  }

  async function onBack() {
    if (!name.trim()) {
      backNavigate(-1)

      return
    }

    const category: Category = existing
      ? {
        ...existing,
        name: name.trim(),
        icon,
      }
      : {
        id: newCategoryId,
        name: name.trim(),
        type: parent?.type ?? newType,
        parentId: parent?.id,
        level: (parent
          ? parent.level + 1
          : 1) as Category['level'],
        icon,
        isDefault: false,
      }

    try {
      await (existing
        ? update(category)
        : add(category))
      backNavigate(-1)
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to save category')
    }
  }

  return {
    form: { name, icon },
    title: existing
      ? 'Edit Category'
      : 'New Category',
    error,
    onChangeName: setName,
    onChangeIcon: setIcon,
    onBack,
  }
}
