import cx from 'classnames'

import { Icon } from '@/components'
import { formatSignedAmount } from '@/lib'
import type { Category, TransactionItem } from '@/types/domain'

export interface CategoryItemsCardProps {
  items: TransactionItem[]
  focusedIndex: number | null
  currency: string
  onFocus: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onChangeCategory: (index: number) => void
  findCategory: (id: string) => Category | undefined
}

function formatFocusedAmount(amount: number): string {
  if (!Number.isFinite(amount)) {
    return ''
  }

  return Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

export function CategoryItemsCard({
  items,
  focusedIndex,
  currency,
  onFocus,
  onAdd,
  onRemove,
  onChangeCategory,
  findCategory,
}: CategoryItemsCardProps) {
  return (
    <>
      {items.map((item, index) => {
        const category = findCategory(item.categoryId)
        const isFocused = focusedIndex === index

        return (
          <div
            key={`${item.categoryId}-${index}`}
            className={cx(
              'flex items-center border-b border-white/4 last:border-b-0',
              { 'bg-accent/6': isFocused },
            )}
          >
            <button
              aria-label="Change category"
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3"
              onClick={() => onChangeCategory(index)}
            >
              <Icon name={category?.icon ?? 'fa-ellipsis'} className="shrink-0 text-sm text-accent-light" />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold">{category?.name ?? 'Unknown'}</p>
                <p className="truncate text-xs text-white/30">{parent?.name ?? ''}</p>
              </div>
            </button>

            <button
              type="button"
              className="shrink-0 px-2 py-3 text-sm font-bold text-danger"
              onClick={() => onFocus(index)}
            >
              {isFocused
                ? formatFocusedAmount(item.amount)
                : formatSignedAmount(item.amount, currency)}
            </button>

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

      <button
        aria-label="Add Category"
        onClick={onAdd}
        type="button"
        className={[
          'flex w-full items-center justify-end',
          'border-t border-dashed border-white/8 px-4 py-3 text-accent-light',
        ].join(' ')}
      >
        <Icon name="fa-plus" className="text-base" />
      </button>
    </>
  )
}
