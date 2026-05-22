import { Link, useParams } from 'react-router'
import { Card } from '../../components/ui/Card'
import { getPresetRange } from '../../lib/dateRange'
import { formatAmount } from '../../lib/format'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import { walletCurrentAmount, walletRunningRows } from './balanceCalculations'

export function WalletDetailPage() {
  const { id } = useParams()
  const wallet = useWalletStore((state) => state.items.find((item) => item.id === id))
  const transactions = useTransactionStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const range = getPresetRange('this-month')

  if (!wallet) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Wallet not found</h1>
        <Link className="text-accent" to="/balance">Back to Balance</Link>
      </section>
    )
  }

  const rows = walletRunningRows(wallet, transactions, range)
  const currentAmount = walletCurrentAmount(wallet, transactions)

  return (
    <div className="space-y-5">
      <header>
        <Link className="text-sm text-accent" to="/balance">Back</Link>
        <p className="mt-3 text-sm text-slate-400">{wallet.type === 'credit_card' ? 'Credit Card' : 'Payment Account'}</p>
        <h1 className="text-2xl font-semibold">{wallet.name}</h1>
      </header>

      <Card>
        <p className="text-sm text-slate-400">{wallet.type === 'credit_card' ? 'Current Debt' : 'Current Balance'}</p>
        <p className={`mt-1 text-3xl font-semibold ${wallet.type === 'credit_card' ? 'text-red-300' : 'text-emerald-300'}`}>{formatAmount(currentAmount, wallet.currency)}</p>
        {wallet.type === 'credit_card' && wallet.creditLimit ? <p className="mt-2 text-sm text-slate-400">Available {formatAmount(wallet.creditLimit - currentAmount, wallet.currency)} of {formatAmount(wallet.creditLimit, wallet.currency)}</p> : null}
      </Card>

      <Card className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Begin</p>
          <p>{range.start}</p>
        </div>
        <div>
          <p className="text-slate-400">End</p>
          <p>{range.end}</p>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Transactions</h2>
        {rows.length === 0 ? <Card className="text-sm text-slate-400">No transactions in this range.</Card> : null}
        {rows.map((row) => {
          const category = categories.find((item) => item.id === row.transaction.items[0]?.categoryId)
          return (
            <Card key={row.transaction.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{category?.name ?? row.transaction.type}</p>
                <p className="text-xs text-slate-400">{new Date(row.transaction.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={row.amount >= 0 ? 'text-emerald-300' : 'text-red-300'}>{formatAmount(Math.abs(row.amount), wallet.currency)}</p>
                <p className="text-xs text-slate-400">Run {formatAmount(row.runningAmount, wallet.currency)}</p>
              </div>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
