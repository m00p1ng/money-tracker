import { PageHeader, TransactionTypeDropdown } from '@/components'
import type { TransactionType } from '@/types/domain'

interface TransactionHeaderProps {
  type: TransactionType
  onChangeType: (value: TransactionType) => void
  onBack: () => void
  onSave: () => Promise<void>
}

export function TransactionHeader({
  type,
  onChangeType,
  onBack,
  onSave,
}: TransactionHeaderProps) {
  const title = type === 'adjustment'
    ? <span className="font-semibold">Balance Adjustment</span>
    : (
      <TransactionTypeDropdown
        value={type}
        onChange={(value) => onChangeType(value as TransactionType)}
      />
    )

  return (
    <PageHeader
      title={title}
      onBack={onBack}
      rightSlot={
        <button
          aria-label="Save"
          onClick={onSave}
          className="flex h-9 w-9 items-center justify-center rounded-xl active:bg-white/5"
          style={{ color: 'var(--accent-light)' }}
          type="button"
        >
          Save
        </button>
      }
    />
  )
}
