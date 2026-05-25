import type { RepeatConfig } from '@/types/domain'

import { DateTimeRow } from './DateTimeRow'
import { NoteField } from './NoteField'
import { ReconciliationRow } from './ReconciliationRow'
import { RepeatRow } from './RepeatRow'

interface TransactionDetailsCardProps {
  date: string
  isPlanned: boolean
  walletReconciliationEnabled: boolean
  cleared: boolean
  repeatConfig: RepeatConfig
  note: string
  onUpdateDate: () => void
  onToggleCleared: () => void
  onUpdateRepeatConfig: () => void
  onUpdateNote: (value: string) => void
  onFocusNoteField: () => void
}

export function TransactionDetailsCard({
  date,
  isPlanned,
  walletReconciliationEnabled,
  cleared,
  repeatConfig,
  note,
  onUpdateDate,
  onToggleCleared,
  onUpdateRepeatConfig,
  onUpdateNote,
  onFocusNoteField,
}: TransactionDetailsCardProps) {
  return (
    <div>
      <p className="mb-1.5 px-0.5 text-[9px] uppercase tracking-[1.5px] text-white/20">Details</p>
      <div className={[
        'divide-y divide-white/[0.05] overflow-hidden',
        'rounded-2xl border border-white/[0.07] bg-white/[0.04]',
      ].join(' ')}>
        <DateTimeRow date={date} isPlanned={isPlanned} variant="flat" onClick={onUpdateDate} />

        {!isPlanned && walletReconciliationEnabled && (
          <ReconciliationRow cleared={cleared} variant="flat" onToggle={onToggleCleared} />
        )}

        {isPlanned && (
          <RepeatRow repeatConfig={repeatConfig} variant="flat" onClick={onUpdateRepeatConfig} />
        )}

        <NoteField
          note={note}
          variant="flat"
          onUpdateNote={onUpdateNote}
          onFocusNoteField={onFocusNoteField}
        />
      </div>
    </div>
  )
}
