import cx from 'classnames'

import { Icon } from '@/components'
import { formatDatetimeLocalDisplay } from '@/lib'

interface DateTimeRowProps {
  date: string
  isPlanned: boolean
  variant?: 'standalone' | 'flat'
  onClick: () => void
}

export function DateTimeRow({
  date,
  isPlanned,
  variant = 'standalone',
  onClick,
}: DateTimeRowProps) {
  return (
    <button
      aria-label="Date & Time"
      className={cx(
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      onClick={onClick}
      type="button"
    >
      <div className={[
        'flex h-8 w-8 shrink-0 items-center justify-center',
        'rounded-xl bg-accent/15 text-accent text-xs',
      ].join(' ')}>
        <Icon name="fa-calendar" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/35">Date & Time</p>
        <p className="mt-0.5 text-sm font-medium">{formatDatetimeLocalDisplay(date)}</p>
      </div>
      {isPlanned && (
        <div className={[
          'flex items-center gap-1.5 rounded-lg border border-amber-400/25',
          'bg-amber-400/12 px-2.5 py-1 text-sm font-bold text-amber-400',
        ].join(' ')}>
          <Icon name="fa-clock" className="text-xs" />
          Planned
        </div>
      )}
    </button>
  )
}
