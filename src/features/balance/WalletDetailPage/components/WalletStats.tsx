import { AnimatedBar, Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

export type WalletStatsProps = {
  wallet: Wallet
  currentAmount: number
  clearedAmount: number
  totalExpenses: number
  reconciliation: boolean
}

export function WalletStats({ wallet, currentAmount, clearedAmount, totalExpenses, reconciliation }: WalletStatsProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-income">
            <Icon name="fa-wallet" />
            Balance
          </span>
          <span className="text-xs font-semibold text-income">
            {formatAmount(currentAmount, wallet.currency)}
          </span>
        </div>
        <AnimatedBar
          value={currentAmount}
          maxValue={currentAmount}
          colorFrom="#10b981"
          colorTo="#6ee7b7"
          textColor="#052e16"
          currency={wallet.currency}
          delay={0.1}
        />
      </div>
      {reconciliation && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-xs uppercase tracking-wide"
              style={{ color: 'var(--accent-light)' }}
            >
              <Icon name="fa-circle-check" />
              Cleared
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>
              {formatAmount(clearedAmount, wallet.currency)}
            </span>
          </div>
          <AnimatedBar
            value={clearedAmount}
            maxValue={currentAmount}
            colorFrom="#6c47ff"
            colorTo="#9b7dff"
            textColor="#1a1030"
            currency={wallet.currency}
            delay={0.2}
          />
          {currentAmount !== clearedAmount && (
            <p className="mt-1 text-[11px] text-white/40">
              {formatAmount(currentAmount - clearedAmount, wallet.currency)} uncleared
            </p>
          )}
        </div>
      )}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
            <Icon name="fa-arrow-down" />
            Expenses
          </span>
          <span className="text-xs font-semibold text-amber-400">
            {formatAmount(totalExpenses, wallet.currency)}
          </span>
        </div>
        {totalExpenses > 0 && (
          <AnimatedBar
            value={totalExpenses}
            maxValue={currentAmount}
            colorFrom="#f59e0b"
            colorTo="#fde047"
            textColor="#451a03"
            currency={wallet.currency}
            delay={0.3}
          />
        )}
        {totalExpenses === 0 && (
          <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/4" />
        )}
      </div>
    </div>
  )
}
