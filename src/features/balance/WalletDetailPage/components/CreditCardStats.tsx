import { AnimatedBar, Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

export type CreditCardStatsProps = {
  wallet: Wallet
  currentAmount: number
  clearedAmount: number
  reconciliation: boolean
}

export function CreditCardStats({
  wallet, currentAmount, clearedAmount, reconciliation,
}: CreditCardStatsProps) {
  const creditLimit = wallet.creditLimit!
  const creditUsedRatio = Math.min((currentAmount / creditLimit) * 100, 100)

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/30">Debt</p>
          <p className="mt-1 text-sm font-bold text-expense">{formatAmount(currentAmount, wallet.currency)}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/30">Available</p>
          <p className="mt-1 text-sm font-bold text-income">
            {formatAmount(creditLimit - currentAmount, wallet.currency)}
          </p>
        </div>
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/30">Limit</p>
          <p className="mt-1 text-sm font-bold text-white/55">
            {formatAmount(creditLimit, wallet.currency)}
          </p>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1.5 flex justify-between text-[11px] text-white/35">
          <span>Used {creditUsedRatio.toFixed(1)}%</span>
          <span className="text-expense">
            {formatAmount(currentAmount, wallet.currency)} / {formatAmount(creditLimit, wallet.currency)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-1.5 rounded-full bg-linear-to-r from-red-400 to-orange-400"
            style={{ width: `${creditUsedRatio}%` }}
          />
        </div>
      </div>
      {reconciliation && (
        <div className="px-3 pb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-xs uppercase tracking-wide"
              style={{ color: 'var(--accent-light)' }}
            >
              <Icon name="fa-circle-check" />
              Cleared Debt
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>
              {formatAmount(clearedAmount, wallet.currency)}
            </span>
          </div>
          <AnimatedBar
            value={clearedAmount}
            maxValue={currentAmount || 1}
            colorFrom="#6c47ff"
            colorTo="#9b7dff"
            textColor="#1a1030"
            currency={wallet.currency}
            delay={0.3}
          />
          {currentAmount !== clearedAmount && (
            <p className="mt-1 text-[11px] text-white/40">
              {formatAmount(currentAmount - clearedAmount, wallet.currency)} uncleared
            </p>
          )}
        </div>
      )}
    </>
  )
}
