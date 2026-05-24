import { Icon } from '@/components'
import { TypePickerDropdown } from '@/components/ui'
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
    <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
      <button
        aria-label="Back"
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
        type="button"
      >
        <Icon name="fa-chevron-left" />
      </button>
      <TypePickerDropdown
        value={type}
        onChange={(value) => onChangeType(value as TransactionType)}
      />
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
    </header>
  )
}
