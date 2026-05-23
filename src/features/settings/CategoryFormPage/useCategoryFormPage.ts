import { useNavigate, useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useCategoryStore } from '@/stores'
import type { Category } from '@/types/domain'

export function useCategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const existing = useCategoryStore((state) => (id ? state.findById(id) : undefined))
  const categories = useCategoryStore((state) => state.items)
  const add = useCategoryStore((state) => state.add)
  const update = useCategoryStore((state) => state.update)
  const remove = useCategoryStore((state) => state.remove)

  async function onSubmit(form: Category, setError: (err: string | null) => void) {
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    if (form.parentId) {
      const parent = categories.find((c) => c.id === form.parentId)
      if (parent && parent.type !== form.type) {
        setError('Category type must match parent type')
        return
      }
    }
    try {
      await (existing ? update(form) : add(form))
      navigate('/settings/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save category')
    }
  }

  async function onDelete(setError: (err: string | null) => void) {
    if (!existing) {
      return
    }
    try {
      await remove(existing.id)
      navigate('/settings/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete category')
    }
  }

  return {
    existing,
    categories,
    onBack: () => backNavigate('/settings/categories'),
    onSubmit,
    onDelete,
  }
}
