import { useCategoryStore } from '@/stores'
import type { TransactionItem } from '@/types/domain'

import { CategoryItemsCard } from './CategoryItemsCard'

interface CategoryItemsCardContainerProps {
  items: TransactionItem[]
  focusedIndex: number | null
  currency: string
  onFocus: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onChangeCategory: (index: number) => void
}

export function CategoryItemsCardContainer(props: CategoryItemsCardContainerProps) {
  const findCategory = useCategoryStore((state) => state.findById)

  return <CategoryItemsCard {...props} findCategory={findCategory} />
}
