import { useBackNavigate } from '@/context/navigationDirection'
import { useCategoryStore } from '@/stores'

export function useCategoriesPage() {
  const categories = useCategoryStore((state) => state.items)
  const rootCategories = categories.filter((category) => !category.parentId)
  const backNavigate = useBackNavigate()

  return {
    rootCategories,
    onBack: () => backNavigate('/settings'),
  }
}
