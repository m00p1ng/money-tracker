import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Icon } from '@/components'
import { hexToRgba } from '@/lib'
import type { Wallet } from '@/types/domain'

interface SortableWalletRowProps {
  wallet: Wallet
  onEdit: (id: string) => void
}

export function SortableWalletRow({ wallet, onEdit }: SortableWalletRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: wallet.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 border-b border-white/5 last:border-b-0"
    >
      <button
        type="button"
        onClick={() => onEdit(wallet.id)}
        className="flex flex-1 items-center gap-1 px-4 py-3.5 active:bg-white/3"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm"
          style={{ background: hexToRgba(wallet.color, 0.15), color: wallet.color }}
        >
          <Icon name={wallet.icon} style={{ height: 40 }} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-base font-medium">{wallet.name}</p>
          <p className="mt-0.5 text-sm text-white/35">
            {wallet.type === 'credit_card' ? 'Credit Card' : 'Payment Account'}
          </p>
        </div>
      </button>
      <button
        type="button"
        className="flex h-12 w-12 shrink-0 items-center justify-center text-white/30 active:text-white/60"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <Icon name="fa-grip-lines" />
      </button>
    </div>
  )
}
