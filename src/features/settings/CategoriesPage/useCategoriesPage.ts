import { useMemo, useState } from 'react'

import { useBackNavigate } from '@/context/navigationDirection'
import { useCategoryStore } from '@/stores'
import type { TransactionType } from '@/types/domain'

export function useCategoriesPage() {
  const categories = useCategoryStore((state) => state.items)
  const backNavigate = useBackNavigate()
  const [activeType, setActiveType] = useState<TransactionType>('expense')

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  )

  const filteredCategories = useMemo(
    () => rootCategories.filter((c) => c.type === activeType),
    [rootCategories, activeType],
  )

  const subCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const root of rootCategories) {
      map[root.id] = categories.filter((c) => c.parentId === root.id).length
    }

    return map
  }, [rootCategories, categories])

  return {
    categories: filteredCategories,
    subCountMap,
    activeType,
    onChangeType: setActiveType,
    onBack: () => backNavigate('/settings'),
  }
}
