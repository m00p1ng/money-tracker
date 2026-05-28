import cx from 'classnames'

import { formatDatetimeLocalDisplay } from '@/lib'
import type { TransactionStatus } from '@/types/domain'

interface DateTimeRowProps {
  date: string
  status: TransactionStatus
  variant?: 'standalone' | 'flat'
  showStatus?: boolean
  onClick: () => void
  onToggleStatus: () => void
}

const statusBadgeStyle: Record<TransactionStatus, { border: string; bg: string; text: string; label: string }> = {
  paid: {
    border: 'border-green-500/20',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    label: 'Paid',
  },
  overdue: {
    border: 'border-danger/20',
    bg: 'bg-danger/10',
    text: 'text-danger',
    label: 'Overdue',
  },
  planned: {
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    label: 'Planned',
  },
}

export function DateTimeRow({
  date,
  status,
  variant = 'standalone',
  showStatus = true,
  onClick,
  onToggleStatus,
}: DateTimeRowProps) {
  const badge = statusBadgeStyle[status]

  return (
    <div
      className={cx(
        'flex w-full items-center gap-2 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/[0.04]',
      )}
    >
      <button
        aria-label="Date & Time"
        className="min-w-0 flex-1 px-1 text-left"
        onClick={onClick}
        type="button"
      >
        <span className={cx('block font-medium leading-tight', showStatus
          ? badge.text
          : 'text-white')}>
          {formatDatetimeLocalDisplay(date)}
        </span>
      </button>
      {showStatus && (
        <button
          type="button"
          aria-label={`Status: ${badge.label}`}
          className={cx(
            'shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide',
            'transition-colors duration-150',
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
      )}
    </div>
  )
}
