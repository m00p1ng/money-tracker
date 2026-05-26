import { useState } from 'react'
import { Link } from 'react-router'

import { Icon } from '@/components'
import { formatShortDate, formatSignedAmount } from '@/lib'

type TransactionRowProps = {
  to: string
  icon: string
  title: string
  date: string | Date
  amount: number
  currency: string
  amountColor: string
  secondaryAmount?: number
  secondaryAmountCurrency?: string
  secondaryAmountColor?: string
}

function toDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00`)
    : new Date(value)
}

export function TransactionRow({
  to,
  icon,
  title,
  date: rawDate,
  amount,
  currency,
  amountColor,
  secondaryAmount,
  secondaryAmountCurrency,
  secondaryAmountColor,
}: TransactionRowProps) {
  const [now] = useState(() => new Date())
  const date = toDate(rawDate)
  const secondaryLabel = formatShortDate(date)
  const showSecondaryClock = date.getTime() > now.getTime()
  const formattedAmount = formatSignedAmount(amount, currency)
  const formattedSecondaryAmount = secondaryAmount !== undefined
    ? formatSignedAmount(secondaryAmount, secondaryAmountCurrency ?? currency)
    : undefined

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
        <span className="block truncate font-medium">{title}</span>
        <span className="flex items-center gap-1 truncate text-sm text-slate-500">
          {showSecondaryClock && (
            <Icon
              name="fa-clock"
              className="h-3 w-3 shrink-0"
            />
          )}
          <span className="truncate">{secondaryLabel}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className={`block font-semibold ${amountColor}`}>{formattedAmount}</span>
        {formattedSecondaryAmount && (
          <span className={`block text-xs ${secondaryAmountColor ?? 'text-white/28'}`}>{formattedSecondaryAmount}</span>
        )}
      </span>
    </Link>
  )
}
