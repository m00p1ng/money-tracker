import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { formatAmount } from '../../lib/format'
import { useWalletStore } from '../../stores/walletStore'

export function WalletsPage() {
  const wallets = useWalletStore((state) => state.items)
  const payments = wallets.filter((wallet) => wallet.type === 'payment')
  const cards = wallets.filter((wallet) => wallet.type === 'credit_card')

  return (
    <div className="space-y-5">
      <header>
        <Link className="text-sm text-accent" to="/settings">Back</Link>
        <h1 className="mt-3 text-2xl font-semibold">Wallets</h1>
      </header>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Payment Accounts</h2>
        {payments.map((wallet) => (
          <Link key={wallet.id} to={`/settings/wallets/${wallet.id}`}>
            <Card className="mb-3 flex items-center justify-between"><span>{wallet.name}</span><span className="text-sm text-slate-400">{formatAmount(wallet.balance, wallet.currency)} ›</span></Card>
          </Link>
        ))}
        <Link className="block text-accent" to="/settings/wallets/new?type=payment">+ Add Payment Account</Link>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Credit Cards</h2>
        {cards.map((wallet) => (
          <Link key={wallet.id} to={`/settings/wallets/${wallet.id}`}>
            <Card className="mb-3 flex items-center justify-between"><span>{wallet.name}</span><span className="text-sm text-slate-400">{wallet.creditLimit ? formatAmount(wallet.creditLimit, wallet.currency) : wallet.currency} ›</span></Card>
          </Link>
        ))}
        <Link className="block text-accent" to="/settings/wallets/new?type=credit_card">+ Add Credit Card</Link>
      </section>
    </div>
  )
}
