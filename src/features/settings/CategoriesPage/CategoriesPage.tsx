import {
  AddRow,
  ListGroup,
  ListRow,
  PageHeader,
  TypePickerDropdown,
} from '@/components'
import { hexToRgba } from '@/lib'
import type { Category, TransactionType } from '@/types/domain'

interface CategoriesPageProps {
  categories: Category[]
  subCountMap: Record<string, number>
  activeType: TransactionType
  onChangeType: (type: TransactionType) => void
  onBack: () => void
}

export function CategoriesPage({
  categories,
  subCountMap,
  activeType,
  onChangeType,
  onBack,
}: CategoriesPageProps) {
  const typeLabel = activeType.charAt(0).toUpperCase() + activeType.slice(1)

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          <TypePickerDropdown
            value={activeType}
            onChange={(value) => onChangeType(value as TransactionType)}
          />
        }
        onBack={onBack}
      />
      <ListGroup label={`${typeLabel} Categories`}>
        {categories.map((category) => {
          const count = subCountMap[category.id] ?? 0
          return (
            <ListRow
              key={category.id}
              icon={category.icon}
              iconBg={hexToRgba(category.color, 0.15)}
              iconColor={category.color}
              label={category.name}
              sub={count > 0 ? `${count} sub-categories` : 'No sub-categories'}
              to={`/settings/categories/${category.id}`}
            />
          )
        })}
        <AddRow
          label={`Add ${typeLabel} Category`}
          to={`/settings/categories/new?type=${activeType}`}
        />
      </ListGroup>
    </div>
  )
}
