import cx from 'classnames'

import { Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface AdjustmentPrimaryCardProps {
  wallet: Wallet | undefined
  targetBalance: number
  currency: string
  isAmountFocused: boolean
  onWalletClick: () => void
  onAmountClick: () => void
}

export function AdjustmentPrimaryCard({
  wallet,
  targetBalance,
  currency,
  isAmountFocused,
  onWalletClick,
  onAmountClick,
}: AdjustmentPrimaryCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8.5 bg-white/8">
      <button
        aria-label="Wallet"
        type="button"
        className="flex w-full items-center gap-1 px-4 py-2 text-left"
        onClick={onWalletClick}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center text-lg" style={{ color: '#63758F' }}>
          <Icon name={wallet?.icon ?? 'fa-wallet'} />
        </span>
        <div className="min-w-0 flex-1 px-1">
          <p className="truncate font-medium">{wallet?.name ?? 'Cash'}</p>
        </div>
        <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
      </button>

      <button
        type="button"
        className={cx(
          'flex w-full items-center justify-between border-t px-4 py-3 transition-colors',
          isAmountFocused
            ? 'border-accent/40 bg-accent/20'
            : 'border-accent/20 bg-accent/10',
        )}
        onClick={(e) => {
          e.stopPropagation()
          onAmountClick()
        }}
      >
        <span className="text-[9px] uppercase tracking-[1px] text-white/40">Target Balance</span>
        <span className="text-xl font-bold text-accent-light">
          {formatAmount(targetBalance)}
          <span className="ml-1.5 text-[10px] font-normal opacity-50">{currency}</span>
        </span>
      </button>
    </div>
  )
}
