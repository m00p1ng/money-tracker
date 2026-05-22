import { Icon } from '../../components/Icon'
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04]">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-[1px] text-white/35">Categories</span>
        <button onClick={onAdd} type="button" className="flex items-center gap-1 text-[11px] font-semibold text-accent-light">
          <Icon name="fa-plus" className="text-[10px]" /> Add
        </button>
      </div>

      {items.map((item, index) => {
        const category = findCategory(item.categoryId)
        const parent = category ? parentOf(category) : undefined
        const isFocused = focusedIndex === index
        return (
          <div
            key={`${item.categoryId}-${index}`}
            role="button"
            tabIndex={0}
            className={`flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-b-0 ${isFocused ? 'bg-[var(--accent)]/[0.06]' : ''}`}
            onClick={() => onFocus(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onFocus(index)
              }
            }}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-[var(--accent)]/15 text-sm text-accent-light">
              <Icon name={category?.icon ?? 'fa-ellipsis'} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{category?.name ?? 'Unknown'}</p>
              <p className="truncate text-[11px] text-white/30">{parent?.name ?? ''}</p>
            </div>
            <span className="flex-shrink-0 text-sm font-bold text-red-400">{formatAmount(item.amount)}</span>
            <button
              aria-label="Remove category"
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-red-500/10 text-[10px] text-red-400"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(index)
              }}
            >
              <Icon name="fa-xmark" />
            </button>
          </div>
        )
      })}

      <div className="flex items-center justify-between border-t border-[var(--accent)]/15 bg-[var(--accent)]/[0.06] px-4 py-2.5">
        <span className="text-[12px] uppercase tracking-[1px] text-white/40">Total</span>
        <span className="text-lg font-bold">{formatAmount(total)}</span>
      </div>
    </div>
  )
}
