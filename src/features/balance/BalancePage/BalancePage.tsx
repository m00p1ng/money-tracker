import {
  Icon,
  AnimatedBar,
  SectionDivider,
} from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

import { WalletRow } from './WalletRow'

export type WalletWithAmount = {
  wallet: Wallet;
  amount: number;
}

export type BalancePageProps = {
  paymentWallets: WalletWithAmount[]
  creditCards: WalletWithAmount[]
  assets: number
  debt: number
}

export function BalancePage({
  paymentWallets,
  creditCards,
  assets,
  debt,
}: BalancePageProps) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Balance</h1>
      </header>

      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-income">
              <Icon name="fa-arrow-trend-up" />
              Assets
            </span>
            <span className="text-xs font-semibold text-income">{formatAmount(assets)}</span>
          </div>
          <AnimatedBar
            value={assets}
            maxValue={assets}
            colorFrom="#10b981"
            colorTo="#6ee7b7"
            textColor="#052e16"
            currency=""
            delay={0.1}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
              <Icon name="fa-credit-card" />
              Debt
            </span>
            <span className="text-xs font-semibold text-amber-400">
              {formatAmount(debt)}
            </span>
          </div>
          {debt > 0 && (
            <AnimatedBar
              value={debt}
              maxValue={assets}
              colorFrom="#f59e0b"
              colorTo="#fde047"
              textColor="#451a03"
              currency=""
              delay={0.2}
            />
          )}
          {debt === 0 && <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/4" />}
        </div>
      </div>

      {paymentWallets.length > 0 && (
        <section>
          <SectionDivider label="Payment Accounts" />
          {paymentWallets.map(({ wallet, amount }) => (
            <WalletRow key={wallet.id} wallet={wallet} amount={amount} />
          ))}
        </section>
      )}

      {creditCards.length > 0 && (
        <section>
          <SectionDivider label="Credit Cards" />
          {creditCards.map(({ wallet, amount }) => (
            <WalletRow key={wallet.id} wallet={wallet} amount={amount} />
          ))}
        </section>
      )}
    </div>
  )
}
