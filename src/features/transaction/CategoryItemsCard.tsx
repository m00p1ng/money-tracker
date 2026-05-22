import { Icon } from '../../components/Icon'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatAmount } from '../../lib/format'
import { useCategoryStore } from '../../stores/categoryStore'
import type { TransactionItem } from '../../types/domain'

export function CategoryItemsCard({
  items,
  focusedIndex,
  onFocus,
  onAdd,
  onRemove,
}: {
  items: TransactionItem[]
  focusedIndex: number
  onFocus: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Categories</h2>
        <Button onClick={onAdd} type="button">+ Add</Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => {
          const category = findCategory(item.categoryId)
          const parent = category ? parentOf(category) : undefined
          return (
            <button key={`${item.categoryId}-${index}`} className={`flex w-full items-center gap-3 rounded-lg border-l-2 px-2 py-3 text-left ${focusedIndex === index ? 'border-accent bg-white/8' : 'border-transparent bg-transparent'}`} onClick={() => onFocus(index)} type="button">
              <Icon name={category?.icon ?? 'fa-ellipsis'} className="text-accent-light" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{category?.name ?? 'Unknown'}</span>
                <span className="block truncate text-sm text-slate-500">{parent?.name ?? ''}</span>
              </span>
              <span className="font-semibold">{formatAmount(item.amount)}</span>
              <span role="button" tabIndex={0} className="text-slate-500" onClick={(event) => { event.stopPropagation(); onRemove(index) }}>
                <Icon name="fa-xmark" />
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex justify-between border-t border-white/10 pt-3 font-semibold">
        <span>Total</span>
        <span>{formatAmount(total)}</span>
      </div>
    </Card>
  )
}
