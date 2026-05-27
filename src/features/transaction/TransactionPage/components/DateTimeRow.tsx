import cx from 'classnames'

import { Icon } from '@/components'
import { formatDatetimeLocalDisplay } from '@/lib'
import type { TransactionStatus } from '@/types/domain'

interface DateTimeRowProps {
  date: string
  status: TransactionStatus
  variant?: 'standalone' | 'flat'
  onClick: () => void
  onToggleStatus: () => void
}

const statusBadgeStyle: Record<TransactionStatus, { border: string; bg: string; text: string; label: string }> = {
  paid: {
    border: 'border-green-500/25',
    bg: 'bg-green-500/12',
    text: 'text-green-400',
    label: 'Paid',
  },
  overdue: {
    border: 'border-danger/25',
    bg: 'bg-danger/12',
    text: 'text-danger',
    label: 'Overdue',
  },
  planned: {
    border: 'border-amber-400/25',
    bg: 'bg-amber-400/12',
    text: 'text-amber-400',
    label: 'Planned',
  },
}

export function DateTimeRow({
  date,
  status,
  variant = 'standalone',
  onClick,
  onToggleStatus,
}: DateTimeRowProps) {
  const badge = statusBadgeStyle[status]

  return (
    <button
      aria-label="Date & Time"
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      onClick={onClick}
      type="button"
    >
      <span className={[
        'flex h-10 w-10 shrink-0 items-center justify-center',
        'rounded-xl bg-accent/15 text-accent text-xs',
      ].join(' ')}>
        <Icon name="fa-calendar" />
      </span>
      <span className="min-w-0 flex-1 px-1">
        <span className="block font-medium">{formatDatetimeLocalDisplay(date)}</span>
      </span>
      <button
        type="button"
        aria-label={`Status: ${badge.label}`}
        className={cx(
          'shrink-0 rounded-lg border px-2.5 py-1 text-sm font-bold',
          badge.border,
          badge.bg,
          badge.text,
        )}
        onClick={(e) => {
          e.stopPropagation()
          onToggleStatus()
        }}
      >
        {badge.label}
      </button>
    </button>
  )
}
