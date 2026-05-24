import { Icon } from '@/components'

interface NoteFieldProps {
  note: string
  onUpdateNote: (value: string) => void
  onFocusNoteField: () => void
}

export function NoteField({
  note,
  onUpdateNote,
  onFocusNoteField,
}: NoteFieldProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/4 px-4 py-3">
      <div className={[
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center',
        'rounded-xl bg-white/[0.07] text-slate-400 text-xs',
      ].join(' ')}>
        <Icon name="fa-pen-to-square" />
      </div>
      <div className="min-w-0 flex-1">
        <label className="text-[11px] text-white/35" htmlFor="tx-note">Note</label>
        <textarea
          aria-label="Note"
          id="tx-note"
          className={[
            'mt-0.5 min-h-16 w-full resize-none bg-transparent',
            'text-sm text-slate-100 outline-none placeholder:text-white/30',
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
