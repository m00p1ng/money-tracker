import { TypePickerDropdown } from '@/components'
import { PageHeader } from '@/components/shared/PageHeader'
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
  return (
    <PageHeader
      title={
        <TypePickerDropdown
          value={type}
          onChange={(value) => onChangeType(value as TransactionType)}
        />
      }
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
