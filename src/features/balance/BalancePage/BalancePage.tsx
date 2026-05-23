import cx from 'classnames'
import { Link } from 'react-router'

import {
  Icon,
  AnimatedBar,
  SectionDivider,
  Card,
} from '@/components'
import { hexToRgba, formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface WalletRowProps {
  wallet: Wallet
  amount: number
}

function WalletRow({ wallet, amount }: WalletRowProps) {
  const isCredit = wallet.type === 'credit_card'
  return (
    <Link to={`/balance/wallet/${wallet.id}`}>
      <Card className="mb-3 flex items-center gap-3.5">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: hexToRgba(wallet.color, 0.15), color: wallet.color }}
        >
          <Icon name={wallet.icon} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{wallet.name}</p>
          <p className="mt-0.5 text-xs text-white/35">
            {isCredit
              ? wallet.creditLimit
                ? `Limit ${formatAmount(wallet.creditLimit, wallet.currency)}`
                : `${wallet.currency} credit card`
              : `${wallet.currency} payment`}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className={cx('text-sm font-bold', isCredit ? 'text-expense' : 'text-income')}>
            {formatAmount(amount, wallet.currency)}
          </p>
          <p className="mt-0.5 text-xs text-white/30">{wallet.currency}</p>
        </div>
        <Icon name="fa-chevron-right" className="flex-shrink-0 text-xs text-white/20" />
      </Card>
    </Link>
  )
}

export type WalletWithAmount = { wallet: Wallet; amount: number }

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
            <span className="text-xs font-semibold text-amber-400">{formatAmount(debt)}</span>
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
          {debt === 0 && <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]" />}
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
