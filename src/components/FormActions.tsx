import { Button } from './Button'

interface FormActionsProps {
  submitLabel?: string
  deleteLabel?: string
  showDelete?: boolean
  onDelete?: () => void
}

export function FormActions({
  submitLabel = 'Save',
  deleteLabel = 'Delete',
  showDelete = false,
  onDelete,
}: FormActionsProps) {
  return (
    <div className="space-y-3">
      <Button fullWidth type="submit" variant="accent">{submitLabel}</Button>
      {showDelete
        ? (
          <Button fullWidth onClick={onDelete} type="button" variant="danger">{deleteLabel}</Button>
        )
        : null}
    </div>
  )
}
