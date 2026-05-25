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
      <div className={[
        'flex h-8 w-8 shrink-0 items-center justify-center',
        'rounded-xl bg-amber-400/15 text-amber-400 text-xs',
      ].join(' ')}>
        <Icon name="fa-arrow-right-arrow-left" />
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-white/35">{label}</p>
        <input
          aria-label={label}
          className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-white/30"
          inputMode="decimal"
          placeholder={defaultRate || 'Enter rate…'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
