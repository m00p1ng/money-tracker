
import { useCategoryStore } from '@/stores'

import type { CategoryItemsCardProps } from './CategoryItemsCard'

type UseCategoryItemsCardProps = Pick<
  CategoryItemsCardProps,
  'items' | 'focusedIndex' | 'onFocus' | 'onAdd' | 'onRemove' | 'onChangeCategory'
>

export function useCategoryItemsCard(props: UseCategoryItemsCardProps): CategoryItemsCardProps {
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)

  return {
    ...props,
    findCategory,
    parentOf,
  }
}
