import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { formatAmount } from '../../lib/format'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import { assetsTotal, debtTotal, walletCurrentAmount } from './balanceCalculations'

export function BalancePage() {
  const wallets = useWalletStore((state) => state.items)
  const transactions = useTransactionStore((state) => state.items)
  const paymentWallets = wallets.filter((wallet) => wallet.type === 'payment')
  const creditCards = wallets.filter((wallet) => wallet.type === 'credit_card')
  const assets = assetsTotal(wallets, transactions)
  const debt = debtTotal(wallets, transactions)

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-slate-400">Accounts</p>
        <h1 className="text-2xl font-semibold">Balance</h1>
      </header>

      <Card className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm text-slate-300">
            <span>Assets</span>
            <span>{formatAmount(assets)}</span>
          </div>
          <div className="h-8 rounded-lg bg-emerald-400/15">
            <div className="flex h-full w-full items-center rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-300 px-3 text-sm font-semibold text-emerald-950">{formatAmount(assets)}</div>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm text-slate-300">
            <span>Debt</span>
            <span>{formatAmount(debt)}</span>
          </div>
          <div className="h-8 rounded-lg bg-red-400/15">
            <div className="flex h-full items-center rounded-lg bg-gradient-to-r from-amber-500 to-red-400 px-3 text-sm font-semibold text-red-950" style={{ width: `${assets > 0 ? Math.min((debt / assets) * 100, 100) : debt > 0 ? 100 : 0}%` }}>
              {formatAmount(debt)}
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Payment Accounts</h2>
        {paymentWallets.length === 0 ? <Card className="text-sm text-slate-400">No payment accounts yet.</Card> : null}
        {paymentWallets.map((wallet) => (
          <Link key={wallet.id} to={`/balance/wallet/${wallet.id}`}>
            <Card className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{wallet.name}</p>
                <p className="text-xs text-slate-400">{wallet.currency} payment</p>
              </div>
              <p className="font-semibold text-emerald-300">{formatAmount(walletCurrentAmount(wallet, transactions), wallet.currency)}</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Credit Cards</h2>
        {creditCards.length === 0 ? <Card className="text-sm text-slate-400">No credit cards yet.</Card> : null}
        {creditCards.map((wallet) => (
          <Link key={wallet.id} to={`/balance/wallet/${wallet.id}`}>
            <Card className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{wallet.name}</p>
                <p className="text-xs text-slate-400">{wallet.creditLimit ? `Limit ${formatAmount(wallet.creditLimit, wallet.currency)}` : `${wallet.currency} credit card`}</p>
              </div>
              <p className="font-semibold text-red-300">{formatAmount(walletCurrentAmount(wallet, transactions), wallet.currency)}</p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
