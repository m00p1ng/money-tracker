import { Link } from 'react-router'

import { Icon } from '@/components'

type TransactionRowProps = {
  to: string
  icon: string
  primaryLabel: string
  secondaryLabel: string
  amount: string
  amountColor: string
  secondaryAmount?: string
  secondaryAmountColor?: string
}

export function TransactionRow({
  to,
  icon,
  primaryLabel,
  secondaryLabel,
  amount,
  amountColor,
  secondaryAmount,
  secondaryAmountColor,
}: TransactionRowProps) {
  return (
    <Link
      to={to}
      className={[
        'flex items-center gap-1 rounded-2xl border border-white/6 bg-white/4',
        'px-3 py-3 backdrop-blur transition-[background,box-shadow]',
        'hover:bg-accent/8 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_15%,transparent)]',
      ].join(' ')}
      style={{ display: 'flex', transform: 'translateX(0)' }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ color: '#63758F' }}
      >
        <Icon name={icon} style={{ height: 40 }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{primaryLabel}</span>
        <span className="block truncate text-sm text-slate-500">{secondaryLabel}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className={`block font-semibold ${amountColor}`}>{amount}</span>
        {secondaryAmount && (
          <span className={`block text-xs ${secondaryAmountColor ?? 'text-white/28'}`}>{secondaryAmount}</span>
        )}
      </span>
    </Link>
  )
}
