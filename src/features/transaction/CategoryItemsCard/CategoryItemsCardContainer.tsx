import type { TransactionItem } from '@/types/domain'

import { CategoryItemsCard } from './CategoryItemsCard'
import { useCategoryItemsCard } from './useCategoryItemsCard'

interface CategoryItemsCardContainerProps {
  items: TransactionItem[]
  focusedIndex: number | null
  onFocus: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onChangeCategory: (index: number) => void
}

export function CategoryItemsCardContainer(props: CategoryItemsCardContainerProps) {
  const cardProps = useCategoryItemsCard(props)
  return <CategoryItemsCard {...cardProps} />
}
