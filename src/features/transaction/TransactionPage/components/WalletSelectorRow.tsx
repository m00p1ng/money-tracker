import cx from 'classnames'

import { Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface WalletSelectorRowProps {
  ariaLabel: string
  wallet: Wallet | undefined
  fallbackName: string
  fallbackColor: string
  showBalance?: boolean
  variant?: 'standalone' | 'flat'
  onClick: () => void
}

export function WalletSelectorRow({
  ariaLabel,
  wallet,
  fallbackName,
  fallbackColor,
  showBalance = false,
  variant = 'standalone',
  onClick,
}: WalletSelectorRowProps) {
  const color = wallet?.color ?? fallbackColor

  return (
    <button
      aria-label={ariaLabel}
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon name={wallet?.icon ?? 'fa-wallet'} className="shrink-0 text-sm" style={{ color }} />
      <div className="min-w-0 flex-1 px-1">
        <p className="truncate font-medium">
          {wallet?.name ?? fallbackName}
          {showBalance
            ? ` · ${formatAmount(wallet?.balance ?? 0, wallet?.currency)}`
            : ''}
        </p>
      </div>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
