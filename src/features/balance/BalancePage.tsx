import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { Card } from '../../components/ui/Card'
import { formatAmount } from '../../lib/format'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import { assetsTotal, debtTotal, walletCurrentAmount } from './balanceCalculations'
import type { Wallet } from '../../types/domain'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function WalletRow({ wallet, amount }: { wallet: Wallet; amount: number }) {
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
          <p className={`text-sm font-bold ${isCredit ? 'text-red-300' : 'text-emerald-300'}`}>
            {formatAmount(amount, wallet.currency)}
          </p>
          <p className="mt-0.5 text-xs text-white/30">{wallet.currency}</p>
        </div>
        <Icon name="fa-chevron-right" className="flex-shrink-0 text-xs text-white/20" />
      </Card>
    </Link>
  )
}

export function BalancePage() {
  const wallets = useWalletStore((state) => state.items)
  const transactions = useTransactionStore((state) => state.items)
  const paymentWallets = wallets.filter((wallet) => wallet.type === 'payment')
  const creditCards = wallets.filter((wallet) => wallet.type === 'credit_card')
  const assets = assetsTotal(wallets, transactions)
  const debt = debtTotal(wallets, transactions)
  const debtWidth = assets > 0 ? Math.min((debt / assets) * 100, 100) : debt > 0 ? 100 : 0

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Balance</h1>
      </header>

      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-emerald-400">
              <Icon name="fa-arrow-trend-up" />
              Assets
            </span>
            <span className="text-xs font-semibold text-emerald-400">{formatAmount(assets)}</span>
          </div>
          <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
            <motion.div
              className="flex h-full items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-300 px-4 text-base font-bold text-emerald-950"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}
            >
              {formatAmount(assets)}
            </motion.div>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
              <Icon name="fa-credit-card" />
              Debt
            </span>
            <span className="text-xs font-semibold text-amber-400">{formatAmount(debt)}</span>
          </div>
          <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
            {debt > 0 && (
              <motion.div
                className="flex h-full items-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-4 text-base font-bold text-amber-950"
                style={{ minWidth: '5rem' }}
                initial={{ width: 0 }}
                animate={{ width: `${debtWidth}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }}
              >
                {formatAmount(debt)}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {paymentWallets.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Payment Accounts</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          {paymentWallets.map((wallet) => (
            <WalletRow key={wallet.id} wallet={wallet} amount={walletCurrentAmount(wallet, transactions)} />
          ))}
        </section>
      )}

      {creditCards.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Credit Cards</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          {creditCards.map((wallet) => (
            <WalletRow key={wallet.id} wallet={wallet} amount={walletCurrentAmount(wallet, transactions)} />
          ))}
        </section>
      )}
    </div>
  )
}
