import cx from 'classnames'

interface NoteFieldProps {
  note: string
  variant?: 'standalone' | 'flat'
  onUpdateNote: (value: string) => void
  onFocusNoteField: () => void
}

export function NoteField({
  note,
  variant = 'standalone',
  onUpdateNote,
  onFocusNoteField,
}: NoteFieldProps) {
  return (
    <div className={cx(
      'flex items-start gap-3 px-4 py-3',
      variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/[0.04]',
    )}>
      <div className="min-w-0 flex-1">
        <textarea
          aria-label="Note"
          id="tx-note"
          className={[
            'min-h-16 w-full resize-none bg-transparent',
            'text-sm text-slate-100 outline-none placeholder:text-white/28',
          ].join(' ')}
          value={note}
          onChange={(event) => onUpdateNote(event.target.value)}
          onFocus={onFocusNoteField}
          placeholder="Add note…"
        />
      </div>
    </div>
  )
}
