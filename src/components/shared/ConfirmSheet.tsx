import { BottomSheet } from '@/components/shared/BottomSheet'
import { Button } from '@/components/shared/Button'

type ConfirmSheetProps = {
  isOpen: boolean
  title: string
  description?: string
  primaryLabel: string
  primaryVariant?: 'danger' | 'accent'
  onPrimary: () => void
  onCancel: () => void
}

export function ConfirmSheet({
  isOpen,
  title,
  description,
  primaryLabel,
  primaryVariant = 'danger',
  onPrimary,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onCancel} title={title}>
      {description && (
        <p className="px-5 pb-3 text-center text-sm text-white/50">{description}</p>
      )}
      <div className="flex flex-col gap-2 px-5">
        <Button variant={primaryVariant} fullWidth onClick={onPrimary}>
          {primaryLabel}
        </Button>
        <Button variant="ghost" fullWidth onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </BottomSheet>
  )
}
