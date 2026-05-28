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
      'flex items-center gap-3 px-4 py-3',
      variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/[0.04]',
    )}>
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center',
          'rounded-xl text-amber-400 text-sm',
        ].join(' ')}
        style={{ background: 'color-mix(in srgb, #f59e0b 12%, transparent)' }}
      >
        <Icon name="fa-arrow-right-arrow-left" />
      </div>
      <div className="flex-1 px-1">
        <input
          aria-label={label}
          className="w-full bg-transparent font-medium outline-none placeholder:text-white/28"
          inputMode="decimal"
          placeholder={defaultRate || 'Enter rate…'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
