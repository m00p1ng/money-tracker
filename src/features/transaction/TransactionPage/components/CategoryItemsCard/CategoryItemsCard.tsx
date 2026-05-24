import cx from 'classnames'

import { Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Category, TransactionItem } from '@/types/domain'

export interface CategoryItemsCardProps {
  items: TransactionItem[]
  focusedIndex: number | null
  onFocus: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onChangeCategory: (index: number) => void
  findCategory: (id: string) => Category | undefined
}

export function CategoryItemsCard({
  items,
  focusedIndex,
  onFocus,
  onAdd,
  onRemove,
  onChangeCategory,
  findCategory,
}: CategoryItemsCardProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/4">
      {/* Header — label only, no add button */}
      <div className="flex items-center border-b border-white/5 px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-[1px] text-white/35">Items</span>
      </div>

      {items.map((item, index) => {
        const category = findCategory(item.categoryId)
        const isFocused = focusedIndex === index
        return (
          <div
            key={`${item.categoryId}-${index}`}
            className={cx(
              'flex items-center border-b border-white/4 last:border-b-0',
              { 'bg-(--accent)/6': isFocused },
            )}
          >
            {/* Left zone: tap to change category */}
            <button
              aria-label="Change category"
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3"
              onClick={() => onChangeCategory(index)}
            >
              <div className={[
                'flex h-8 w-8 shrink-0 items-center justify-center',
                'rounded-[9px] bg-(--accent)/15 text-sm text-accent-light',
              ].join(' ')}>
                <Icon name={category?.icon ?? 'fa-ellipsis'} />
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold">{category?.name ?? 'Unknown'}</p>
                <p className="truncate text-xs text-white/30">{parent?.name ?? ''}</p>
              </div>
            </button>

            {/* Right zone: tap to focus for keyboard */}
            <button
              type="button"
              className="shrink-0 px-2 py-3 text-sm font-bold text-danger"
              onClick={() => onFocus(index)}
            >
              {formatAmount(item.amount)}
            </button>

            {/* Remove: only when more than one item */}
            {items.length > 1 && (
              <button
                aria-label="Remove category"
                className={[
                  'mr-4 flex h-6 w-6 shrink-0 items-center justify-center',
                  'rounded-md bg-danger/10 text-[10px] text-danger',
                ].join(' ')}
                type="button"
                onClick={() => onRemove(index)}
              >
                <Icon name="fa-xmark" />
              </button>
            )}
          </div>
        )
      })}

      {/* Add Category button — inside list, above total */}
      <button
        aria-label="Add Category"
        onClick={onAdd}
        type="button"
        className={[
          'flex w-full items-center justify-center gap-2',
          'border-t border-dashed border-white/8 py-3 text-[12px] font-semibold text-accent-light',
        ].join(' ')}
      >
        <Icon name="fa-plus" className="text-[10px]" /> Add Item
      </button>

      {/* Total */}
      <div className={[
        'flex items-center justify-between border-t',
        'border-(--accent)/15 bg-(--accent)/6 px-4 py-2.5',
      ].join(' ')}>
        <span className="text-[12px] uppercase tracking-[1px] text-white/40">Total</span>
        <span className="text-lg font-bold">{formatAmount(total)}</span>
      </div>
    </div>
  )
}
