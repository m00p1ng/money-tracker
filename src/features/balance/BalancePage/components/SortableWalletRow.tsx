import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Icon } from '@/components'
import { formatSignedAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface SortableWalletRowProps {
  wallet: Wallet
  amount: number
  onEdit: (id: string) => void
}

export function SortableWalletRow({
  wallet, amount, onEdit,
}: SortableWalletRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: wallet.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging
      ? 0.5
      : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 border-b border-white/5 px-4 py-3.5 last:border-b-0 active:bg-white/3"
      {...attributes}
      onClick={() => onEdit(wallet.id)}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm text-slate-500"
      >
        <Icon name={wallet.icon} style={{ height: 40 }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium">{wallet.name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-white/55">
        <span className="text-sm font-semibold">
          {formatSignedAmount(amount, wallet.currency)}
        </span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label="Drag to reorder"
          className="touch-none p-1"
          onClick={(e) => e.stopPropagation()}
          {...listeners}
        >
          <Icon name="fa-bars" className="text-base text-white/25" />
        </button>
      </div>
    </div>
  )
}
