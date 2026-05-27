import cx from 'classnames'

import { Icon } from '@/components'

interface ExchangeRateRowProps {
  label: string
  value: string
  defaultRate: string
  variant?: 'standalone' | 'flat'
  onChange: (value: string) => void
}

export function ExchangeRateRow({
  label,
  value,
  defaultRate,
  variant = 'standalone',
  onChange,
}: ExchangeRateRowProps) {
  return (
    <div className={cx(
      'flex items-center gap-1 px-4 py-3',
      variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
    )}>
      <div className={[
        'flex h-10 w-10 shrink-0 items-center justify-center',
        'rounded-xl bg-amber-400/15 text-amber-400 text-xs',
      ].join(' ')}>
        <Icon name="fa-arrow-right-arrow-left" />
      </div>
      <div className="flex-1 px-1">
        <input
          aria-label={label}
          className="w-full bg-transparent font-medium outline-none placeholder:text-white/30"
          inputMode="decimal"
          placeholder={defaultRate || 'Enter rate…'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
