import cx from 'classnames'

import { Icon } from '@/components'
import { formatFocusedAmount, formatSignedAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface AdjustmentPrimaryCardProps {
  wallet: Wallet | undefined
  adjustmentAmount: number
  currency: string
  isAmountFocused: boolean
  onWalletClick: () => void
  onAmountClick: () => void
}

export function AdjustmentPrimaryCard({
  wallet,
  adjustmentAmount,
  currency,
  isAmountFocused,
  onWalletClick,
  onAmountClick,
}: AdjustmentPrimaryCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8.5 bg-white/8">
      <div
        className={cx(
          'flex items-center transition-colors',
          isAmountFocused
            ? 'bg-accent/6'
            : '',
        )}
      >
        <button
          aria-label="Wallet"
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2"
          onClick={onWalletClick}
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ color: '#63758F' }}
          >
            <Icon name={wallet?.icon ?? 'fa-wallet'} style={{ height: 40 }} />
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold">
              {wallet?.name ?? 'Cash'}
            </p>
          </div>
        </button>

        <button
          type="button"
          className="shrink-0 px-4 py-3 text-sm font-bold text-accent-light"
          onClick={(e) => {
            e.stopPropagation()
            onAmountClick()
          }}
        >
          {isAmountFocused
            ? formatFocusedAmount(adjustmentAmount)
            : formatSignedAmount(adjustmentAmount, currency)}
        </button>
      </div>
    </div>
  )
}
