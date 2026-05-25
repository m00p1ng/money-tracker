import { useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { useCategoryStore } from '@/stores'
import type { Category } from '@/types/domain'

export function useCategoryFormPage() {
  const { id } = useParams()
  const backNavigate = useBackNavigate()
  const existing = useCategoryStore((state) => (id
    ? state.findById(id)
    : undefined))
  const categories = useCategoryStore((state) => state.items)
  const add = useCategoryStore((state) => state.add)
  const update = useCategoryStore((state) => state.update)
  const remove = useCategoryStore((state) => state.remove)

  const {
    error, onSubmit, onDelete,
  } = useFormCrud<Category>({
    existing,
    add,
    update,
    remove: (item) => remove(item.id),
    navigateTo: '/settings/categories',
    validate: (form) => {
      if (!form.name.trim()) {
        return 'Name is required'
      }
      if (form.parentId) {
        const parent = categories.find((c) => c.id === form.parentId)
        if (parent && parent.type !== form.type) {
          return 'Category type must match parent type'
        }
      }

      return null
    },
  })

  return {
    existing,
    categories,
    error,
    onBack: () => backNavigate('/settings/categories'),
    onSubmit,
    onDelete,
  }
}
