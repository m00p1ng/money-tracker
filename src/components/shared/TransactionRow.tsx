import { Link } from 'react-router'

import { Icon } from '@/components'

type TransactionRowProps = {
  to: string
  icon: string
  iconBg: string
  iconColor: string
  primaryLabel: string
  secondaryLabel: string
  amount: string
  amountColor: string
}

export function TransactionRow({
  to,
  icon,
  iconBg,
  iconColor,
  primaryLabel,
  secondaryLabel,
  amount,
  amountColor,
}: TransactionRowProps) {
  return (
    <Link
      to={to}
      className={[
        'flex items-center gap-3 rounded-2xl border border-white/6 bg-white/4',
        'px-4 py-3.5 backdrop-blur transition-[background,box-shadow]',
        'hover:bg-accent/8 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]',
      ].join(' ')}
      style={{ display: 'flex', transform: 'translateX(0)' }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <Icon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{primaryLabel}</span>
        <span className="block truncate text-sm text-slate-500">{secondaryLabel}</span>
      </span>
      <span className={`font-semibold ${amountColor}`}>{amount}</span>
    </Link>
  )
}
