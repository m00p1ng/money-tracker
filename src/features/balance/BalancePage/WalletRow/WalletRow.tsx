import { Link } from 'react-router'

import { Icon, Card } from '@/components'
import { hexToRgba, formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

export interface WalletRowProps {
  wallet: Wallet
  amount: number
}

export function WalletRow({ wallet, amount }: WalletRowProps) {
  return (
    <Link to={`/balance/wallet/${wallet.id}`}>
      <Card className="mb-3 flex items-center gap-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: hexToRgba(wallet.color, 0.15), color: wallet.color }}
        >
          <Icon name={wallet.icon} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{wallet.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-white/35">
            {formatAmount(amount, wallet.currency)}
          </p>
        </div>
        <Icon name="fa-chevron-right" className="shrink-0 text-xs text-white/20" />
      </Card>
    </Link>
  )
}
