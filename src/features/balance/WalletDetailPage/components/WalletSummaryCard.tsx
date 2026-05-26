import { formatSignedAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

type WalletSummaryCardProps = {
  wallet: Wallet
  currentAmount: number
  clearedAmount: number
}

export function WalletSummaryCard({
  wallet,
  currentAmount,
  clearedAmount,
}: WalletSummaryCardProps) {
  const isCredit = wallet.type === 'credit_card'

  return (
    <div>
      {isCredit
        ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Debt</span>
              <span className="font-medium text-red-400">
                {formatSignedAmount(Math.abs(currentAmount), wallet.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Cleared</span>
              <span className="font-medium text-white">
                {formatSignedAmount(Math.abs(clearedAmount), wallet.currency)}
              </span>
            </div>
            {wallet.creditLimit != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Available Balance</span>
                <span className="font-medium text-green-400">
                  {formatSignedAmount(wallet.creditLimit + currentAmount, wallet.currency)}
                </span>
              </div>
            )}
          </>
        )
        : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Balance</span>
              <span className="font-medium text-white">
                {formatSignedAmount(currentAmount, wallet.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Cleared</span>
              <span className="font-medium text-white">
                {formatSignedAmount(clearedAmount, wallet.currency)}
              </span>
            </div>
          </>
        )}
    </div>
  )
}
