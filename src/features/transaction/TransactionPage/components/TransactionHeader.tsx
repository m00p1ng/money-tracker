import { Icon, TypePickerDropdown } from '@/components'
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
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))',
            boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
          type="button"
        >
          <Icon name="fa-check" />
        </button>
      }
    />
  )
}
