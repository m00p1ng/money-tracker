import type { RepeatConfig, TransactionStatus } from '@/types/domain'

import { DateTimeRow } from './DateTimeRow'
import { NoteField } from './NoteField'
import { ReconciliationRow } from './ReconciliationRow'
import { RepeatRow } from './RepeatRow'

interface TransactionDetailsCardProps {
  date: string
  status: TransactionStatus
  walletReconciliationEnabled: boolean
  cleared: boolean
  repeatConfig: RepeatConfig
  note: string
  onUpdateDate: () => void
  onToggleStatus: () => void
  onToggleCleared: () => void
  onUpdateRepeatConfig: () => void
  onUpdateNote: (value: string) => void
  onFocusNoteField: () => void
}

export function TransactionDetailsCard({
  date,
  status,
  walletReconciliationEnabled,
  cleared,
  repeatConfig,
  note,
  onUpdateDate,
  onToggleStatus,
  onToggleCleared,
  onUpdateRepeatConfig,
  onUpdateNote,
  onFocusNoteField,
}: TransactionDetailsCardProps) {
  return (
    <div className={[
      'divide-y divide-white/5 overflow-hidden',
      'rounded-2xl border border-white/[0.07] bg-white/4',
    ].join(' ')}>
      <DateTimeRow
        date={date}
        status={status}
        variant="flat"
        onClick={onUpdateDate}
        onToggleStatus={onToggleStatus}
      />

      {status === 'paid' && walletReconciliationEnabled && (
        <ReconciliationRow cleared={cleared} variant="flat" onToggle={onToggleCleared} />
      )}

      {status !== 'paid' && (
        <RepeatRow repeatConfig={repeatConfig} variant="flat" onClick={onUpdateRepeatConfig} />
      )}

      <NoteField
        note={note}
        variant="flat"
        onUpdateNote={onUpdateNote}
        onFocusNoteField={onFocusNoteField}
      />
    </div>
  )
}
