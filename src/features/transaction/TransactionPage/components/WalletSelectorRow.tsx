import cx from 'classnames'

import { Icon } from '@/components'
import { formatSignedAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface WalletSelectorRowProps {
  ariaLabel: string
  wallet: Wallet | undefined
  currency: string
  fallbackName: string
  showBalance?: boolean
  variant?: 'standalone' | 'flat'
  onClick: () => void
}

export function WalletSelectorRow({
  ariaLabel,
  wallet,
  currency,
  fallbackName,
  showBalance = false,
  variant = 'standalone',
  onClick,
}: WalletSelectorRowProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={cx(
        'flex w-full items-center gap-1 px-4 py-2 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      onClick={onClick}
      type="button"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center text-lg text-slate-500">
        <Icon name={wallet?.icon ?? 'fa-wallet'} />
      </span>
      <div className="min-w-0 flex-1 px-1">
        <p className="truncate font-medium">
          {wallet?.name ?? fallbackName}
          {showBalance
            ? ` · ${formatSignedAmount(wallet?.balance ?? 0, wallet?.currency ?? currency)}`
            : ''}
        </p>
      </div>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
