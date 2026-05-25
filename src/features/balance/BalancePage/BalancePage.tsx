import {
  AnimatedBar,
  Icon,
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
  const maxBarValue = Math.max(assets, debt)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Balance</h1>
      </header>

      <div className="space-y-3">
        <AnimatedBar
          value={assets}
          maxValue={maxBarValue}
          colorFrom="var(--income)"
          colorTo="var(--income)"
          textColor="var(--income-text)"
          currency=""
          delay={0.1}
        />
        <AnimatedBar
          value={debt}
          maxValue={maxBarValue}
          colorFrom="var(--expense)"
          colorTo="var(--expense)"
          textColor="var(--expense-text)"
          currency=""
          delay={0.2}
        />
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
